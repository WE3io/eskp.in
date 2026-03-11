/**
 * TSK-021 / TSK-022: Account deletion and data export.
 *
 * Deletion flow:
 *   1. User emails with "delete my account" in subject
 *   2. requestDeletion() acknowledges and sends a confirmation link (token, 48h expiry)
 *   3. User visits GET /account/delete/confirm?token=xxx
 *   4. executeDeletion() cascade-deletes all user rows and writes an anonymised log entry
 *   5. Confirmation email sent
 *
 * Export flow:
 *   1. User emails with "export my data" in subject
 *   2. processExportRequest() generates a one-time download token (48h expiry) and emails the link
 *   3. User visits GET /account/export?token=xxx
 *   4. getExportData() returns all user rows as JSON
 */

const crypto = require('crypto');
const { pool } = require('../db/connection');
const { send } = require('./email');
const { renderEmail, escHtml } = require('./email-template');
const { getOrCreateUser } = require('./platform');

const BASE_URL = process.env.BASE_URL || 'https://eskp.in';
const PANEL_EMAIL = process.env.PANEL_EMAIL || 'panel@eskp.in';
const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';
const TOKEN_TTL_HOURS = 48;

// ── helpers ─────────────────────────────────────────────────────────────────

async function generateToken(userId, type) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO account_tokens (user_id, token, type, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, token, type, expiresAt]
  );
  return token;
}

async function consumeToken(token, type) {
  const { rows } = await pool.query(
    `UPDATE account_tokens
     SET used_at = NOW()
     WHERE token = $1 AND type = $2 AND used_at IS NULL AND expires_at > NOW()
     RETURNING user_id`,
    [token, type]
  );
  return rows[0] || null;
}

// ── data export ──────────────────────────────────────────────────────────────

/**
 * Inbound email handler: generate token, email download link.
 */
async function processExportRequest(userEmail, userName) {
  const user = await getOrCreateUser(userEmail, userName);
  const token = await generateToken(user.id, 'export');
  const link = `${BASE_URL}/account/export?token=${token}`;

  const plainText = `Hi${user.name ? ` ${user.name}` : ''},

We received your data export request.

Your download link (valid for 48 hours):
${link}

This link will return a JSON file containing all data we hold for your account: your profile, goals, matches, and emails.

If you didn't request this, you can ignore this email.

— The eskp.in team`;

  const htmlBody = `
    <p>Hi${user.name ? ` ${escHtml(user.name)}` : ''},</p>
    <p>We received your data export request.</p>
    <p>Your download link is valid for 48 hours:</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${link}" style="background:#C4622D;color:#fff;padding:12px 24px;border-radius:5px;text-decoration:none;font-size:16px;">
        Download my data
      </a>
    </p>
    <p style="color:#7A6E68;font-size:14px;">This file contains all data eskp.in holds for your account in JSON format. If you didn't request this, you can ignore this email.</p>`;

  await send({
    to: user.email,
    subject: 'Your data export — download link',
    text: plainText,
    html: renderEmail({ preheader: 'Your data download link is ready.', body: htmlBody }),
  });

  console.log(`account: export token generated for user ${user.id}`);
  return { user };
}

/**
 * GET /account/export?token=xxx — validate token, return user JSON.
 * Returns null if token is invalid or expired.
 */
