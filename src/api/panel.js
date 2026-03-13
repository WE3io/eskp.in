/**
 * Panel API routes — Phase 2 advisory panel infrastructure.
 *
 * Thread isolation: requirePanelSession middleware enforces that every
 * request is scoped to the authenticated panel member's own data.
 * No request can access another member's thread.
 */
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const {
  createPanelInvitation,
  validateInvitationToken,
  completeOnboardingAndAccept,
  declinePanelInvitation,
  validateSession,
  getDashboardData,
  getThreadData,
  flagForSupport,
} = require('../services/panel');

const router = express.Router();

const COOKIE_NAME = 'panel_session';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

// Tighter rate limit for panel endpoints
const panelLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});
router.use(panelLimit);

// ---------------------------------------------------------------------------
// Session middleware
// ---------------------------------------------------------------------------

async function requirePanelSession(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  const panelMember = await validateSession(token).catch(() => null);
  if (!panelMember) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Session required' });
    }
    return res.redirect('/panel/login');
  }
  req.panelMember = panelMember;
  next();
}

// ---------------------------------------------------------------------------
// cookie-parser is needed for req.cookies — inline fallback
// ---------------------------------------------------------------------------

router.use((req, res, next) => {
  // If cookie-parser is not mounted globally, parse cookies inline
  if (!req.cookies) {
    req.cookies = {};
    const raw = req.headers.cookie || '';
    raw.split(';').forEach(part => {
      const [key, ...vals] = part.trim().split('=');
      if (key) req.cookies[key.trim()] = decodeURIComponent(vals.join('=').trim());
    });
  }
  next();
});

// ---------------------------------------------------------------------------
// Invitation routes (unauthenticated)
// ---------------------------------------------------------------------------

/**
 * POST /panel/invite
 * Invite an advisor to a goal.
 * Body: { goalId, email, name?, roleLabel?, roleCharterText?, note? }
 * Requires: X-User-Id header (internal — set by upstream auth middleware once implemented)
 * For now, accepts userId from body for Phase 2 bootstrap.
 */
router.post('/invite', express.json({ limit: '16kb' }), async (req, res) => {
  const { goalId, email, name, roleLabel, roleCharterText, note, userId } = req.body;

  if (!goalId || !email || !userId) {
    return res.status(400).json({ error: 'goalId, email, and userId are required' });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const result = await createPanelInvitation(goalId, userId, { email, name, roleLabel, roleCharterText, note });
    res.json({ success: true, panelMemberId: result.panelMember.id });
  } catch (err) {
    const status = err.status || 500;
    console.error('POST /panel/invite error:', err.message);
    res.status(status).json({ error: status === 403 ? 'Not authorised' : 'Failed to send invitation' });
  }
});

/**
 * GET /panel/invite/accept?t=TOKEN
 * Validates token; redirects to onboarding page if valid.
 */
