/**
 * Core platform orchestration.
 * Handles the full flow: inbound email → goal → decompose → match → introduce.
 */
const { pool } = require('../db/connection');
const { decompose } = require('./decompose');
const { findMatches } = require('./match');
const { send } = require('./email');
const { renderEmail, textToHtml } = require('./email-template');

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

  // Record top match
  const topMatch = matches[0];
  const { rows: [match] } = await pool.query(
    `INSERT INTO matches (goal_id, helper_id, reasoning, status)
     VALUES ($1, $2, $3, 'introduced') RETURNING *`,
    [goal.id, topMatch.helper_id, `Expertise overlap on: ${topMatch.expertise.join(', ')}`]
  );

  await pool.query(`UPDATE goals SET status = 'introduced', updated_at = NOW() WHERE id = $1`, [goal.id]);

  // Send emails
  await sendAcknowledgement(user, goal, decomposed, topMatch);
  await sendHelperIntro(user, goal, decomposed, topMatch);

  // Log outbound emails
  await logEmail('outbound', FROM, user.email, `Re: your goal — we found someone who can help`, goal.id, match.id);
  await logEmail('outbound', FROM, topMatch.email, `New introduction request from ${user.name || user.email}`, goal.id, match.id);

  return { goal, decomposed, match, matches };
}

async function sendAcknowledgement(user, goal, decomposed, helper) {
  const helperLine = helper
    ? `We've matched you with <strong>${helper.name || helper.email}</strong>, who has relevant experience.`
    : `We're working on finding the right person for you and will be in touch shortly.`;

  const greeting = `Hi${user.name ? ` ${user.name}` : ''},`;
  const needsList = decomposed.needs.map(n => `• ${n.need}`).join('\n');
  const nextStep = helper
    ? `${helper.name || helper.email} will be in touch directly.`
    : `We'll email you once we've found a match.`;

  const plainText = `${greeting}

We received your message and here's how we understood your goal:

${decomposed.summary}

What you need:
${needsList}

${helperLine.replace(/<[^>]+>/g, '')}

What happens next: ${nextStep}

If we've misunderstood anything, just reply to this email.

— The eskp.in team`;

  const htmlBody = `
    <p>${greeting}</p>
    <p>We received your message and here's how we understood your goal:</p>
    <p style="font-style:italic;color:#5A5450;border-left:3px solid #C4622D;padding-left:14px;margin:16px 0;">${decomposed.summary}</p>
    <p><strong>What you need:</strong></p>
    <ul style="margin:8px 0 16px 20px;padding:0;">
      ${decomposed.needs.map(n => `<li style="margin-bottom:8px;">${n.need}</li>`).join('')}
    </ul>
    <p>${helperLine}</p>
    <p><strong>What happens next:</strong> ${nextStep}</p>
    <p style="color:#7A6E68;font-size:14px;margin-top:24px;">If we've misunderstood anything, just reply to this email.</p>`;

  await send({
    to: user.email,
    subject: `We've received your goal — here's what we understood`,
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

module.exports = { processGoal, recordInbound, getOrCreateUser };
