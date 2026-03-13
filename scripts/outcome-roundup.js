#!/usr/bin/env node
/**
 * TSK-091: Monthly outcome roundup email.
 *
 * Sends a brief update email to all users who submitted a goal in the last
 * 3 months. The email:
 *   - Summarises what has happened on the platform (goals submitted, intros made)
 *   - Invites them to reply with their outcome (did the intro help?)
 *   - Links to the public roadmap
 *
 * This is zero-infrastructure community building: one email creates a
 * retention touchpoint, surfaces real outcome data, and shows the platform
 * is alive without requiring a community forum.
 *
 * Usage:
 *   node scripts/outcome-roundup.js          # real send
 *   DRY_RUN=1 node scripts/outcome-roundup.js  # print, don't send
 *
 * Cron: 0 10 1 * * (1st of each month at 10:00 UTC)
 */

require('dotenv').config({ quiet: true });
const { Pool } = require('pg');
const { send } = require('../src/services/email');
const { renderEmail, safeHtml, rawHtml } = require('../src/services/email-template');
const { isSuppressed } = require('../src/services/email-suppression');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';
const DRY_RUN = process.env.DRY_RUN === '1';

async function run() {
  // 1. Platform stats for the last 30 days
  const { rows: [stats] } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS goals_last_30d,
      COUNT(*) FILTER (WHERE status = 'introduced' AND created_at >= NOW() - INTERVAL '30 days') AS intros_last_30d,
      COUNT(*) FILTER (WHERE status IN ('submitted', 'decomposing', 'pending_clarification', 'matched')) AS open_goals
    FROM goals
  `);

  const goalsLast30d = parseInt(stats.goals_last_30d, 10) || 0;
  const introsLast30d = parseInt(stats.intros_last_30d, 10) || 0;
  const openGoals = parseInt(stats.open_goals, 10) || 0;

  // 2. Users who submitted a goal in the last 90 days
  const { rows: users } = await pool.query(`
    SELECT DISTINCT
      u.id,
      u.email,
      u.name,
      MAX(g.created_at) AS last_goal_at
    FROM users u
    JOIN goals g ON g.user_id = u.id
    WHERE g.created_at >= NOW() - INTERVAL '90 days'
    GROUP BY u.id, u.email, u.name
    ORDER BY last_goal_at DESC
  `);

  if (users.length === 0) {
    console.log('[outcome-roundup] no users to contact — skipping');
    await pool.end();
    return;
  }

  const month = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  let sent = 0;
  let suppressed = 0;

  for (const user of users) {
    if (await isSuppressed(user.email)) {
      suppressed++;
      continue;
    }

    const greeting = user.name ? `Hi ${user.name},` : 'Hi,';
    const statsLine = goalsLast30d > 0
      ? `In the last 30 days: ${goalsLast30d} goal${goalsLast30d === 1 ? '' : 's'} submitted${introsLast30d > 0 ? `, ${introsLast30d} introduction${introsLast30d === 1 ? '' : 's'} made` : ''}.${openGoals > 0 ? ` ${openGoals} goal${openGoals === 1 ? '' : 's'} currently looking for a match.` : ''}`
      : `The platform is active and we're building the helper network.`;

    const textBody = `${greeting}

This is a short monthly note from eskp.in.

${statsLine}

If you've had an introduction and it was useful — we'd love to hear what happened. Just reply to this email. If it wasn't useful, we'd like to know that too.

You can see what we're building next at https://eskp.in/roadmap.html

If you have a new goal you'd like help with, send an email to hello@mail.eskp.in.

— The eskp.in team

---
You received this because you submitted a goal via eskp.in. Reply with "unsubscribe" to stop receiving these updates.`;

    const htmlBody = safeHtml`<p>${greeting}</p>
<p>This is a short monthly note from eskp.in.</p>
<p>${statsLine}</p>
${rawHtml(`<p>If you've had an introduction and it was useful — we'd love to hear what happened. <strong>Just reply to this email.</strong> If it wasn't useful, we'd like to know that too.</p>
<p>You can see what we're building next at <a href="https://eskp.in/roadmap.html">eskp.in/roadmap.html</a></p>
<p>If you have a new goal you'd like help with, send an email to <a href="mailto:hello@mail.eskp.in">hello@mail.eskp.in</a></p>
<p style="color:#7A6E68;font-size:13px;">You received this because you submitted a goal via eskp.in. Reply with "unsubscribe" to stop receiving these updates.</p>`)}`;

    if (DRY_RUN) {
      console.log(`[DRY_RUN] Would send to: ${user.email}`);
      console.log(`  Subject: eskp.in — ${month} update`);
      console.log(`  Stats: ${statsLine}`);
      console.log('');
    } else {
      try {
        await send({
          to: user.email,
          subject: `eskp.in — ${month} update`,
          text: textBody,
          html: renderEmail({
            preheader: `A short update from eskp.in — ${month}`,
            body: htmlBody,
          }),
        });
        sent++;
      } catch (err) {
        console.error(`[outcome-roundup] failed to send to ${user.email}:`, err.message);
      }
    }
  }

  console.log(`[outcome-roundup] done — sent: ${sent}, suppressed: ${suppressed}, total users: ${users.length}`);
  await pool.end();
}

run().catch(async (err) => {
  console.error('[outcome-roundup] fatal error:', err);
  await pool.end();
  process.exit(1);
});
