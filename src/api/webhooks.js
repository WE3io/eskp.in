const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { processGoal, recordInbound } = require('../services/platform');
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

    // Log the inbound email
    await recordInbound(from, to, subject, text, raw || {});

    // Process as a new goal
    const result = await processGoal(userEmail, userName, text);

    res.json({ ok: true, goalId: result.goal.id });
  } catch (err) {
    console.error('Webhook /email error:', err);
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
    console.error('Webhook /feedback error:', err);
    res.status(500).json({ error: 'internal error' });
  }
});

module.exports = router;
