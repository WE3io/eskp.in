const express = require('express');
const router = express.Router();
const { processGoal } = require('../services/platform');
const { pool } = require('../db/connection');

// Submit a goal directly (for testing / future web UI)
router.post('/', async (req, res) => {
  try {
    const { email, name, goal } = req.body;
    if (!email || !goal) return res.status(400).json({ error: 'email and goal are required' });

    const result = await processGoal(email, name, goal);
    res.json({ ok: true, goalId: result.goal.id, decomposed: result.decomposed });
  } catch (err) {
    console.error('POST /goals error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get goal status
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT g.id, g.status, g.decomposed, g.created_at,
              u.email AS user_email
       FROM goals g JOIN users u ON u.id = g.user_id
       WHERE g.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
