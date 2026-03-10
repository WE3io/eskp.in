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

  // Clarification loop: goal is too vague to match
  if (decomposed.needs_clarification && decomposed.clarification_questions.length > 0) {
    await pool.query(
      `UPDATE goals SET decomposed = $1, status = 'pending_clarification', updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(decomposed), goal.id]
    );
    // raw_text is retained while pending_clarification (needed to build combined text on reply)
    await sendClarificationRequest(user, goal, decomposed);
    console.log(`clarification: goal ${goal.id} set to pending_clarification`);
    return { goal, decomposed, needsClarification: true };
  }

  // Null raw_text once decomposition is stored — GDPR Art.5(1)(e) storage limitation.
  // The decomposed column holds all information needed for matching.
  await pool.query(
    `UPDATE goals SET decomposed = $1, raw_text = NULL, status = 'matched', updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(decomposed), goal.id]
  );

  // Find helpers
  const matches = await findMatches(decomposed);

  // TSK-073: pre-match notification — heads-up to relevant helpers before formal intro
  if (matches.length > 0) {
    await sendPreMatchNotification(goal, decomposed, matches).catch(err =>
      console.warn('pre-match notification failed (non-fatal):', err.message)
    );
  }

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

  const privacyFooter = `\n\n---\nYour message was analysed by AI to identify what kind of help you need. We store your email and goal description to find you a match — nothing else. Privacy policy: https://eskp.in/privacy.html`;

  const plainText = hasMatch
    ? `${greeting}

We received your message and here's how we've understood your goal — please reply if anything looks off:

${decomposed.summary}

What we think you need:
${needsList}

Good news — we found someone who can help: ${helper.name || 'a helper in our network'}.${helper.bio ? `\n\n${helper.bio}` : ''}

To get the introduction, complete a one-time £10 payment:
${paymentUrl}

— The eskp.in team${privacyFooter}`
    : `${greeting}

We received your message and here's how we've understood your goal — please reply if anything looks off:

${decomposed.summary}

What we think you need:
${needsList}

We're looking for the right person and will get back to you within 24 hours. If we don't have a match yet, we'll tell you honestly rather than keep you waiting.

— The eskp.in team${privacyFooter}`;

  const privacyNote = `<p style="color:#9A8E88;font-size:13px;border-top:1px solid #E8E0D8;margin-top:24px;padding-top:14px;">
       Your message was analysed by AI to identify what kind of help you need.
       We store your email address and goal description to find you a match — nothing else.
       <a href="https://eskp.in/privacy.html" style="color:#9A8E88;">Privacy policy</a>.
     </p>`;

  const htmlBody = hasMatch
    ? `<p>${greeting}</p>
       <p>We received your message. Here's how we've understood your goal — <strong>reply if anything looks off</strong>:</p>
       <p style="font-style:italic;color:#5A5450;border-left:3px solid #C4622D;padding-left:14px;margin:16px 0;">${decomposed.summary}</p>
       <p><strong>What we think you need:</strong></p>
       <ul style="margin:8px 0 16px 20px;padding:0;">
         ${decomposed.needs.map(n => `<li style="margin-bottom:8px;">${n.need}</li>`).join('')}
       </ul>
       <p>Good news — we found someone who can help: <strong>${helper.name || 'a helper in our network'}</strong>.</p>
       ${helper.bio ? `<p style="color:#5A5450;font-size:0.9em;background:#F7EDE6;border-radius:5px;padding:10px 14px;margin:12px 0;">${helper.bio}</p>` : ''}
       <p>To get the introduction, complete a one-time payment of <strong>£10</strong>:</p>
       <p style="text-align:center;margin:24px 0;">
         <a href="${paymentUrl}" style="background:#C4622D;color:#fff;padding:12px 24px;border-radius:5px;text-decoration:none;font-size:16px;">
           Pay £10 and get introduced
         </a>
       </p>
       ${privacyNote}`
    : `<p>${greeting}</p>
       <p>We received your message. Here's how we've understood your goal — <strong>reply if anything looks off</strong>:</p>
       <p style="font-style:italic;color:#5A5450;border-left:3px solid #C4622D;padding-left:14px;margin:16px 0;">${decomposed.summary}</p>
       <p><strong>What we think you need:</strong></p>
       <ul style="margin:8px 0 16px 20px;padding:0;">
         ${decomposed.needs.map(n => `<li style="margin-bottom:8px;">${n.need}</li>`).join('')}
       </ul>
       <p>We're looking for the right person and will get back to you <strong>within 24 hours</strong>. If we don't have a match yet, we'll tell you honestly rather than keep you waiting.</p>
       ${privacyNote}`;

  await send({
    to: user.email,
    subject: hasMatch
      ? `We found a match — does this look right?`
      : `Here's what we understood — does this look right?`,
    text: plainText,
    html: renderEmail({ preheader: decomposed.summary, body: htmlBody }),
  });
}

