const https = require('https');
const logger = require('../logger');
const { isSuppressed } = require('./email-suppression');

const API_KEY = process.env.EMAIL_API_KEY;
const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'hello@mail.eskp.in';

async function send({ to, subject, text, html, from, replyTo, panelMemberId }) {
  void panelMemberId; // recorded by callers directly on the emails table row via logEmail
  // TSK-051: skip suppressed addresses (bounced / complained)
  const recipient = Array.isArray(to) ? to[0] : to;
  try {
    if (await isSuppressed(recipient)) {
      logger.info({ subject }, 'email: skipping suppressed address');
      return { skipped: true, reason: 'suppressed' };
    }
  } catch (err) {
    // Non-fatal: if suppression check fails, attempt send anyway
    logger.warn({ err }, 'email: suppression check failed');
  }

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      from: from || `Platform <${FROM}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(html ? { html, ...(text ? { text } : {}) } : { text }),
      reply_to: replyTo || REPLY_TO,
    });

    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Resend error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (parseErr) {
          reject(new Error(`Resend response parse error (${res.statusCode}): ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { send };
