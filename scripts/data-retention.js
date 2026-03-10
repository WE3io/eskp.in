#!/usr/bin/env node
/**
 * scripts/data-retention.js — TSK-056
 *
 * Automated data retention and storage limitation enforcement (UK GDPR Art.5(1)(e)).
 * Documented in docs/operations/raw-text-retention-policy.md.
 *
 * Actions taken:
 *
 *  1. Auto-close stale active goals (no update in 90 days) with user notification.
 *     Statuses: submitted, matched, pending_clarification, clarifying, proposed.
 *
 *  2. Auto-close completed introductions with no activity (180 days post-introduction).
 *     Status: introduced.
 *
 *  3. Purge decomposed data from closed/auto-closed goals older than 365 days.
 *     Sets decomposed = NULL; goal record kept for audit (Art.30 ROPA).
 *
 * Runs monthly on the 1st at 06:00 UTC:
 *   0 6 1 * * node /root/project/scripts/data-retention.js
 *
 * Usage:
 *   node scripts/data-retention.js          # real run
 *   DRY_RUN=1 node scripts/data-retention.js  # print actions, don't execute
 */

require('dotenv').config();
const { pool } = require('../src/db/connection');
const { send } = require('../src/services/email');
const { renderEmail } = require('../src/services/email-template');

const DRY_RUN = process.env.DRY_RUN === '1';
const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';

// Thresholds
const STALE_ACTIVE_DAYS = 90;   // auto-close goals with no activity
const STALE_INTRO_DAYS  = 180;  // auto-close introductions with no activity
const PURGE_CLOSED_DAYS = 365;  // delete decomposed data from old closed goals

if (DRY_RUN) console.log('[data-retention] DRY RUN — no changes will be committed');

async function run() {
  let staleClosed = 0;
  let introClosed = 0;
  let decomposedPurged = 0;

  // ── 1. Close stale active goals (no update in 90 days) ────────────────────
  const { rows: staleGoals } = await pool.query(`
    SELECT
      g.id AS goal_id,
      g.decomposed,
      g.status,
      u.email AS user_email,
      u.name  AS user_name,
      u.email_suppressed_at
    FROM goals g
    JOIN users u ON u.id = g.user_id
    WHERE g.status IN ('submitted', 'matched', 'pending_clarification', 'clarifying', 'proposed')
      AND g.updated_at < NOW() - INTERVAL '${STALE_ACTIVE_DAYS} days'
      AND u.deleted_at IS NULL
  `);

  for (const row of staleGoals) {
    const greeting = `Hi${row.user_name ? ` ${row.user_name}` : ''},`;
    const summary   = row.decomposed?.summary || 'your goal';

    const plainText = `${greeting}

Your goal submission — "${summary}" — has been inactive for ${STALE_ACTIVE_DAYS} days and has been automatically closed.

This is a routine data hygiene action. We keep active goals in our system for up to ${STALE_ACTIVE_DAYS} days. After that, we close them to respect your privacy (UK GDPR, storage limitation principle).

If your need is still live, you're welcome to submit it again at https://eskp.in — it will be matched fresh.

Your personal data has been handled in line with our privacy policy: https://eskp.in/privacy.html

— The eskp.in team`;

    const htmlBody = `
      <p>${greeting}</p>
      <p>Your goal submission — <em>"${summary}"</em> — has been inactive for ${STALE_ACTIVE_DAYS} days and has been automatically closed.</p>
      <p style="color:#7A6E68;font-size:14px;">This is a routine data hygiene action. We close inactive goals after ${STALE_ACTIVE_DAYS} days to respect your privacy (UK GDPR, storage limitation principle).</p>
      <p>If your need is still live, you're welcome to <a href="https://eskp.in" style="color:#C4753A;">submit it again</a> — it will be matched fresh.</p>
      <p style="font-size:13px;color:#9E9490;">Your personal data has been handled in line with our <a href="https://eskp.in/privacy.html" style="color:#9E9490;">privacy policy</a>.</p>`;

    if (DRY_RUN) {
      console.log(`[data-retention] DRY stale-close: goal ${row.goal_id} (${row.status}) → user ${row.user_email}`);
      staleClosed++;
      continue;
    }

    await pool.query(
      `UPDATE goals SET status = 'closed', updated_at = NOW() WHERE id = $1`,
      [row.goal_id]
    );

    if (!row.email_suppressed_at) {
      try {
        await send({
          to: row.user_email,
          subject: 'Your goal on eskp.in has been automatically closed',
          text: plainText,
          html: renderEmail({
            preheader: 'Your goal submission has been automatically closed after 90 days of inactivity.',
            body: htmlBody,
          }),
        });
        await pool.query(
          `INSERT INTO emails (direction, from_address, to_address, subject, goal_id)
           VALUES ('outbound', $1, $2, $3, $4)`,
          [FROM, row.user_email, 'Your goal on eskp.in has been automatically closed', row.goal_id]
        );
      } catch (err) {
        console.warn(`[data-retention] email send failed for ${row.user_email}: ${err.message}`);
      }
    }

    console.log(`[data-retention] closed stale goal ${row.goal_id} (${row.status}) — user ${row.user_email}`);
    staleClosed++;
  }

  // ── 2. Close completed introductions with no activity (180 days) ──────────
  const { rows: introGoals } = await pool.query(`
    SELECT
      g.id AS goal_id,
      g.decomposed,
      u.email AS user_email,
      u.name  AS user_name,
      u.email_suppressed_at
    FROM goals g
    JOIN users u ON u.id = g.user_id
    WHERE g.status = 'introduced'
      AND g.updated_at < NOW() - INTERVAL '${STALE_INTRO_DAYS} days'
      AND u.deleted_at IS NULL
  `);

  for (const row of introGoals) {
    if (DRY_RUN) {
      console.log(`[data-retention] DRY intro-close: goal ${row.goal_id} → user ${row.user_email}`);
      introClosed++;
      continue;
    }

    await pool.query(
      `UPDATE goals SET status = 'closed', updated_at = NOW() WHERE id = $1`,
      [row.goal_id]
    );

    console.log(`[data-retention] closed old introduced goal ${row.goal_id} — user ${row.user_email}`);
    introClosed++;
  }

  // ── 3. Purge decomposed data from goals closed > 365 days ago ────────────
  // The goal row is retained for the ROPA audit trail; only structured AI
  // output (decomposed JSONB) is purged to minimise retained personal data.
  const { rows: purgeGoals } = await pool.query(`
    SELECT g.id AS goal_id
    FROM goals g
    WHERE g.status = 'closed'
      AND g.decomposed IS NOT NULL
      AND g.updated_at < NOW() - INTERVAL '${PURGE_CLOSED_DAYS} days'
  `);

  if (!DRY_RUN && purgeGoals.length > 0) {
    const ids = purgeGoals.map(r => r.goal_id);
    await pool.query(
      `UPDATE goals SET decomposed = NULL, updated_at = NOW() WHERE id = ANY($1)`,
      [ids]
    );
  }

  console.log(DRY_RUN
    ? `[data-retention] DRY purge: ${purgeGoals.length} closed goal(s) would have decomposed data cleared`
    : `[data-retention] purged decomposed data from ${purgeGoals.length} goal(s) closed >365 days ago`
  );
  decomposedPurged = purgeGoals.length;

  console.log(`[data-retention] done — stale-closed: ${staleClosed}, intro-closed: ${introClosed}, decomposed-purged: ${decomposedPurged}`);
  await pool.end();
}

run().catch(err => {
  console.error('[data-retention] fatal error:', err.message);
  pool.end();
  process.exit(1);
});