async function sendClarificationRequest(user, goal, decomposed) {
  const greeting = `Hi${user.name ? ` ${user.name}` : ''},`;
  const questionsList = decomposed.clarification_questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
  const questionsHtml = decomposed.clarification_questions.map(q => `<li style="margin-bottom:10px;">${q}</li>`).join('');

  const plainText = `${greeting}

We received your message. We'd like to help but need a bit more information to find the right person for you.

A few questions:

${questionsList}

Just reply to this email with your answers — no need to be exhaustive, whatever you can share will help.

— The eskp.in team`;

  const htmlBody = `<p>${greeting}</p>
    <p>We received your message. We'd like to help but need a bit more information to find the right person for you.</p>
    <p><strong>A few questions:</strong></p>
    <ol style="margin:8px 0 16px 20px;padding:0;">
      ${questionsHtml}
    </ol>
    <p style="color:#7A6E68;font-size:14px;">Just reply to this email with your answers — no need to be exhaustive, whatever you can share will help.</p>`;

  await send({
    to: user.email,
    subject: `We need a bit more information about your goal`,
    text: plainText,
    html: renderEmail({ preheader: 'A few quick questions to help us find the right person for you.', body: htmlBody }),
  });
  await logEmail('outbound', FROM, user.email, `We need a bit more information about your goal`, goal.id, null);
}

async function processClarification(userEmail, userName, replyText, pendingGoal) {
  const user = await getOrCreateUser(userEmail, userName);

  // Append the clarification to the original submission for re-decomposition
  const originalText = pendingGoal.raw_text || '';
  const combinedText = `${originalText}\n\n---\nClarification from user:\n${replyText}`;

  // Update the goal with combined text and reset to decomposing
  await pool.query(
    `UPDATE goals SET raw_text = $1, status = 'decomposing', updated_at = NOW() WHERE id = $2`,
    [combinedText, pendingGoal.id]
  );

  // Re-run decomposition with combined text
  let decomposed;
  try {
    decomposed = await decompose(combinedText, pendingGoal.id);
  } catch (err) {
    await pool.query(`UPDATE goals SET status = 'pending_clarification' WHERE id = $1`, [pendingGoal.id]);
    throw err;
  }

  // If still needs clarification, send another round (max 1 follow-up to avoid loops)
  if (decomposed.needs_clarification && decomposed.clarification_questions.length > 0) {
    await pool.query(
      `UPDATE goals SET decomposed = $1, status = 'pending_clarification', updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(decomposed), pendingGoal.id]
    );
    await sendClarificationRequest(user, pendingGoal, decomposed);
    console.log(`clarification: goal ${pendingGoal.id} still vague after clarification reply, sent follow-up`);
    return { goal: pendingGoal, decomposed, needsClarification: true };
  }

  // Null raw_text once decomposition is stored — GDPR Art.5(1)(e).
  await pool.query(
    `UPDATE goals SET decomposed = $1, raw_text = NULL, status = 'matched', updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(decomposed), pendingGoal.id]
  );

  const matches = await findMatches(decomposed);

  // TSK-073: pre-match notification
  if (matches.length > 0) {
    await sendPreMatchNotification(pendingGoal, decomposed, matches).catch(err =>
      console.warn('pre-match notification failed (non-fatal):', err.message)
    );
  }

  if (matches.length === 0) {
    await sendAcknowledgement(user, pendingGoal, decomposed, null);
    return { goal: pendingGoal, decomposed, matches: [] };
  }

  const topMatch = matches[0];
  const { rows: [match] } = await pool.query(
    `INSERT INTO matches (goal_id, helper_id, reasoning, status)
     VALUES ($1, $2, $3, 'proposed') RETURNING *`,
    [pendingGoal.id, topMatch.helper_id, topMatch.reasoning || `Expertise overlap on: ${topMatch.expertise.join(', ')}`]
  );

  const { sessionId, url: paymentUrl } = await createIntroCheckout({
    goalId: pendingGoal.id,
    matchId: match.id,
    userEmail: user.email,
    summary: decomposed.summary,
  });

  await pool.query(`UPDATE matches SET stripe_session_id = $1 WHERE id = $2`, [sessionId, match.id]);
  await pool.query(`UPDATE goals SET status = 'matched', updated_at = NOW() WHERE id = $1`, [pendingGoal.id]);

  await sendAcknowledgement(user, pendingGoal, decomposed, topMatch, paymentUrl);
  await logEmail('outbound', FROM, user.email, `Re: your goal — we found someone who can help`, pendingGoal.id, match.id);

  return { goal: pendingGoal, decomposed, match, matches };
}

