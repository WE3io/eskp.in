/**
 * Core platform orchestration.
 * Handles the full flow: inbound email → goal → decompose → match → introduce.
 */
const { pool } = require('../db/connection');
const { decompose } = require('./decompose');
const { findMatches } = require('./match');
const { send } = require('./email');
const { renderEmail, textToHtml } = require('./email-template');
const { createIntroCheckout } = require('./payments');

const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';

async function getOrCreateUser(email, name) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, name)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET name = COALESCE(EXCLUDED.name, users.name)
     RETURNING *`,
    [email.toLowerCase().trim(), name || null]
  );
  return rows[0];
}

async function processGoal(userEmail, userName, rawText) {
  const user = await getOrCreateUser(userEmail, userName);

  // Create goal record
  const { rows: [goal] } = await pool.query(
    `INSERT INTO goals (user_id, raw_text, status)
     VALUES ($1, $2, 'decomposing') RETURNING *`,
    [user.id, rawText]
  );

  // Decompose
  let decomposed;
  try {
    decomposed = await decompose(rawText, goal.id);
  } catch (err) {
    await pool.query(`UPDATE goals SET status = 'submitted' WHERE id = $1`, [goal.id]);
    throw err;
  }

  await pool.query(
    `UPDATE goals SET decomposed = $1, status = 'matched', updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(decomposed), goal.id]
  );

  // Find helpers
  const matches = await findMatches(decomposed);

  if (matches.length === 0) {
    await sendAcknowledgement(user, goal, decomposed, null);
    return { goal, decomposed, matches: [] };
  }

  // Record top match (status: 'proposed' until paid)
  const topMatch = matches[0];
  const { rows: [match] } = await pool.query(
    `INSERT INTO matches (goal_id, helper_id, reasoning, status)
     VALUES ($1, $2, $3, 'proposed') RETURNING *`,
    [goal.id, topMatch.helper_id, topMatch.reasoning || `Expertise overlap on: ${topMatch.expertise.join(', ')}`]
  );

  // Create Stripe Checkout session
  const { sessionId, url: paymentUrl } = await createIntroCheckout({
    goalId: goal.id,
    matchId: match.id,
    userEmail: user.email,
    summary: decomposed.summary,
  });

  await pool.query(
    `UPDATE matches SET stripe_session_id = $1 WHERE id = $2`,
    [sessionId, match.id]
  );

  await pool.query(`UPDATE goals SET status = 'matched', updated_at = NOW() WHERE id = $1`, [goal.id]);

  // Send acknowledgement with payment link — helper intro fires after payment
  await sendAcknowledgement(user, goal, decomposed, topMatch, paymentUrl);

  await logEmail('outbound', FROM, user.email, `Re: your goal — we found someone who can help`, goal.id, match.id);

  return { goal, decomposed, match, matches };
}

async function sendAcknowledgement(user, goal, decomposed, helper, paymentUrl) {
  const greeting = `Hi${user.name ? ` ${user.name}` : ''},`;
  const needsList = decomposed.needs.map(n => `• ${n.need}`).join('\n');

  const hasMatch = !!(helper && paymentUrl);

  const plainText = hasMatch
    ? `${greeting}

We received your message and here's how we understood your goal:

${decomposed.summary}

What you need:
${needsList}

Good news — we found someone who can help: ${helper.name || 'a helper in our network'}.

To receive the introduction, complete a one-time payment of £10:
${paymentUrl}

If we've misunderstood anything, just reply to this email.

— The eskp.in team`
    : `${greeting}

We received your message and here's how we understood your goal:

${decomposed.summary}

What you need:
${needsList}

We're working on finding the right person for you and will be in touch shortly.

If we've misunderstood anything, just reply to this email.

— The eskp.in team`;

  const htmlBody = hasMatch
    ? `<p>${greeting}</p>
       <p>We received your message and here's how we understood your goal:</p>
       <p style="font-style:italic;color:#5A5450;border-left:3px solid #C4622D;padding-left:14px;margin:16px 0;">${decomposed.summary}</p>
       <p><strong>What you need:</strong></p>
       <ul style="margin:8px 0 16px 20px;padding:0;">
         ${decomposed.needs.map(n => `<li style="margin-bottom:8px;">${n.need}</li>`).join('')}
       </ul>
       <p>Good news — we found someone who can help: <strong>${helper.name || 'a helper in our network'}</strong>.</p>
       <p>To receive the introduction, complete a one-time payment of <strong>£10</strong>:</p>
       <p style="text-align:center;margin:24px 0;">
         <a href="${paymentUrl}" style="background:#C4622D;color:#fff;padding:12px 24px;border-radius:5px;text-decoration:none;font-size:16px;">
           Pay £10 and get introduced
         </a>
       </p>
       <p style="color:#7A6E68;font-size:14px;margin-top:24px;">If we've misunderstood anything, just reply to this email.</p>`
    : `<p>${greeting}</p>
       <p>We received your message and here's how we understood your goal:</p>
       <p style="font-style:italic;color:#5A5450;border-left:3px solid #C4622D;padding-left:14px;margin:16px 0;">${decomposed.summary}</p>
       <p><strong>What you need:</strong></p>
       <ul style="margin:8px 0 16px 20px;padding:0;">
         ${decomposed.needs.map(n => `<li style="margin-bottom:8px;">${n.need}</li>`).join('')}
       </ul>
       <p>We're working on finding the right person for you and will be in touch shortly.</p>
       <p style="color:#7A6E68;font-size:14px;margin-top:24px;">If we've misunderstood anything, just reply to this email.</p>`;

  await send({
    to: user.email,
    subject: hasMatch
      ? `We found someone who can help — complete your introduction`
      : `We've received your goal — here's what we understood`,
    text: plainText,
    html: renderEmail({ preheader: decomposed.summary, body: htmlBody }),
  });
}

