const https = require('https');

const API_KEY = process.env.EMAIL_API_KEY;
const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@eskp.in';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'panel@eskp.in';

function send({ to, subject, text, html, from, replyTo }) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      from: from || `Platform <${FROM}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(html ? { html } : { text }),
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
        const parsed = JSON.parse(data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed);
        } else {
          reject(new Error(`Resend error ${res.statusCode}: ${JSON.stringify(parsed)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { send };
