/**
 * Email reply-to token generation and verification.
 *
 * When the platform sends an email to a user in the context of a goal, it sets
 * the Reply-To header to a goal-specific address:
 *
 *   reply+{goalId}_{hmac}@mail.eskp.in
 *
 * This lets the Cloudflare Worker forward the `to` address so the webhook can
 * route the reply directly to the right goal — without relying on subject-line
 * pattern matching.
 *
 * HMAC: SHA-256 of goalId with REPLY_TOKEN_SECRET, first 12 hex chars.
 * The 12-char token gives ~281 trillion combinations — sufficient for this use case.
 */
const crypto = require('crypto');
const logger = require('../logger');

const SECRET = process.env.REPLY_TOKEN_SECRET;
const REPLY_DOMAIN = process.env.EMAIL_REPLY_DOMAIN || 'mail.eskp.in';
const FALLBACK_REPLY_TO = process.env.EMAIL_REPLY_TO || 'hello@mail.eskp.in';

/**
 * Generate a goal-specific reply-to address.
 * Returns a generic fallback if REPLY_TOKEN_SECRET is not configured.
 *
 * @param {string} goalId - UUID of the goal
 * @returns {string} e.g. "reply+550e8400-e29b-41d4-a716-446655440000_a1b2c3d4e5f6@mail.eskp.in"
 */
function generateReplyTo(goalId) {
  if (!SECRET) {
    logger.warn('email-reply-token: REPLY_TOKEN_SECRET not set — using generic reply-to');
    return FALLBACK_REPLY_TO;
  }
  const hmac = crypto
    .createHmac('sha256', SECRET)
    .update(goalId.toLowerCase())
    .digest('hex')
    .slice(0, 12);
  return `reply+${goalId.toLowerCase()}_${hmac}@${REPLY_DOMAIN}`;
}

/**
 * Parse and verify a reply-to address from an inbound email's To: field.
 *
 * @param {string} address - the To: address the inbound email was sent to
 * @returns {{ valid: true, goalId: string } | { valid: false }}
 */
function parseReplyTo(address) {
  if (!address || !SECRET) return { valid: false };

  // Extract local part (before @)
  const atIdx = address.indexOf('@');
  if (atIdx === -1) return { valid: false };
  const local = address.slice(0, atIdx).toLowerCase();

  // Match: reply+{uuid}_{12-char hex token}
  const match = local.match(/^reply\+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})_([0-9a-f]{12})$/);
  if (!match) return { valid: false };

  const [, goalId, token] = match;

  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(goalId)
    .digest('hex')
    .slice(0, 12);

  // Constant-time comparison to prevent timing attacks
  try {
    if (!crypto.timingSafeEqual(Buffer.from(token, 'utf8'), Buffer.from(expected, 'utf8'))) {
      return { valid: false };
    }
  } catch {
    return { valid: false };
  }

  return { valid: true, goalId };
}

module.exports = { generateReplyTo, parseReplyTo };