router.get('/invite/accept', async (req, res) => {
  const { t: token } = req.query;
  if (!token) return res.status(400).send(simpleHtmlPage('Invalid link', 'This invitation link is not valid.'));

  try {
    const { valid, reason, alreadyAccepted } = await validateInvitationToken(token);
    if (!valid) {
      const messages = {
        not_found: 'This invitation link was not recognised.',
        expired: 'This invitation link has expired. Please ask the person who invited you to send a new one.',
        declined: 'This invitation has already been declined.',
      };
      return res.status(400).send(simpleHtmlPage('Invitation link', messages[reason] || 'This invitation is not valid.'));
    }
    if (alreadyAccepted) {
      return res.redirect('/panel/dashboard');
    }
    // Redirect to onboarding (which handles actual acceptance)
    return res.redirect(`/panel/onboarding?t=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('GET /panel/invite/accept error:', err.message);
    res.status(500).send(simpleHtmlPage('Error', 'Something went wrong. Please try again.'));
  }
});

/**
 * GET /panel/invite/decline?t=TOKEN
 * Declines invitation; shows confirmation.
 */
router.get('/invite/decline', async (req, res) => {
  const { t: token } = req.query;
  if (!token) return res.status(400).send(simpleHtmlPage('Invalid link', 'This link is not valid.'));

  try {
    await declinePanelInvitation(token);
    res.send(simpleHtmlPage('Invitation declined', "You've declined the invitation. No further emails will be sent about this.", true));
  } catch (err) {
    console.error('GET /panel/invite/decline error:', err.message);
    res.status(500).send(simpleHtmlPage('Error', 'Something went wrong. Please try again.'));
  }
});

// ---------------------------------------------------------------------------
// Onboarding routes (unauthenticated — token in query)
// ---------------------------------------------------------------------------

/**
 * GET /panel/onboarding?t=TOKEN
 * Serve the onboarding HTML page after validating the token.
 */
router.get('/onboarding', async (req, res) => {
  const { t: token } = req.query;
  if (!token) return res.status(400).send(simpleHtmlPage('Invalid link', 'This invitation link is not valid.'));

  try {
    const { valid, reason } = await validateInvitationToken(token);
    if (!valid) {
      const messages = {
        not_found: 'This invitation link was not recognised.',
        expired: 'This invitation link has expired.',
        declined: 'This invitation has already been declined.',
      };
      return res.status(400).send(simpleHtmlPage('Invitation link', messages[reason] || 'This invitation is not valid.'));
    }
    // Serve the static onboarding page
    res.sendFile(path.join(__dirname, '../../public/panel/onboarding.html'));
  } catch (err) {
    console.error('GET /panel/onboarding error:', err.message);
    res.status(500).send(simpleHtmlPage('Error', 'Something went wrong. Please try again.'));
  }
});

/**
 * POST /panel/onboarding/complete?t=TOKEN
 * Marks onboarding complete, accepts invitation, creates session, redirects to dashboard.
 */
router.post('/onboarding/complete', express.urlencoded({ extended: false }), async (req, res) => {
  const { t: token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token required' });

  try {
    const { sessionToken } = await completeOnboardingAndAccept(token);
    res
      .cookie(COOKIE_NAME, sessionToken, COOKIE_OPTS)
      .redirect('/panel/dashboard');
  } catch (err) {
    const status = err.status || 500;
    console.error('POST /panel/onboarding/complete error:', err.message);
    res.status(status).send(simpleHtmlPage('Error', err.message || 'Something went wrong. Please try again.'));
  }
});

// ---------------------------------------------------------------------------
// Authenticated dashboard + thread pages
// ---------------------------------------------------------------------------

/**
 * GET /panel/dashboard
 * Serve the dashboard HTML page.
 */
router.get('/dashboard', requirePanelSession, (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/panel/dashboard.html'));
});

/**
 * GET /panel/thread
 * Serve the thread HTML page.
 */
router.get('/thread', requirePanelSession, (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/panel/thread.html'));
});

// ---------------------------------------------------------------------------
// JSON API (authenticated)
// ---------------------------------------------------------------------------

/**
 * GET /panel/api/dashboard
 * Returns panel memberships for the authenticated panel member.
 */
router.get('/api/dashboard', requirePanelSession, async (req, res) => {
  try {
    const rows = await getDashboardData(req.panelMember.id);
    res.json(rows);
  } catch (err) {
    console.error('GET /panel/api/dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

/**
 * GET /panel/api/thread/:id
 * Returns thread data for a panel member. Strictly scoped to authenticated session.
 */
router.get('/api/thread/:id', requirePanelSession, async (req, res) => {
  try {
    const data = await getThreadData(req.params.id, req.panelMember.id);
    res.json(data);
  } catch (err) {
    const status = err.status || 500;
    console.error('GET /panel/api/thread/:id error:', err.message);
    res.status(status).json({ error: status === 403 ? 'Forbidden' : 'Failed to load thread' });
  }
});

/**
 * POST /panel/api/flag/:panelMemberId
 * Flag concern for support. Scoped to authenticated session.
 */
router.post('/api/flag/:panelMemberId', requirePanelSession, async (req, res) => {
  try {
    const result = await flagForSupport(req.params.panelMemberId, req.panelMember.id);
    res.json({ success: true, deduplicated: result.deduplicated });
  } catch (err) {
    const status = err.status || 500;
    console.error('POST /panel/api/flag/:panelMemberId error:', err.message);
    res.status(status).json({ error: status === 403 ? 'Forbidden' : 'Failed to process request' });
  }
});

/**
 * GET /panel/login
 * Placeholder — magic link login not yet implemented.
 */
router.get('/login', (req, res) => {
  res.send(simpleHtmlPage('Panel login', 'Magic link login is not yet configured. Please use the link from your invitation email.'));
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function simpleHtmlPage(title, message, success = false) {
  const colour = success ? '#3a7d44' : '#C4622D';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — eskp.in</title>
<style>body{font-family:system-ui,sans-serif;background:#F9F6F0;color:#2C2420;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.card{background:#fff;border-radius:8px;padding:40px 48px;max-width:480px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.08);}
h1{font-size:1.4rem;margin:0 0 12px;color:${colour};}
p{color:#5a504c;margin:0 0 24px;line-height:1.5;}
a{color:#C4622D;text-decoration:none;font-weight:500;}</style>
</head><body><div class="card">
<h1>${title}</h1>
<p>${message}</p>
<a href="https://eskp.in">← Back to eskp.in</a>
</div></body></html>`;
}

module.exports = router;
