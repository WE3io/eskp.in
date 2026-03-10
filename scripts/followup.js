#!/usr/bin/env node
/**
 * scripts/followup.js
 *
 * Sends three types of automated follow-up emails:
 *
 *  1. TSK-068: Post-introduction check-in (24h after goal reaches 'introduced' status)
 *     Asks the user how their introduction went. Research finding 23 in
 *     docs/research/2026-03-10-helper-retention.md: frequency of communication
 *     is the top retention predictor.
 *
 *  1b. 24-hour no-match acknowledgement (20–48h after goal reaches 'matched' status)
 *      Keeps the promise on the landing page: "We'll tell you within 24 hours if
 *      we can't find anyone." Tracked via ack_24h_sent_at (separate from
 *      follow_up_sent_at so the 7-day timeout can still fire later).
 *
 *  2. TSK-063: No-match / stale-match timeout (7 days after goal reaches 'matched' status)
 *     Two variants:
 *       a. Goal has no match records → honest "still looking / here's what to do"
 *       b. Goal has unpaid match record → gentle payment reminder
 *
 * Each goal receives at most one follow-up email (follow_up_sent_at column).
 * The 24h acknowledgement uses a separate ack_24h_sent_at column.
 * Run via cron: 0 9 * * * (daily at 09:00 UTC).
 */

require('dotenv').config();
const { pool } = require('../src/db/connection');
const { send } = require('../src/services/email');
const { renderEmail, escHtml } = require('../src/services/email-template');
const { generateReplyTo } = require('../src/services/email-reply-token');

const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';
const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('[followup] DRY RUN — no emails will be sent');

