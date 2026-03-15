const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const logger = require('../logger');
const { processGoal, processGoalSensitive, processGoalManual, processClarification, closeGoal, recordInbound } = require('../services/platform');
const { isHelperApplication, processHelperApplication } = require('../services/helper-application');
const { detectHardExclusion, sendWarmReferral } = require('../services/hard-exclusion');
const { detectSensitiveDomain } = require('../services/sensitive-flag');
const { processExportRequest, requestDeletion } = require('../services/account');
const { parseReplyTo } = require('../services/email-reply-token');
const { pool } = require('../db/connection');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function verifySecret(req, res, next) {
  const provided = req.headers['x-webhook-secret'];
  if (!WEBHOOK_SECRET || provided !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

const feedbackLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded' },
});

// Per-sender rate limiter for inbound emails — prevents spam flooding
// Tracks send counts per domain per hour in memory (resets on restart, sufficient for spam defence)
const senderRateMap = new Map(); // domain -> [timestamps]
const EMAIL_SENDER_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_SENDER_MAX = 5; // max 5 emails per sender domain per hour

function checkSenderRateLimit(fromEmail) {
  const key = (fromEmail || '').toLowerCase().trim();
  const now = Date.now();
  const cutoff = now - EMAIL_SENDER_WINDOW_MS;
  const timestamps = (senderRateMap.get(key) || []).filter(t => t > cutoff);
  if (timestamps.length >= EMAIL_SENDER_MAX) {
    return false; // rate limited
  }
  timestamps.push(now);
  senderRateMap.set(key, timestamps);
  return true; // allowed
}

