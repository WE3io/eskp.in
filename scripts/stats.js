#!/usr/bin/env node
/**
 * scripts/stats.js — TSK-096
 *
 * Platform stats: goals, matches, payments, match quality, helper performance.
 * Run with: pnpm stats
 */

require('dotenv').config({ quiet: true });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  console.log('\n=== Platform Stats ===');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Goal funnel
  const { rows: goalStats } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE TRUE)                                         AS total,
      COUNT(*) FILTER (WHERE status = 'submitted')                        AS submitted,
      COUNT(*) FILTER (WHERE status = 'pending_clarification')            AS pending_clarification,
      COUNT(*) FILTER (WHERE status = 'matched')                          AS matched,
      COUNT(*) FILTER (WHERE status = 'introduced')                       AS introduced,
      COUNT(*) FILTER (WHERE status = 'resolved')                         AS resolved,
      COUNT(*) FILTER (WHERE status = 'closed')                           AS closed,
      COUNT(*) FILTER (WHERE sensitive_domain IS NOT NULL)                AS sensitive_flagged
    FROM goals
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  const g = goalStats[0];
  console.log('── Goals (last 30 days) ──────────────────');
  console.log(`  Total submitted:        ${g.total}`);
  console.log(`  Pending clarification:  ${g.pending_clarification}`);
  console.log(`  Matched (unpaid):       ${g.matched}`);
  console.log(`  Introduced (paid):      ${g.introduced}`);
  console.log(`  Resolved:               ${g.resolved}`);
  console.log(`  Closed:                 ${g.closed}`);
  console.log(`  Sensitive flagged:      ${g.sensitive_flagged}`);

  // Match quality
  const { rows: matchStats } = await pool.query(`
    SELECT
      COUNT(*)                                    AS total_matches,
      COUNT(*) FILTER (WHERE status = 'introduced') AS paid,
      COUNT(*) FILTER (WHERE user_rating IS NOT NULL) AS rated,
      ROUND(AVG(user_rating), 2)                  AS avg_rating,
      COUNT(*) FILTER (WHERE user_rating >= 4)    AS positive,
      COUNT(*) FILTER (WHERE user_rating = 3)     AS neutral,
      COUNT(*) FILTER (WHERE user_rating <= 2)    AS negative
    FROM matches
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);

  const m = matchStats[0];
  const payRate = m.total_matches > 0
    ? ((m.paid / m.total_matches) * 100).toFixed(0) + '%'
    : 'n/a';
  const rateRate = m.paid > 0
    ? ((m.rated / m.paid) * 100).toFixed(0) + '%'
    : 'n/a';

  console.log('\n── Match quality (last 30 days) ──────────');
  console.log(`  Matches proposed:       ${m.total_matches}`);
  console.log(`  Paid (introduced):      ${m.paid}  (payment rate: ${payRate})`);
  console.log(`  Rated by users:         ${m.rated}  (rating rate: ${rateRate})`);
  if (m.avg_rating) {
    console.log(`  Average rating:         ${m.avg_rating}/5`);
    console.log(`  Positive (4–5★):        ${m.positive}`);
    console.log(`  Neutral  (3★):          ${m.neutral}`);
    console.log(`  Negative (1–2★):        ${m.negative}`);
  } else {
    console.log(`  Average rating:         no ratings yet`);
  }

  // Helper performance
  const { rows: helperStats } = await pool.query(`
    SELECT
      u.name,
      u.email,
      h.is_active,
      COUNT(m.id)                                    AS total_matches,
      COUNT(m.id) FILTER (WHERE m.status = 'introduced') AS introductions,
      ROUND(AVG(m.user_rating), 1)                   AS avg_rating,
      COUNT(m.user_rating)                           AS rating_count
    FROM helpers h
    JOIN users u ON u.id = h.user_id
    LEFT JOIN matches m ON m.helper_id = h.id AND m.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY h.id, u.name, u.email, h.is_active
    ORDER BY introductions DESC NULLS LAST
  `);

  console.log('\n── Helpers (last 30 days) ────────────────');
  for (const h of helperStats) {
    const rating = h.avg_rating && h.rating_count > 0
      ? `${h.avg_rating}/5 (${h.rating_count} rating${h.rating_count === 1 ? '' : 's'})`
      : 'unrated';
    const status = h.is_active ? 'active' : 'inactive';
    console.log(`  ${h.name || h.email} [${status}]: ${h.introductions} intros, ${h.total_matches} proposed, ${rating}`);
  }

  // Revenue
  const { rows: revStats } = await pool.query(`
    SELECT
      COUNT(*) AS paid_intros,
      COUNT(*) * 10 AS gross_revenue_gbp
    FROM matches
    WHERE status = 'introduced'
      AND paid_at >= NOW() - INTERVAL '30 days'
  `);
  const r = revStats[0];
  console.log('\n── Revenue (last 30 days) ────────────────');
  console.log(`  Paid introductions:     ${r.paid_intros}`);
  console.log(`  Gross revenue:          £${r.gross_revenue_gbp} GBP`);
  console.log('');

  await pool.end();
}

run().catch(err => {
  console.error('stats error:', err.message);
  pool.end();
  process.exit(1);
});