async function run() {
  let introCount = 0;
  let ack24hCount = 0;
  let noMatchCount = 0;
  let unpaidCount = 0;

  // ── 1. Post-introduction check-in (TSK-068, TSK-094) ─────────────────────
  // Goals in 'introduced' status where matched was introduced ≥20h ago (gives 4h buffer
  // either side of the 24h mark for cron timing), and no follow-up has been sent yet.
  // TSK-094: feedback_token included so we can embed 1-click rating links.
  const { rows: introGoals } = await pool.query(`
    SELECT
      g.id AS goal_id,
      g.decomposed,
      u.email AS user_email,
      u.name AS user_name,
      hu.name AS helper_name,
      m.paid_at,
      m.feedback_token
    FROM goals g
    JOIN users u ON u.id = g.user_id
    JOIN matches m ON m.goal_id = g.id AND m.status = 'introduced'
    JOIN helpers h ON h.id = m.helper_id
    JOIN users hu ON hu.id = h.user_id
    WHERE g.status = 'introduced'
      AND g.follow_up_sent_at IS NULL
      AND m.paid_at < NOW() - INTERVAL '20 hours'
      AND m.paid_at > NOW() - INTERVAL '72 hours'
      AND u.email_suppressed_at IS NULL
      AND u.deleted_at IS NULL
  `);

  const BASE_URL = process.env.APP_BASE_URL || 'https://eskp.in';

  for (const row of introGoals) {
    const greeting = `Hi${row.user_name ? ` ${row.user_name}` : ''},`;
    const helperName = row.helper_name || 'your helper';

    // TSK-094: 1-click rating links (only if feedback_token exists)
    const ratingLinks = row.feedback_token
      ? {
          helpful:  `${BASE_URL}/api/match-feedback?t=${row.feedback_token}&r=5`,
          somewhat: `${BASE_URL}/api/match-feedback?t=${row.feedback_token}&r=3`,
          notHelpful: `${BASE_URL}/api/match-feedback?t=${row.feedback_token}&r=1`,
        }
      : null;

    const ratingPlain = ratingLinks
      ? `\nWas the match helpful?\n  Yes, very helpful: ${ratingLinks.helpful}\n  Somewhat helpful: ${ratingLinks.somewhat}\n  Not helpful: ${ratingLinks.notHelpful}\n`
      : '';

    const ratingHtml = ratingLinks
      ? `<p style="margin:20px 0 8px;font-weight:600;">Was this match helpful?</p>
         <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
           <tr>
             <td style="padding-right:8px;"><a href="${ratingLinks.helpful}" style="background:#3a7d44;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:14px;">Yes, very helpful</a></td>
             <td style="padding-right:8px;"><a href="${ratingLinks.somewhat}" style="background:#7A6E68;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:14px;">Somewhat helpful</a></td>
             <td><a href="${ratingLinks.notHelpful}" style="background:#C4622D;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;font-size:14px;">Not helpful</a></td>
           </tr>
         </table>
         <p style="color:#7A6E68;font-size:13px;margin:0 0 16px;">One click — no account needed. Your feedback shapes future matches.</p>`
      : '';

    const plainText = `${greeting}

We introduced you to ${helperName} yesterday. We hope the conversation is going well.
${ratingPlain}
We'd love to hear how it's going — you can also just reply to this email with a line or two.

If the introduction didn't work out for any reason, let us know and we'll see what else we can do.

— The eskp.in team`;

    const htmlBody = `
      <p>${escHtml(greeting)}</p>
      <p>We introduced you to <strong>${escHtml(helperName)}</strong> yesterday. We hope the conversation is going well.</p>
      ${ratingHtml}
      <p>You can also just <strong>reply to this email</strong> with a line or two — whatever's easier.</p>
      <p style="color:#7A6E68;font-size:14px;background:#F9F6F0;border-left:3px solid #C4622D;padding:10px 14px;margin:16px 0;">
        If the introduction didn't work out for any reason, let us know and we'll see what else we can do.
      </p>`;

    if (!DRY_RUN) {
      await send({
        to: row.user_email,
        subject: `How did your introduction with ${helperName} go?`,
        text: plainText,
        html: renderEmail({
          preheader: `Checking in — how is your conversation with ${helperName} going?`,
          body: htmlBody,
        }),
        replyTo: generateReplyTo(row.goal_id),
      });
      await pool.query(
        `UPDATE goals SET follow_up_sent_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [row.goal_id]
      );
      await pool.query(
        `INSERT INTO emails (direction, from_address, to_address, subject, goal_id)
         VALUES ('outbound', $1, $2, $3, $4)`,
        [FROM, row.user_email, `How did your introduction with ${helperName} go?`, row.goal_id]
      );
    }
    console.log(`[followup] ${DRY_RUN ? 'DRY' : 'sent'} intro check-in → ${row.user_email} (goal ${row.goal_id})`);
    introCount++;
  }

  // ── 1b. 24-hour no-match acknowledgement ───────────────────────────────────
  // Goals in 'matched' status with NO match records, created 20–48h ago,
  // no ack_24h_sent_at yet. Does NOT set follow_up_sent_at so the 7-day
  // timeout can still fire later.
  const { rows: ack24hGoals } = await pool.query(`
    SELECT
      g.id AS goal_id,
      g.decomposed,
      u.email AS user_email,
      u.name AS user_name
    FROM goals g
    JOIN users u ON u.id = g.user_id
    LEFT JOIN matches m ON m.goal_id = g.id
    WHERE g.status = 'matched'
      AND g.ack_24h_sent_at IS NULL
      AND g.follow_up_sent_at IS NULL
      AND g.updated_at > NOW() - INTERVAL '48 hours'
      AND g.updated_at < NOW() - INTERVAL '20 hours'
      AND m.id IS NULL
      AND u.email_suppressed_at IS NULL
      AND u.deleted_at IS NULL
  `);

  for (const row of ack24hGoals) {
    const greeting = `Hi${row.user_name ? ` ${row.user_name}` : ''},`;
    const summary = row.decomposed?.summary || 'your goal';

    const plainText = `${greeting}

We're still looking for the right person for "${summary}". We haven't found someone yet, but your goal is active and we'll let you know as soon as we do.

If you'd like to update or close your request, just reply.

— The eskp.in team`;

    const htmlBody = `
      <p>${escHtml(greeting)}</p>
      <p>We're still looking for the right person for <em>"${escHtml(summary)}"</em>. We haven't found someone yet, but your goal is active and we'll let you know as soon as we do.</p>
      <p style="color:#7A6E68;font-size:14px;">If you'd like to update or close your request, just reply.</p>`;

    const subject = `Update: we're still looking for a match`;

    if (!DRY_RUN) {
      await send({
        to: row.user_email,
        subject,
        text: plainText,
        html: renderEmail({
          preheader: `We're still looking for the right match for your goal.`,
          body: htmlBody,
        }),
        replyTo: generateReplyTo(row.goal_id),
      });
      await pool.query(
        `UPDATE goals SET ack_24h_sent_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [row.goal_id]
      );
      await pool.query(
        `INSERT INTO emails (direction, from_address, to_address, subject, goal_id)
         VALUES ('outbound', $1, $2, $3, $4)`,
        [FROM, row.user_email, subject, row.goal_id]
      );
    }
    console.log(`[followup] ${DRY_RUN ? 'DRY' : 'sent'} 24h ack → ${row.user_email} (goal ${row.goal_id})`);
    ack24hCount++;
  }

  // ── 2. No-match timeout (TSK-063) — genuine no match after 7 days ─────────
  // Goals in 'matched' status with no match records ≥ 7 days old, no follow-up yet.
  const { rows: noMatchGoals } = await pool.query(`
    SELECT
      g.id AS goal_id,
      g.decomposed,
      u.email AS user_email,
      u.name AS user_name
    FROM goals g
    JOIN users u ON u.id = g.user_id
    LEFT JOIN matches m ON m.goal_id = g.id
    WHERE g.status = 'matched'
      AND g.follow_up_sent_at IS NULL
      AND g.updated_at < NOW() - INTERVAL '7 days'
      AND m.id IS NULL
      AND u.email_suppressed_at IS NULL
      AND u.deleted_at IS NULL
  `);

  for (const row of noMatchGoals) {
    const greeting = `Hi${row.user_name ? ` ${row.user_name}` : ''},`;
    const summary = row.decomposed?.summary || 'your goal';

    const plainText = `${greeting}

We wanted to be honest with you: we haven't found the right match for "${summary}" yet.

We're still a small platform and our helper network is growing. A few options:

1. Wait — we're actively recruiting helpers and may find someone soon.
2. Describe your goal differently — sometimes a different framing opens up new matches.
3. Close this request — reply with "close" and we'll remove it from our queue.

If you want to try a different description, just reply with your updated goal.

Sorry it's taking longer than expected. We'd rather be honest than keep you waiting in silence.

— The eskp.in team`;

    const htmlBody = `
      <p>${escHtml(greeting)}</p>
      <p>We wanted to be honest with you: we haven't found the right match for <em>"${escHtml(summary)}"</em> yet.</p>
      <p>We're still a small platform and our helper network is growing. A few options:</p>
      <ol style="margin:8px 0 16px 20px;padding:0;">
        <li style="margin-bottom:8px;"><strong>Wait</strong> — we're actively recruiting helpers and may find someone soon.</li>
        <li style="margin-bottom:8px;"><strong>Reframe your goal</strong> — sometimes a different description opens up new matches. Just reply with an updated version.</li>
        <li style="margin-bottom:8px;"><strong>Close this request</strong> — reply with "close" and we'll remove it from our queue.</li>
      </ol>
      <p style="color:#7A6E68;font-size:14px;">Sorry it's taking longer than expected. We'd rather be honest than keep you waiting in silence.</p>`;

    if (!DRY_RUN) {
      await send({
        to: row.user_email,
        subject: `Update on your goal — we're still looking`,
        text: plainText,
        html: renderEmail({
          preheader: 'An honest update on finding the right match for your goal.',
          body: htmlBody,
        }),
        replyTo: generateReplyTo(row.goal_id),
      });
      await pool.query(
        `UPDATE goals SET follow_up_sent_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [row.goal_id]
      );
      await pool.query(
        `INSERT INTO emails (direction, from_address, to_address, subject, goal_id)
         VALUES ('outbound', $1, $2, $3, $4)`,
        [FROM, row.user_email, `Update on your goal — we're still looking`, row.goal_id]
      );
    }
    console.log(`[followup] ${DRY_RUN ? 'DRY' : 'sent'} no-match timeout → ${row.user_email} (goal ${row.goal_id})`);
    noMatchCount++;
  }

  // ── 3. Unpaid match reminder (TSK-063) — has match but no payment after 7 days ──
  const { rows: unpaidGoals } = await pool.query(`
    SELECT
      g.id AS goal_id,
      g.decomposed,
      u.email AS user_email,
      u.name AS user_name,
      m.id AS match_id,
      m.stripe_session_id,
      hu.name AS helper_name
    FROM goals g
    JOIN users u ON u.id = g.user_id
    JOIN matches m ON m.goal_id = g.id AND m.status = 'proposed'
    JOIN helpers h ON h.id = m.helper_id
    JOIN users hu ON hu.id = h.user_id
    WHERE g.status = 'matched'
      AND g.follow_up_sent_at IS NULL
      AND m.created_at < NOW() - INTERVAL '7 days'
      AND u.email_suppressed_at IS NULL
      AND u.deleted_at IS NULL
  `);

  for (const row of unpaidGoals) {
    const greeting = `Hi${row.user_name ? ` ${row.user_name}` : ''},`;
    const helperName = row.helper_name || 'a helper in our network';

    const plainText = `${greeting}

A week ago we found a potential match for your goal: ${helperName}.

The introduction is waiting for you — to complete it, a one-time £10 payment is needed. If you're ready, just let us know and we'll send you a fresh payment link.

If your situation has changed or you'd like to close this request, just reply and let us know.

— The eskp.in team`;

    const htmlBody = `
      <p>${escHtml(greeting)}</p>
      <p>A week ago we found a potential match for your goal: <strong>${escHtml(helperName)}</strong>.</p>
      <p>The introduction is waiting for you. If you're ready to proceed, just reply and we'll send you a fresh payment link.</p>
      <p style="color:#7A6E68;font-size:14px;">If your situation has changed or you'd like to close this request, just reply and let us know.</p>`;

    if (!DRY_RUN) {
      await send({
        to: row.user_email,
        subject: `Your match is still waiting — ${helperName}`,
        text: plainText,
        html: renderEmail({
          preheader: `Your introduction with ${helperName} is still available.`,
          body: htmlBody,
        }),
        replyTo: generateReplyTo(row.goal_id),
      });
      await pool.query(
        `UPDATE goals SET follow_up_sent_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [row.goal_id]
      );
      await pool.query(
        `INSERT INTO emails (direction, from_address, to_address, subject, goal_id, match_id)
         VALUES ('outbound', $1, $2, $3, $4, $5)`,
        [FROM, row.user_email, `Your match is still waiting — ${helperName}`, row.goal_id, row.match_id]
      );
    }
    console.log(`[followup] ${DRY_RUN ? 'DRY' : 'sent'} unpaid reminder → ${row.user_email} (goal ${row.goal_id})`);
    unpaidCount++;
  }

  console.log(`[followup] done — intro: ${introCount}, 24h-ack: ${ack24hCount}, no-match: ${noMatchCount}, unpaid: ${unpaidCount}`);
  await pool.end();
}

run().catch(err => {
  console.error('[followup] error:', err.message);
  pool.end();
  process.exit(1);
});
