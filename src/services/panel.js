/**
 * Panel service — Phase 2 advisory panel infrastructure.
 *
 * Provides functions for creating panels, inviting members, processing
 * invitation acceptance/decline, onboarding completion, and the
 * ensurePanelMember helper used by the match flow.
 *
 * Thread isolation rule: every query scoped to a panel member's request
 * must include WHERE panel_member_id = $1 from the authenticated session.
 */
const crypto = require('crypto');
const { pool } = require('../db/connection');
const { send } = require('./email');
const { renderEmail, safeHtml, rawHtml, escHtml } = require('./email-template');

const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';
const BASE_URL = process.env.BASE_URL || 'https://eskp.in';
const INVITATION_EXPIRY_DAYS = 14;
const SESSION_EXPIRY_DAYS = 30;

// ---------------------------------------------------------------------------
// Panel / member creation
// ---------------------------------------------------------------------------

/**
 * Get or create a panel for the given goal.
 * Returns the panel row.
 */
async function getOrCreatePanel(goalId, userId) {
  const { rows } = await pool.query(
    `INSERT INTO panels (goal_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [goalId, userId]
  );
  if (rows.length) return rows[0];

  const { rows: existing } = await pool.query(
    `SELECT * FROM panels WHERE goal_id = $1`,
    [goalId]
  );
  return existing[0];
}

/**
 * Create an invitation for an external advisor.
 *
 * @param {string} goalId
 * @param {string} inviterUserId  — must own the goal
 * @param {{ email, name, roleLabel, roleCharterText, note }} opts
 * @returns {{ panelMember, inviteUrl }}
 */
async function createPanelInvitation(goalId, inviterUserId, { email, name, roleLabel, roleCharterText, note }) {
  // Verify goal ownership
  const { rows: goalRows } = await pool.query(
    `SELECT id, decomposed FROM goals WHERE id = $1 AND user_id = $2`,
    [goalId, inviterUserId]
  );
  if (!goalRows.length) throw Object.assign(new Error('Goal not found or not owned by user'), { status: 403 });
  const goal = goalRows[0];

  // Get inviter user details
  const { rows: userRows } = await pool.query(
    `SELECT email, name FROM users WHERE id = $1`,
    [inviterUserId]
  );
  const inviter = userRows[0];

  const panel = await getOrCreatePanel(goalId, inviterUserId);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const { rows: [member] } = await pool.query(
    `INSERT INTO panel_members
       (panel_id, email, name, role_label, role_charter_text, status, invitation_token, invitation_expires_at)
     VALUES ($1, $2, $3, $4, $5, 'invited', $6, $7)
     RETURNING *`,
    [panel.id, email.toLowerCase().trim(), name || null, roleLabel || 'advisor', roleCharterText || null, token, expiresAt]
  );

  // Log interaction
  await pool.query(
    `INSERT INTO panel_interactions (panel_member_id, goal_id, interaction_type)
     VALUES ($1, $2, 'invited')`,
    [member.id, goalId]
  );

  const inviteUrl = `${BASE_URL}/panel/onboarding?t=${token}`;
  const declineUrl = `${BASE_URL}/panel/invite/decline?t=${token}`;

  const goalSummary = goal.decomposed?.summary || 'a goal on eskp.in';
  const inviterName = inviter?.name || inviter?.email || 'Someone';

  await sendInvitationEmail({
    to: email,
    inviterName,
    inviteeName: name,
    roleLabel: roleLabel || 'advisor',
    roleCharterText,
    goalSummary,
    note,
    inviteUrl,
    declineUrl,
    expiresAt,
  });

  console.log(`panel: invitation sent to ${email} for goal ${goalId} (member ${member.id})`);
  return { panelMember: member, inviteUrl };
}

async function sendInvitationEmail({ to, inviterName, inviteeName, roleLabel, roleCharterText, goalSummary, note, inviteUrl, declineUrl, expiresAt }) {
  const greeting = inviteeName ? `Hi ${inviteeName},` : 'Hi,';
  const expiryDateStr = expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const plainText = `${greeting}

${inviterName} has invited you to be their ${roleLabel} on eskp.in — a private platform where people work towards goals with trusted people in their corner.

What they're working on:
${goalSummary}${roleCharterText ? `\n\nYour role:\n${roleCharterText}` : ''}${note ? `\n\nA note from ${inviterName}:\n${note}` : ''}

Your involvement is entirely private — only you and ${inviterName} will see your thread. No other advisors (if any) can see your conversation.

Before joining, you'll complete a short onboarding module covering how the relationship works and your responsibilities.

Accept this invitation (link expires ${expiryDateStr}):
${inviteUrl}

Prefer not to? That's completely fine:
${declineUrl}

— The eskp.in team`;

  const htmlBody = safeHtml`
    <p>${inviteeName ? `Hi ${inviteeName},` : 'Hi,'}</p>
    <p><strong>${inviterName}</strong> has invited you to be their <strong>${roleLabel}</strong> on eskp.in — a private platform where people work towards goals with trusted people in their corner.</p>
    <p><strong>What they're working on:</strong></p>
    <p style="font-style:italic;color:#5A5450;border-left:3px solid #C4622D;padding-left:14px;margin:16px 0;">${goalSummary}</p>
    ${roleCharterText ? safeHtml`<p><strong>Your role:</strong> ${roleCharterText}</p>` : ''}
    ${note ? safeHtml`<p style="background:#F7EDE6;border-radius:6px;padding:12px 16px;margin:16px 0;font-size:14px;"><strong>A note from ${inviterName}:</strong><br>${note}</p>` : ''}
    <p style="color:#5A5450;font-size:14px;">Your involvement is entirely private — only you and <strong>${inviterName}</strong> will see your thread. No other advisors (if any) can see your conversation.</p>
    <p style="color:#5A5450;font-size:14px;">Before joining, you'll complete a short onboarding module covering how the relationship works and your responsibilities.</p>
    ${rawHtml(`<p style="text-align:center;margin:28px 0;">
      <a href="${escHtml(inviteUrl)}" style="background:#C4622D;color:#fff;padding:12px 24px;border-radius:5px;text-decoration:none;font-size:16px;display:inline-block;">
        Accept invitation
      </a>
    </p>`)}
    <p style="color:#9A8E88;font-size:13px;">Invitation expires ${escHtml(expiryDateStr)}. ${rawHtml(`<a href="${escHtml(declineUrl)}" style="color:#9A8E88;">Decline this invitation</a>`)}.</p>`;

  await send({
    to,
    subject: `${inviterName} invited you to be their ${roleLabel} on eskp.in`,
    text: plainText,
    html: renderEmail({ preheader: `${inviterName} wants your support on eskp.in`, body: htmlBody }),
  });
}

// ---------------------------------------------------------------------------
// Accept / decline
// ---------------------------------------------------------------------------

/**
 * Validate invitation token and return panel_member if valid.
 * Does NOT change status — that happens after onboarding is complete.
 */
async function validateInvitationToken(token) {
  const { rows } = await pool.query(
    `SELECT pm.*, p.goal_id, p.user_id AS panel_user_id
     FROM panel_members pm
     JOIN panels p ON p.id = pm.panel_id
     WHERE pm.invitation_token = $1`,
    [token]
  );
  if (!rows.length) return { valid: false, reason: 'not_found' };
  const member = rows[0];
  if (member.status === 'declined') return { valid: false, reason: 'declined' };
  if (member.status === 'accepted') return { valid: true, member, alreadyAccepted: true };
  if (member.invitation_expires_at && new Date(member.invitation_expires_at) < new Date()) {
    await pool.query(
      `UPDATE panel_members SET status = 'expired' WHERE id = $1`,
      [member.id]
    );
    return { valid: false, reason: 'expired' };
  }
  return { valid: true, member };
}

/**
 * Complete onboarding and accept the invitation.
 * Sets onboarding_completed_at, status=accepted, accepted_at, clears token.
 * Creates a session and returns the session token.
 */
async function completeOnboardingAndAccept(token) {
  const { valid, reason, member } = await validateInvitationToken(token);
  if (!valid) throw Object.assign(new Error(`Invalid invitation: ${reason}`), { status: 400 });

  const now = new Date();
  const { rows: [updated] } = await pool.query(
    `UPDATE panel_members
     SET status = 'accepted', accepted_at = $1, onboarding_completed_at = $1, invitation_token = NULL
     WHERE id = $2
     RETURNING *`,
    [now, member.id]
  );

  await pool.query(
    `INSERT INTO panel_interactions (panel_member_id, goal_id, interaction_type)
     VALUES ($1, $2, 'onboarded')`,
    [member.id, member.goal_id]
  );
  await pool.query(
    `INSERT INTO panel_interactions (panel_member_id, goal_id, interaction_type)
     VALUES ($1, $2, 'accepted')`,
    [member.id, member.goal_id]
  );

  // Notify inviter
  const { rows: panelRows } = await pool.query(
    `SELECT u.email, u.name FROM panels p JOIN users u ON u.id = p.user_id WHERE p.id = $1`,
    [member.panel_id]
  );
  if (panelRows.length) {
    const inviter = panelRows[0];
    const memberName = updated.name || updated.email;
    await send({
      to: inviter.email,
      subject: `${memberName} accepted your invitation on eskp.in`,
      text: `Hi${inviter.name ? ` ${inviter.name}` : ''},\n\n${memberName} has accepted your invitation and is now part of your advisory panel.\n\n— The eskp.in team`,
      html: renderEmail({
        preheader: `${memberName} joined your panel`,
        body: safeHtml`<p>Hi${inviter.name ? ` ${inviter.name}` : ''},</p>
          <p><strong>${memberName}</strong> has accepted your invitation and is now part of your advisory panel.</p>
          <p style="color:#7A6E68;font-size:14px;">They'll be in touch with you directly. If you have any questions, reply to this email.</p>`,
      }),
    }).catch(err => console.warn('panel: inviter notification failed (non-fatal):', err.message));
  }

  const sessionToken = await createSession(updated.id);
  return { panelMember: updated, sessionToken };
}