async function getExportData(token) {
  const row = await consumeToken(token, 'export');
  if (!row) return null;
  const userId = row.user_id;

  const [userRows, goalRows, matchRows, emailRows, feedbackRows, helperRows, helperAppRows] = await Promise.all([
    pool.query(`SELECT id, email, name, created_at FROM users WHERE id = $1`, [userId]),
    pool.query(`SELECT id, raw_text, decomposed, status, sensitive_domain, ai_opted_out, created_at, updated_at FROM goals WHERE user_id = $1 ORDER BY created_at`, [userId]),
    pool.query(`
      SELECT m.id, m.goal_id, m.status, m.reasoning, m.created_at, m.updated_at
      FROM matches m
      JOIN goals g ON g.id = m.goal_id
      WHERE g.user_id = $1
      ORDER BY m.created_at`, [userId]),
    pool.query(`SELECT id, direction, from_address, to_address, subject, created_at FROM emails WHERE from_address = (SELECT email FROM users WHERE id = $1) OR to_address = (SELECT email FROM users WHERE id = $1) ORDER BY created_at`, [userId]),
    pool.query(`SELECT id, goal_id, source, content, created_at FROM feedback WHERE user_id = $1 ORDER BY created_at`, [userId]),
    pool.query(`SELECT id, expertise, bio, is_active, created_at FROM helpers WHERE user_id = $1`, [userId]),
    pool.query(`SELECT id, name, expertise_description, status, created_at FROM helper_applications WHERE email = (SELECT email FROM users WHERE id = $1)`, [userId]),
  ]);

  return {
    exported_at: new Date().toISOString(),
    platform: 'eskp.in',
    account: userRows.rows[0] || null,
    goals: goalRows.rows,
    matches: matchRows.rows,
    emails: emailRows.rows,
    feedback: feedbackRows.rows,
    helper_profile: helperRows.rows[0] || null,
    helper_applications: helperAppRows.rows,
  };
}

// ── account deletion ─────────────────────────────────────────────────────────

/**
 * Inbound email handler: acknowledge deletion request, send confirmation link.
 */
async function requestDeletion(userEmail, userName) {
  const user = await getOrCreateUser(userEmail, userName);
  const token = await generateToken(user.id, 'delete_confirm');
  const confirmLink = `${BASE_URL}/account/delete/confirm?token=${token}`;

  const plainText = `Hi${user.name ? ` ${user.name}` : ''},

We received your request to delete your eskp.in account.

To confirm the deletion, visit this link (valid for 48 hours):
${confirmLink}

What will be deleted:
• Your account and profile
• All goals you submitted
• All matches and introductions
• All emails in our system associated with your account
• Any feedback you submitted
• Any helper application you submitted

This action cannot be undone. Your data will be permanently removed within 30 days (usually immediately).

If you didn't request this, you can ignore this email — no action will be taken.

— The eskp.in team`;

  const htmlBody = `
    <p>Hi${user.name ? ` ${escHtml(user.name)}` : ''},</p>
    <p>We received your request to delete your eskp.in account.</p>
    <p>To confirm the deletion, click the button below (valid for 48 hours):</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${confirmLink}" style="background:#8B1A1A;color:#fff;padding:12px 24px;border-radius:5px;text-decoration:none;font-size:16px;">
        Confirm account deletion
      </a>
    </p>
    <p><strong>What will be deleted:</strong></p>
    <ul style="margin:8px 0 16px 20px;padding:0;">
      <li>Your account and profile</li>
      <li>All goals you submitted</li>
      <li>All matches and introductions</li>
      <li>All emails in our system associated with your account</li>
      <li>Any feedback you submitted</li>
    </ul>
    <p style="color:#8B1A1A;font-size:14px;">This action cannot be undone.</p>
    <p style="color:#7A6E68;font-size:14px;">If you didn't request this, you can ignore this email — no action will be taken.</p>`;

  await send({
    to: user.email,
    subject: 'Confirm account deletion — eskp.in',
    text: plainText,
    html: renderEmail({ preheader: 'Confirm your account deletion request.', body: htmlBody }),
  });

  console.log(`account: deletion requested for user ${user.id}`);
  return { user };
}

/**
 * GET /account/delete/confirm?token=xxx — validate token, execute cascade delete.
 * Returns { deleted: true, email } on success, null on invalid/expired token.
 */
async function confirmDeletion(token) {
  const row = await consumeToken(token, 'delete_confirm');
  if (!row) return null;
  const userId = row.user_id;

  // Fetch email before deletion for the confirmation email
  const { rows: [user] } = await pool.query(`SELECT email, name FROM users WHERE id = $1`, [userId]);
  if (!user) return null;

  await executeDeletion(userId, user.email, user.name);
  return { deleted: true, email: user.email, name: user.name };
}

/**
 * Cascade-delete all rows for a user. Writes an anonymised audit log entry.
 * Order matters: child tables first, then users.
 */