/**
 * TSK-073: Pre-match heads-up email to relevant helpers.
 *
 * Sent before the formal introduction fires (which requires payment).
 * Gives helpers early visibility of demand in their area, increasing
 * engagement and reducing the chance they've gone cold when the intro arrives.
 *
 * Only sent to helpers who scored above the relevance threshold.
 * Does NOT share any user contact details — goal summary only.
 */
async function sendPreMatchNotification(goal, decomposed, matches) {
  const SCORE_THRESHOLD = 40; // only notify helpers with meaningful relevance
  const relevant = matches.filter(m => !m.score || m.score >= SCORE_THRESHOLD);
  if (relevant.length === 0) return;

  const needsList = decomposed.needs.map(n => `• ${n.need}`).join('\n');

  for (const helper of relevant) {
    const greeting = `Hi${helper.name ? ` ${helper.name}` : ''},`;

    const plainText = `${greeting}

A new goal has come in on eskp.in that looks relevant to your expertise.

What they need:
${needsList}

We're working on finding them the best match now. If this looks like something you could help with, no action is needed — we'll be in touch if you're selected.

This is just a heads-up so you're not caught off-guard. We'll follow up with full details if you're matched.

— The eskp.in team`;

    const htmlBody = `<p>${greeting}</p>
      <p>A new goal has come in on eskp.in that looks relevant to your expertise.</p>
      <p><strong>What they need:</strong></p>
      <ul style="margin:8px 0 16px 20px;padding:0;">
        ${decomposed.needs.map(n => `<li style="margin-bottom:7px;">${n.need}</li>`).join('')}
      </ul>
      <p style="color:#7A6E68;font-size:14px;background:#F9F6F0;border-left:3px solid #C4622D;padding:10px 14px;margin:16px 0;">
        We're working on finding them the best match. <strong>No action needed right now</strong> — if you're selected, we'll send you full contact details.
      </p>
      <p style="color:#7A6E68;font-size:14px;">This is just a heads-up so you're not caught off-guard. We'll follow up with everything you need if you're matched.</p>`;

    await send({
      to: helper.email,
      subject: `New goal in your area — ${decomposed.summary.slice(0, 60)}`,
      text: plainText,
      html: renderEmail({
        preheader: 'A new goal has come in that looks relevant to your expertise.',
        body: htmlBody,
      }),
    });
    await logEmail('outbound', FROM, helper.email, `New goal in your area — ${decomposed.summary.slice(0, 60)}`, goal.id, null);
    console.log(`pre-match notification sent to ${helper.email} for goal ${goal.id}`);
  }
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

module.exports = { processGoal, processGoalSensitive, processClarification, recordInbound, getOrCreateUser, sendHelperIntroById };