// Inbound email from Cloudflare Worker — protected by WEBHOOK_SECRET
router.post('/email', verifySecret, async (req, res) => {
  try {
    const { from, to, subject, text, raw } = req.body;

    if (!from || !text) {
      return res.status(400).json({ error: 'Missing from or text' });
    }

    // Enforce size limit on inbound email body
    if (typeof text !== 'string' || text.length > 50000) {
      return res.status(400).json({ error: 'Body too large or invalid' });
    }

    // Extract name from "Name <email>" format
    const nameMatch = from.match(/^(.+?)\s*<(.+?)>$/);
    const userName = nameMatch ? nameMatch[1].trim() : null;
    const userEmail = nameMatch ? nameMatch[2].trim() : from.trim();

    // Per-sender rate limit: drop repeated emails from same address (spam defence)
    if (!checkSenderRateLimit(userEmail)) {
      logger.warn({ from, subject }, 'inbound email: sender rate limit exceeded, dropping');
      return res.json({ ok: true, type: 'rate-limited' });
    }

    // Log the inbound email
    await recordInbound(from, to, subject, text, raw || {});

    // ── Priority route: reply-to token ────────────────────────────────────────
    // If the email was sent to a goal-specific reply address
    // (reply+{goalId}_{token}@mail.eskp.in), route it directly to that goal.
    // This takes precedence over all subject-based routing and prevents replies
    // from being misidentified as new goal submissions.
    const replyContext = parseReplyTo(to);
    if (replyContext.valid) {
      const { rows: [goal] } = await pool.query(
        'SELECT * FROM goals WHERE id = $1',
        [replyContext.goalId]
      );
      if (goal) {
        if (goal.status === 'pending_clarification') {
          await processClarification(userEmail, userName, text, goal);
          logger.info({ goalId: goal.id }, 'reply-token: clarification reply');
          return res.json({ ok: true, type: 'clarification-reply', goalId: goal.id });
        }
        // Close request: user replied "close" to any goal email
        if (/^\s*close\b/i.test(text.trim()) && !['closed', 'introduced', 'resolved'].includes(goal.status)) {
          await closeGoal(goal, userEmail, userName);
          return res.json({ ok: true, type: 'goal-closed', goalId: goal.id });
        }
        // For any other status (matched, introduced, etc.) log the reply
        // but do not create a new goal. Operator can review via email logs.
        logger.info({ goalId: goal.id, status: goal.status }, 'reply-token: inbound reply logged');
        return res.json({ ok: true, type: 'goal-reply', goalId: goal.id });
      }
      // Token valid but goal not found — fall through to subject routing
      logger.warn({ goalId: replyContext.goalId }, 'reply-token: valid token but goal not found, falling through');
    }

    // ── Subject-based routing (new submissions and explicit requests) ─────────
    const subjectLower = (subject || '').toLowerCase();

    // TSK-022: data export request
    if (/export|download|portability/.test(subjectLower) && /data|account|my info/.test(subjectLower)) {
      await processExportRequest(userEmail, userName);
      return res.json({ ok: true, type: 'export-request' });
    }

    // TSK-021: account deletion request
    if (/delete|erase|erasure|remove/.test(subjectLower) && /account|data|me|profile/.test(subjectLower)) {
      await requestDeletion(userEmail, userName);
      return res.json({ ok: true, type: 'deletion-request' });
    }

    if (isHelperApplication(subject)) {
      const result = await processHelperApplication(userEmail, userName, text);
      return res.json({ ok: true, type: 'helper-application', duplicate: result.duplicate || false });
    }

    // TSK-118: AI opt-out detection (Art 10.2.3(c) — algorithmic features must be opt-outable)
    // Matches: "no AI", "without AI", "opt out", "don't use AI", "manual only", "human only"
    const AI_OPT_OUT_RE = /\b(?:no\s+ai|without\s+ai|opt\s*out|don'?t\s+use\s+ai|manual\s+(?:only|process|review|handling)|human\s+only|no\s+artificial\s+intelligence)\b/i;
    if (AI_OPT_OUT_RE.test(subject || '') || AI_OPT_OUT_RE.test(text.slice(0, 500))) {
      const result = await processGoalManual(userEmail, userName, text);
      logger.info({ goalId: result.goal.id }, 'ai-opt-out: detected in inbound email');
      return res.json({ ok: true, type: 'manual-goal', goalId: result.goal.id });
    }

    // Hard exclusion check (Art. 11.1.2) — must run before processGoal
    const exclusion = detectHardExclusion(text);
    if (exclusion.triggered) {
      await sendWarmReferral(userEmail, userName, exclusion.referralKey);
      logger.info({ domain: exclusion.domain }, 'hard-exclusion: warm referral sent');
      return res.json({ ok: true, type: 'hard-exclusion', domain: exclusion.domain });
    }

    // Sensitive-domain check (TSK-049 / DPIA risk 3) — hold for human review
    const sensitive = detectSensitiveDomain(text);
    if (sensitive.flagged) {
      const result = await processGoalSensitive(userEmail, userName, text, sensitive.domain, sensitive.label);
      logger.info({ domain: sensitive.domain, goalId: result.goal.id }, 'sensitive-domain: held for review');
      return res.json({ ok: true, type: 'sensitive-review', domain: sensitive.domain, goalId: result.goal.id });
    }

    // Check if user has a goal awaiting clarification — treat this email as the reply
    const { rows: pendingGoals } = await pool.query(
      `SELECT g.* FROM goals g
       JOIN users u ON u.id = g.user_id
       WHERE u.email = $1 AND g.status = 'pending_clarification'
         AND u.deleted_at IS NULL
       ORDER BY g.created_at DESC LIMIT 1`,
      [userEmail.toLowerCase()]
    );
    if (pendingGoals.length > 0) {
      const result = await processClarification(userEmail, userName, text, pendingGoals[0]);
      logger.info({ goalId: pendingGoals[0].id }, 'clarification-reply: goal updated');
      return res.json({ ok: true, type: 'clarification-reply', goalId: pendingGoals[0].id });
    }

    // Default: process as a new goal
    const result = await processGoal(userEmail, userName, text);
    if (result.failed) {
      logger.info({ goalId: result.goal.id }, 'inbound email: decomposition failed, goal closed');
      return res.json({ ok: true, type: 'unprocessable', goalId: result.goal.id });
    }
    res.json({ ok: true, goalId: result.goal.id });
  } catch (err) {
    logger.error({ err }, 'Webhook /email error');
    res.status(500).json({ error: 'internal error' });
  }
});

// Feedback submission
router.post('/feedback', feedbackLimit, verifySecret, async (req, res) => {
  try {
    const { user_email, goal_id, content, source } = req.body;
    if (!content || typeof content !== 'string') return res.status(400).json({ error: 'Missing content' });
    if (content.length > 5000) return res.status(400).json({ error: 'Content too long' });

    let userId = null;
    if (user_email) {
      const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [user_email.toLowerCase()]);
      if (rows.length) userId = rows[0].id;
    }

    await pool.query(
      `INSERT INTO feedback (user_id, goal_id, content, source) VALUES ($1, $2, $3, $4)`,
      [userId, goal_id || null, content, source || 'web']
    );

    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'Webhook /feedback error');
    res.status(500).json({ error: 'internal error' });
  }
});

module.exports = router;
