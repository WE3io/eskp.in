const express = require('express');
const router = express.Router();
const { processGoal, recordInbound } = require('../services/platform');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function verifySecret(req, res, next) {
  const provided = req.headers['x-webhook-secret'];
  if (!WEBHOOK_SECRET || provided !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Inbound email from Cloudflare Worker
router.post('/email', verifySecret, async (req, res) => {
  try {
    const { from, to, subject, text, raw } = req.body;

    if (!from || !text) {
      return res.status(400).json({ error: 'Missing from or text' });
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
    res.status(500).json({ error: err.message });
  }
});

// Feedback submission
router.post('/feedback', verifySecret, async (req, res) => {
  try {
    const { pool } = require('../db/connection');
    const { user_email, goal_id, content, source } = req.body;
    if (!content) return res.status(400).json({ error: 'Missing content' });

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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