/**
 * Decline invitation.
 */
async function declinePanelInvitation(token) {
  const { rows } = await pool.query(
    `UPDATE panel_members
     SET status = 'declined'
     WHERE invitation_token = $1 AND status = 'invited'
     RETURNING id, goal_id, panel_id`,
    [token]
  );
  if (!rows.length) return { success: false };

  const member = rows[0];

  // Get goal_id via panel if needed
  const { rows: panelRows } = await pool.query(
    `SELECT goal_id FROM panels WHERE id = $1`,
    [member.panel_id]
  );
  const goalId = member.goal_id || panelRows[0]?.goal_id;

  if (goalId) {
    await pool.query(
      `INSERT INTO panel_interactions (panel_member_id, goal_id, interaction_type)
       VALUES ($1, $2, 'declined')`,
      [member.id, goalId]
    );
  }
  return { success: true };
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

async function createSession(panelMemberId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO panel_sessions (panel_member_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [panelMemberId, token, expiresAt]
  );
  return token;
}

/**
 * Validate a session token. Returns panel member context or null.
 */
async function validateSession(token) {
  if (!token) return null;
  const { rows } = await pool.query(
    `SELECT ps.id AS session_id, ps.panel_member_id, ps.expires_at,
            pm.email, pm.name, pm.panel_id, pm.status AS member_status,
            p.goal_id
     FROM panel_sessions ps
     JOIN panel_members pm ON pm.id = ps.panel_member_id
     JOIN panels p ON p.id = pm.panel_id
     WHERE ps.token = $1`,
    [token]
  );
  if (!rows.length) return null;
  const session = rows[0];
  if (new Date(session.expires_at) < new Date()) return null;

  // Touch last_used_at
  pool.query(
    `UPDATE panel_sessions SET last_used_at = NOW() WHERE id = $1`,
    [session.session_id]
  ).catch(() => {});

  return {
    id: session.panel_member_id,
    panelId: session.panel_id,
    email: session.email,
    name: session.name,
    goalId: session.goal_id,
  };
}

// ---------------------------------------------------------------------------
// Dashboard / thread data
// ---------------------------------------------------------------------------

/**
 * Return all panel memberships for this panel_member_id (scoped to session owner).
 */
async function getDashboardData(panelMemberId) {
  const { rows } = await pool.query(
    `SELECT
       pm.id AS panel_member_id,
       pm.role_label,
       pm.status,
       pm.accepted_at,
       pm.invited_at,
       g.decomposed->>'summary' AS goal_summary,
       (SELECT MAX(e.created_at) FROM emails e WHERE e.panel_member_id = pm.id) AS last_activity
     FROM panel_members pm
     JOIN panels p ON p.id = pm.panel_id
     JOIN goals g ON g.id = p.goal_id
     WHERE pm.id = $1`,
    [panelMemberId]
  );
  return rows;
}

/**
 * Return thread data for a panel member (strictly scoped).
 */
async function getThreadData(panelMemberId, requestingMemberId) {
  // Scope check: panel_member must match authenticated session
  if (panelMemberId !== requestingMemberId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  const { rows: memberRows } = await pool.query(
    `SELECT pm.*, p.goal_id,
            g.decomposed
     FROM panel_members pm
     JOIN panels p ON p.id = pm.panel_id
     JOIN goals g ON g.id = p.goal_id
     WHERE pm.id = $1`,
    [panelMemberId]
  );
  if (!memberRows.length) throw Object.assign(new Error('Not found'), { status: 404 });
  const member = memberRows[0];

  const { rows: emails } = await pool.query(
    `SELECT direction, from_address, to_address, subject, created_at,
            LEFT(body, 200) AS body_snippet
     FROM emails
     WHERE panel_member_id = $1
     ORDER BY created_at ASC`,
    [panelMemberId]
  );

  return {
    panelMember: member,
    goal: {
      summary: member.decomposed?.summary,
      needs: member.decomposed?.needs || [],
    },
    emails,
  };
}

// ---------------------------------------------------------------------------
// Flag for support
// ---------------------------------------------------------------------------

/**
 * Flag a panel member's concern. Sends user a warm check-in email.
 * Deduplicates: no flag within the last 24 hours.
 *
 * @param {string} panelMemberId  — must match authenticated session
 * @param {string} requestingId   — from req.panelMember.id
 */
async function flagForSupport(panelMemberId, requestingId) {
  if (panelMemberId !== requestingId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  // Deduplication: check last 24h
  const { rows: recent } = await pool.query(
    `SELECT id FROM panel_interactions
     WHERE panel_member_id = $1 AND interaction_type = 'flagged'
       AND created_at > NOW() - INTERVAL '24 hours'`,
    [panelMemberId]
  );
  if (recent.length) return { deduplicated: true };

  // Get goal + user details (scoped to this panel member)
  const { rows } = await pool.query(
    `SELECT pm.id AS panel_member_id, p.goal_id, p.user_id,
            u.email AS user_email, u.name AS user_name
     FROM panel_members pm
     JOIN panels p ON p.id = pm.panel_id
     JOIN users u ON u.id = p.user_id
     WHERE pm.id = $1`,
    [panelMemberId]
  );
  if (!rows.length) throw Object.assign(new Error('Not found'), { status: 404 });
  const { goal_id: goalId, user_email: userEmail, user_name: userName } = rows[0];

  await pool.query(
    `INSERT INTO panel_interactions (panel_member_id, goal_id, interaction_type)
     VALUES ($1, $2, 'flagged')`,
    [panelMemberId, goalId]
  );

  // Send user a warm, non-alarming check-in email (no reference to flag or concern)
  const greeting = `Hi${userName ? ` ${userName}` : ''},`;
  const plainText = `${greeting}

We just wanted to reach out and let you know that support is always available to you.

Whatever you're working through, you don't have to do it alone. If you ever need to talk to someone:

• Samaritans: 116 123 (free, 24/7)
• Mind: https://www.mind.org.uk
• Full support resources: https://eskp.in/support.html

If there's anything we can do on the platform side, just reply to this email.

— The eskp.in team`;

  const htmlBody = safeHtml`
    <p>Hi${userName ? ` ${userName}` : ''},</p>
    <p>We just wanted to reach out and let you know that <strong>support is always available to you</strong>.</p>
    <p style="color:#5A5450;">Whatever you're working through, you don't have to do it alone.</p>
    ${rawHtml(`<p style="background:#F7EDE6;border-left:3px solid #C4622D;border-radius:0 6px 6px 0;padding:12px 16px;margin:20px 0;font-size:14px;">
      <strong>Samaritans:</strong> 116 123 (free, 24/7)<br>
      <strong>Mind:</strong> <a href="https://www.mind.org.uk" style="color:#C4622D;">mind.org.uk</a><br>
      <a href="https://eskp.in/support.html" style="color:#C4622D;font-weight:500;">Full support resources →</a>
    </p>`)}
    <p style="color:#7A6E68;font-size:14px;">If there's anything we can do on the platform side, just reply to this email.</p>`;

  await send({
    to: userEmail,
    subject: 'A gentle check-in from eskp.in',
    text: plainText,
    html: renderEmail({ preheader: 'Support is always available to you.', body: htmlBody }),
  });

  console.log(`panel: flagForSupport — sent check-in to ${userEmail} (goal ${goalId})`);
  return { deduplicated: false };
}

// ---------------------------------------------------------------------------
// Match-flow integration
// ---------------------------------------------------------------------------

/**
 * Called after helper intro email sends. Creates panel + panel_member for the
 * helper (bypasses onboarding gate — helpers are pre-vetted).
 *
 * @param {string} goalId
 * @param {{ email, name }} helper  — helper user details
 * @param {{ id: string, helper_id: string }} match
 */
async function ensurePanelMember(goalId, helper, match) {
  // Get goal user_id
  const { rows: goalRows } = await pool.query(
    `SELECT user_id FROM goals WHERE id = $1`,
    [goalId]
  );
  if (!goalRows.length) throw new Error(`ensurePanelMember: goal ${goalId} not found`);
  const userId = goalRows[0].user_id;

  const panel = await getOrCreatePanel(goalId, userId);

  const now = new Date();

  // Upsert panel_member by helper_id + panel_id
  const { rows: [member] } = await pool.query(
    `INSERT INTO panel_members
       (panel_id, helper_id, email, name, role_label, status, accepted_at, onboarding_completed_at)
     VALUES ($1, $2, $3, $4, 'matched helper', 'accepted', $5, $5)
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [panel.id, match.helper_id, helper.email, helper.name || null, now]
  );

  if (!member) {
    // Already exists — just return
    console.log(`panel: ensurePanelMember — member already exists for helper ${match.helper_id} on goal ${goalId}`);
    return;
  }

  await pool.query(
    `INSERT INTO panel_interactions (panel_member_id, goal_id, interaction_type)
     VALUES ($1, $2, 'accepted')`,
    [member.id, goalId]
  );

  // Tag existing emails for this match with the panel_member_id
  await pool.query(
    `UPDATE emails SET panel_member_id = $1 WHERE match_id = $2 AND panel_member_id IS NULL`,
    [member.id, match.id]
  );

  console.log(`panel: ensurePanelMember — created panel member ${member.id} for helper ${match.helper_id} on goal ${goalId}`);
}

module.exports = {
  createPanelInvitation,
  validateInvitationToken,
  completeOnboardingAndAccept,
  declinePanelInvitation,
  validateSession,
  getDashboardData,
  getThreadData,
  flagForSupport,
  ensurePanelMember,
};