async function sendHelperIntro(user, goal, decomposed, helper) {
  const plainText = `Hi ${helper.name || ''},

Someone on the platform is looking for help and we think you're a good match.

What they need:
${decomposed.needs.map(n => `• ${n.need}`).join('\n')}

Context: ${decomposed.context}

What success looks like for them: ${decomposed.outcome}

Their contact: ${user.email}${user.name ? ` (${user.name})` : ''}

This introduction is made because your expertise overlaps with what they need. There's no obligation — reply to this email if you'd like to connect, or ignore it if it's not a good fit.

— The eskp.in team`;

  const htmlBody = `
    <p>Hi ${helper.name || ''},</p>
    <p>Someone on the platform is looking for help and we think you're a good match.</p>
    <p><strong>What they need:</strong></p>
    <ul style="margin:8px 0 16px 20px;padding:0;">
      ${decomposed.needs.map(n => `<li style="margin-bottom:8px;">${n.need}</li>`).join('')}
    </ul>
    <p><strong>Context:</strong> ${decomposed.context}</p>
    <p><strong>What success looks like for them:</strong> ${decomposed.outcome}</p>
    <p style="background:#F7EDE6;border-radius:6px;padding:12px 16px;margin:20px 0;">
      <strong>Their contact:</strong> <a href="mailto:${user.email}" style="color:#C4622D;">${user.email}</a>${user.name ? ` (${user.name})` : ''}
    </p>
    <p style="color:#7A6E68;font-size:14px;">This introduction is made because your expertise overlaps with what they need. There's no obligation — reply to this email if you'd like to connect, or ignore it if it's not a good fit.</p>`;

  await send({
    to: helper.email,
    subject: `Someone needs your help — ${decomposed.summary}`,
    text: plainText,
    html: renderEmail({ preheader: `${user.name || user.email} needs help: ${decomposed.summary}`, body: htmlBody }),
  });
}

async function logEmail(direction, from, to, subject, goalId, matchId) {
  await pool.query(
    `INSERT INTO emails (direction, from_address, to_address, subject, goal_id, match_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [direction, from, to, subject, goalId || null, matchId || null]
  );
}

async function recordInbound(from, to, subject, body, raw) {
  await pool.query(
    `INSERT INTO emails (direction, from_address, to_address, subject, body, raw)
     VALUES ('inbound', $1, $2, $3, $4, $5)`,
    [from, to, subject, body, JSON.stringify(raw)]
  );
}

async function sendHelperIntroById(goalId, matchId) {
  const { rows } = await pool.query(`
    SELECT
      g.id AS goal_id, g.decomposed,
      u.id AS user_id, u.email AS user_email, u.name AS user_name,
      m.id AS match_id,
      hu.email AS helper_email, hu.name AS helper_name
    FROM matches m
    JOIN goals g ON g.id = m.goal_id
    JOIN users u ON u.id = g.user_id
    JOIN helpers h ON h.id = m.helper_id
    JOIN users hu ON hu.id = h.user_id
    WHERE m.id = $1 AND g.id = $2
  `, [matchId, goalId]);

  if (!rows.length) throw new Error(`Match ${matchId} / goal ${goalId} not found`);
  const r = rows[0];
  const decomposed = r.decomposed;
  const user = { id: r.user_id, email: r.user_email, name: r.user_name };
  const helper = { email: r.helper_email, name: r.helper_name };

  // Mark paid
  await pool.query(
    `UPDATE matches SET status = 'introduced', paid_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [matchId]
  );
  await pool.query(
    `UPDATE goals SET status = 'introduced', updated_at = NOW() WHERE id = $1`,
    [goalId]
  );

  const goal = { id: goalId };
  await sendHelperIntro(user, goal, decomposed, helper);

  await logEmail('outbound', FROM, helper.email,
    `New introduction request from ${user.name || user.email}`, goalId, matchId);

  console.log(`sendHelperIntroById: introduced match ${matchId}`);
}

