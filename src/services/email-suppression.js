/**
 * TSK-051: Email suppression management.
 *
 * Tracks email addresses that have bounced or complained so we don't
 * attempt to re-send to them. Checked by email.js before every send.
 *
 * Stored on the users.email_suppressed_at column (migration in migrate.js).
 * For addresses not yet in the users table, suppression is a no-op —
 * those addresses can't submit goals anyway.
 */

const logger = require('../logger');
const { pool } = require('../db/connection');

/**
 * Mark an email address as suppressed.
 * @param {string} email
 * @param {string} reason - 'bounce' | 'complaint' | 'manual'
 * @returns {boolean} true if a user record was updated
 */
async function suppressEmail(email, reason) {
  const { rowCount } = await pool.query(
    `UPDATE users
     SET email_suppressed_at = NOW(),
         email_suppression_reason = $2
     WHERE email = $1
       AND email_suppressed_at IS NULL
       AND deleted_at IS NULL`,
    [email.toLowerCase().trim(), reason]
  );
  if (rowCount > 0) {
    logger.info({ reason }, 'email-suppression: address suppressed');
  }
  return rowCount > 0;
}

/**
 * Check if an email address is suppressed.
 * Returns false for unknown addresses (let the send attempt naturally fail).
 * @param {string} email
 * @returns {Promise<boolean>}
 */
async function isSuppressed(email) {
  const { rows } = await pool.query(
    `SELECT email_suppressed_at FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1`,
    [email.toLowerCase().trim()]
  );
  return rows.length > 0 && rows[0].email_suppressed_at !== null;
}

module.exports = { suppressEmail, isSuppressed };