async function executeDeletion(userId, userEmail, userName) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Count rows for audit log
    const counts = await Promise.all([
      client.query(`SELECT COUNT(*) FROM feedback WHERE user_id = $1`, [userId]),
      client.query(`SELECT COUNT(*) FROM emails WHERE from_address = $1 OR to_address = $1`, [userEmail]),
      client.query(`
        SELECT COUNT(*) FROM matches m
        JOIN goals g ON g.id = m.goal_id WHERE g.user_id = $1`, [userId]),
      client.query(`SELECT COUNT(*) FROM goals WHERE user_id = $1`, [userId]),
    ]);

    const [feedbackCount, emailCount, matchCount, goalCount] = counts.map(r => parseInt(r.rows[0].count, 10));

    // Delete in dependency order
    await client.query(`DELETE FROM feedback WHERE user_id = $1`, [userId]);

    // Delete emails referencing goals owned by this user
    await client.query(`
      DELETE FROM emails WHERE goal_id IN (SELECT id FROM goals WHERE user_id = $1)`, [userId]);
    // Also delete emails by from/to address
    await client.query(`DELETE FROM emails WHERE from_address = $1 OR to_address = $1`, [userEmail]);

    // Delete account tokens
    await client.query(`DELETE FROM account_tokens WHERE user_id = $1`, [userId]);

    // Delete matches for goals owned by this user
    await client.query(`
      DELETE FROM matches WHERE goal_id IN (SELECT id FROM goals WHERE user_id = $1)`, [userId]);

    // Delete goals
    await client.query(`DELETE FROM goals WHERE user_id = $1`, [userId]);

    // Delete helper record (user may also be a helper)
    const { rows: [helperCountRow] } = await client.query(
      `SELECT COUNT(*) FROM helpers WHERE user_id = $1`, [userId]
    );
    await client.query(`DELETE FROM helpers WHERE user_id = $1`, [userId]);
    const helperCount = parseInt(helperCountRow.count, 10);

    // Delete helper applications by email (separate entity but contains personal data)
    const { rows: [helperAppCount] } = await client.query(
      `SELECT COUNT(*) FROM helper_applications WHERE email = $1`,
      [userEmail]
    );
    await client.query(`DELETE FROM helper_applications WHERE email = $1`, [userEmail]);
    const helperApplicationCount = parseInt(helperAppCount.count, 10);

    // Soft-delete user row (set deleted_at); we keep the stub for referential integrity
    // but email is cleared so the account is effectively gone
    await client.query(
      `UPDATE users SET email = $1, name = NULL, deleted_at = NOW() WHERE id = $2`,
      [`deleted-${userId}@deleted.invalid`, userId]
    );

    // Write anonymised audit log
    const totalRows = feedbackCount + emailCount + matchCount + goalCount + helperCount + helperApplicationCount + 1;
    await client.query(
      `INSERT INTO deletion_log (tables_affected, rows_deleted)
       VALUES ($1, $2)`,
      [['users', 'goals', 'matches', 'emails', 'feedback', 'account_tokens', 'helpers', 'helper_applications'], totalRows]
    );

    await client.query('COMMIT');
    console.log(`account: deletion executed for user ${userId} — ${totalRows} rows affected`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // Send confirmation (user email still works at this point as we haven't changed it yet in memory)
  const plainText = `Hi${userName ? ` ${userName}` : ''},

Your eskp.in account has been deleted.

All data associated with your account has been permanently removed from our systems.

If you have any questions, you can contact us at ${PANEL_EMAIL}.

— The eskp.in team`;

  const htmlBody = `
    <p>Hi${userName ? ` ${escHtml(userName)}` : ''},</p>
    <p>Your eskp.in account has been deleted.</p>
    <p>All data associated with your account has been permanently removed from our systems.</p>
    <p style="color:#7A6E68;font-size:14px;">If you have any questions, contact us at <a href="mailto:${PANEL_EMAIL}" style="color:#C4622D;">${PANEL_EMAIL}</a>.</p>`;

  await send({
    to: userEmail,
    subject: 'Your account has been deleted — eskp.in',
    text: plainText,
    html: renderEmail({ preheader: 'Your account has been permanently deleted.', body: htmlBody }),
  });
}

module.exports = { processExportRequest, getExportData, requestDeletion, confirmDeletion };
