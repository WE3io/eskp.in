/**
 * Cloudflare Worker: Inbound Email Handler
 *
 * Receives email events from Cloudflare Email Routing,
 * extracts headers + body, and forwards to the platform webhook.
 *
 * Deploy to: Cloudflare Workers
 * Bind to email routing: hello@mail.eskp.in
 */

const PLATFORM_WEBHOOK_URL = 'https://eskp.in/webhooks/email';
const WEBHOOK_SECRET = WEBHOOK_SECRET_ENV; // injected as env var

export default {
  async email(message, env, ctx) {
    // Parse the raw email via the Email API
    const raw = {
      from: message.from,
      to: message.to,
      headers: Object.fromEntries(message.headers),
    };

    // Read the email body (plain text)
    const reader = message.raw.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const rawBytes = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      rawBytes.set(chunk, offset);
      offset += chunk.length;
    }
    const rawEmail = new TextDecoder().decode(rawBytes);

    // Extract subject from headers
    const subject = message.headers.get('subject') || '';

    // Extract plain text body — naive parse: everything after the double CRLF
    // For multipart emails, we use the raw and let the server do deeper parsing
    let textBody = '';
    const bodyStart = rawEmail.indexOf('\r\n\r\n');
    if (bodyStart !== -1) {
      textBody = rawEmail.slice(bodyStart + 4).trim();
    }

    const payload = {
      from: message.from,
      to: message.to,
      subject,
      text: textBody,
      raw,
    };

    const response = await fetch(PLATFORM_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': env.WEBHOOK_SECRET,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Platform webhook failed: ${response.status} — ${body}`);
    }
  },
};
