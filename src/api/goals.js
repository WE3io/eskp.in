const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { processGoal } = require('../services/platform');
const { pool } = require('../db/connection');

const postLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded — max 5 goal submissions per hour' },
});

const getLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded' },
});

// Rough email validation
function isValidEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

// Submit a goal
router.post('/', postLimit, async (req, res) => {
  try {
    const { email, name, goal } = req.body;

    if (!email || !goal) return res.status(400).json({ error: 'email and goal are required' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'invalid email' });
    if (typeof goal !== 'string') return res.status(400).json({ error: 'goal must be a string' });
    if (goal.length > 10000) return res.status(400).json({ error: 'goal must be under 10,000 characters' });
    if (name && typeof name !== 'string') return res.status(400).json({ error: 'invalid name' });

    const result = await processGoal(email.trim(), name?.trim() || null, goal);
    res.json({ ok: true, goalId: result.goal.id });
  } catch (err) {
    console.error('POST /goals error:', err);
    res.status(500).json({ error: 'internal error' });
  }
});

// Get goal status — no PII returned
router.get('/:id', getLimit, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT g.id, g.status, g.created_at,
              (SELECT json_agg(json_build_object('need', n->>'need', 'urgency', n->>'urgency'))
               FROM json_array_elements(g.decomposed->'needs') n) AS needs,
              (SELECT COUNT(*) FROM matches m WHERE m.goal_id = g.id AND m.status = 'introduced') AS matches_count
       FROM goals g
       WHERE g.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'internal error' });
  }
});

module.exports = router;
