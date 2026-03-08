const { pool } = require('../db/connection');

/**
 * Find the best helper for a decomposed goal.
 * Phase 1: simple overlap scoring on expertise tags.
 * Phase 2+: semantic matching via embeddings.
 */
async function findMatches(decomposed) {
  const allTags = decomposed.needs.flatMap(n => n.expertise);
  if (allTags.length === 0) return [];

  const { rows } = await pool.query(`
    SELECT
      h.id AS helper_id,
      u.name,
      u.email,
      h.expertise,
      h.bio,
      (
        SELECT COUNT(*)
        FROM unnest(h.expertise) tag
        WHERE tag = ANY($1::text[])
      ) AS overlap
    FROM helpers h
    JOIN users u ON u.id = h.user_id
    WHERE h.is_active = TRUE
      AND u.deleted_at IS NULL
    ORDER BY overlap DESC, h.created_at ASC
    LIMIT 3
  `, [allTags]);

  return rows;
}

module.exports = { findMatches };