/**
 * TSK-049: Handle a goal that has been flagged as touching a sensitive domain.
 *
 * Creates the goal record with a sensitive_domain flag and status='submitted',
 * sends the user a basic acknowledgement (no match or payment link),
 * and alerts the panel for human review before any introduction is sent.
 *
 * @param {string} userEmail
 * @param {string|null} userName
 * @param {string} rawText
 * @param {string} sensitiveDomain - e.g. 'mental_health_crisis'
 * @param {string} sensitiveLabel  - human-readable label for the panel alert
 */
async function processGoalSensitive(userEmail, userName, rawText, sensitiveDomain, sensitiveLabel) {
  const user = await getOrCreateUser(userEmail, userName);

  // Record goal with sensitive_domain flag; status stays 'submitted' pending review
  const { rows: [goal] } = await pool.query(
    `INSERT INTO goals (user_id, raw_text, status, sensitive_domain)
     VALUES ($1, $2, 'submitted', $3) RETURNING *`,
    [user.id, rawText, sensitiveDomain]
  );

  // Send user a basic acknowledgement (no match, no payment link)
  const greeting = `Hi${user.name ? ` ${user.name}` : ''},`;
  const plainText = `${greeting}

Thank you for getting in touch with eskp.in.

We've received your message and a member of our team will review it shortly. We'll be in touch soon.

If this is an emergency or you need immediate support, please contact:
• Samaritans: 116 123 (free, 24/7)
• NHS 111: call 111
• Emergency services: 999

— The eskp.in team`;

  const htmlBody = `
    <p>${greeting}</p>
    <p>Thank you for getting in touch with eskp.in.</p>
    <p>We've received your message and a member of our team will review it shortly. We'll be in touch soon.</p>
    <p style="background:#F7EDE6;border-radius:6px;padding:12px 16px;margin:20px 0;font-size:14px;">
      <strong>If this is an emergency or you need immediate support:</strong><br>
      <strong>Samaritans:</strong> 116 123 (free, 24/7) &nbsp;|&nbsp;
      <strong>NHS 111:</strong> call 111 &nbsp;|&nbsp;
      <strong>Emergency:</strong> 999
    </p>`;

  await send({
    to: user.email,
    subject: `We've received your message`,
    text: plainText,
    html: renderEmail({ preheader: 'We\'ve received your message and will be in touch shortly.', body: htmlBody }),
  });

  await logEmail('outbound', FROM, user.email, `We've received your message`, goal.id, null);

  // Alert panel for human review
  const panelEmail = process.env.PANEL_EMAIL || 'panel@eskp.in';
  const panelText = `Sensitive-domain goal flagged for human review.

Goal ID: ${goal.id}
User: ${user.email}${user.name ? ` (${user.name})` : ''}
Domain: ${sensitiveLabel} (${sensitiveDomain})

Raw text:
---
${rawText.substring(0, 1000)}${rawText.length > 1000 ? '\n[truncated]' : ''}
---

Action required: review the goal in the database and either:
  - Approve for normal matching (update goals SET sensitive_domain = NULL WHERE id = '${goal.id}')
  - Route manually using sendHelperIntroById() after creating a match
  - Close as unsuitable and reply to the user

This email was sent automatically. Do not forward it externally.`;

  await send({
    to: panelEmail,
    subject: `[eskp.in] Sensitive goal requires review — ${sensitiveLabel}`,
    text: panelText,
    html: renderEmail({
      preheader: `Sensitive goal flagged: ${sensitiveLabel}`,
      body: `<p>A goal has been flagged as touching a sensitive domain and requires human review before any introduction is sent.</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr><td style="padding:6px 12px;font-weight:bold;background:#F7EDE6;width:140px;">Goal ID</td><td style="padding:6px 12px;">${goal.id}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;background:#F7EDE6;">User</td><td style="padding:6px 12px;">${user.email}${user.name ? ` (${user.name})` : ''}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;background:#F7EDE6;">Domain</td><td style="padding:6px 12px;">${sensitiveLabel} (${sensitiveDomain})</td></tr>
        </table>
        <p><strong>Raw text:</strong></p>
        <pre style="background:#f4f4f4;padding:12px;border-radius:4px;font-size:13px;white-space:pre-wrap;">${rawText.substring(0, 1000)}${rawText.length > 1000 ? '\n[truncated]' : ''}</pre>
        <p style="color:#5A5450;font-size:13px;">Review the goal and take appropriate action. The user has been acknowledged but no match has been sent.</p>`,
    }),
  });

  await logEmail('outbound', FROM, panelEmail, `[eskp.in] Sensitive goal requires review — ${sensitiveLabel}`, goal.id, null);

  console.log(`sensitive-flag: domain=${sensitiveDomain} goalId=${goal.id} email=${user.email}`);

  return { goal, user };
}

module.exports = { processGoal, processGoalSensitive, recordInbound, getOrCreateUser, sendHelperIntroById };
