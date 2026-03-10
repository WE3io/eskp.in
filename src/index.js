require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./db/connection');
const { constructEvent } = require('./services/payments');
const { sendHelperIntroById } = require('./services/platform');
const { suppressEmail } = require('./services/email-suppression');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Cloudflare proxy for accurate IP rate limiting
app.set('trust proxy', 1);

// Stripe webhook — registered BEFORE express.json() so req.body is raw Buffer
// express.raw() is applied inline as route middleware; express.json() never sees this request
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = constructEvent(req.body, sig);
  } catch (err) {
    console.error('Stripe signature failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type === 'checkout.session.completed') {
    const { goal_id, match_id } = event.data.object.metadata || {};
    if (goal_id && match_id) {
      try {
        await sendHelperIntroById(goal_id, match_id);
      } catch (err) {
        console.error('sendHelperIntroById failed:', err);
        return res.status(500).json({ error: 'internal error' });
      }
    }
  }

  res.json({ received: true });
});

// TSK-051: Resend bounce/complaint webhook — registered BEFORE express.json() for raw body access
// Signature verification uses Svix HMAC-SHA256 protocol (same as Resend uses internally).
// Set RESEND_WEBHOOK_SECRET in .env from the Resend dashboard (Webhooks → signing secret).
app.post('/webhooks/resend', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (secret) {
    const msgId        = req.headers['svix-id'] || '';
    const msgTimestamp = req.headers['svix-timestamp'] || '';
    const msgSignature = req.headers['svix-signature'] || '';

    // Reject requests older than 5 minutes (replay attack mitigation)
    const ts = parseInt(msgTimestamp, 10);
    if (!ts || Math.abs(Date.now() / 1000 - ts) > 300) {
      return res.status(400).json({ error: 'Timestamp out of range' });
    }

    try {
      // Decode the whsec_ prefixed base64 secret
      const keyBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
      const signed = `${msgId}.${msgTimestamp}.${req.body.toString()}`;
      const computed = crypto.createHmac('sha256', keyBytes).update(signed).digest('base64');
      // svix-signature may contain multiple space-separated "vN,<sig>" values
      const valid = msgSignature.split(' ').some(part => {
        const [, sig] = part.split(',');
        return sig && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(computed));
      });
      if (!valid) {
        console.warn('Resend webhook: invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch (err) {
      console.error('Resend webhook signature check error:', err.message);
      return res.status(400).json({ error: 'Signature verification failed' });
    }
  } else {
    // No secret configured — only allow in development
    if (process.env.NODE_ENV === 'production') {
      console.error('Resend webhook: RESEND_WEBHOOK_SECRET not set in production');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { type, data } = event;
  console.log(`Resend webhook: received event ${type}`);

  if (type === 'email.bounced') {
    const email = data?.to?.[0] || data?.email_to?.[0];
    if (email) {
      await suppressEmail(email, 'bounce').catch(err =>
        console.error('Failed to suppress bounced email:', err.message)
      );
    }
  } else if (type === 'email.complained') {
    const email = data?.to?.[0] || data?.email_to?.[0];
    if (email) {
      await suppressEmail(email, 'complaint').catch(err =>
        console.error('Failed to suppress complained email:', err.message)
      );
    }
  }

  res.json({ received: true });
});

// Body size limit for all other routes
app.use(express.json({ limit: '50kb' }));

// Global rate limit: 60 requests/min/IP across all routes
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
}));

// Health check
app.get('/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok', db: 'connected', ts: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// API routes
app.use('/goals', require('./api/goals'));
app.use('/webhooks', require('./api/webhooks'));
app.use('/account', require('./api/account'));

// TSK-094: match quality feedback — 1-click rating link from follow-up email
// GET /api/match-feedback?t=TOKEN&r=RATING (1–5)
// Returns HTML (not JSON) — loaded directly in browser from email link click.
app.get('/api/match-feedback', async (req, res) => {
  const { t: token, r: ratingStr } = req.query;
  const rating = parseInt(ratingStr, 10);

  if (!token || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).send(feedbackPage('Invalid feedback link.', false));
  }

  try {
    const { pool } = require('./db/connection');
    const { rows } = await pool.query(
      `SELECT id, user_rating FROM matches WHERE feedback_token = $1`,
      [token]
    );
    if (rows.length === 0) {
      return res.status(404).send(feedbackPage('This feedback link is not recognised.', false));
    }
    if (rows[0].user_rating !== null) {
      return res.send(feedbackPage('Your feedback has already been recorded — thank you.', true));
    }
    await pool.query(
      `UPDATE matches SET user_rating = $1, user_rated_at = NOW() WHERE id = $2`,
      [rating, rows[0].id]
    );
    const message = rating >= 4
      ? 'Great — glad the match was helpful.'
      : rating >= 3
        ? 'Thanks for letting us know. We\'ll use this to improve.'
        : 'Sorry the match didn\'t work out. We\'ll use this to do better.';
    return res.send(feedbackPage(message, true));
  } catch (err) {
    console.error('/api/match-feedback error:', err.message);
    return res.status(500).send(feedbackPage('Something went wrong. Please try again.', false));
  }
});

function feedbackPage(message, success) {
  const colour = success ? '#3a7d44' : '#C4622D';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Feedback — eskp.in</title>
<style>body{font-family:system-ui,sans-serif;background:#F9F6F0;color:#2C2420;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.card{background:#fff;border-radius:8px;padding:40px 48px;max-width:420px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.08);}
h1{font-size:1.4rem;margin:0 0 12px;color:${colour};}
p{color:#5a504c;margin:0 0 24px;line-height:1.5;}
a{color:#C4622D;text-decoration:none;font-weight:500;}</style>
</head><body><div class="card">
<h1>${success ? '✓ Feedback recorded' : 'Feedback'}</h1>
<p>${message}</p>
<a href="https://eskp.in">← Back to eskp.in</a>
</div></body></html>`;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Platform running on port ${PORT}`);
});
