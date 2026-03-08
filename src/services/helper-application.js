/**
 * Helper application flow.
 * Triggered when an inbound email has subject matching "become a helper".
 */
const { pool } = require('../db/connection');
const { send } = require('./email');
const { renderEmail } = require('./email-template');

const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';
const ADMIN_EMAIL = process.env.PANEL_EMAIL || FROM;

const SUBJECT_PATTERN = /become\s+a\s+helper/i;

function isHelperApplication(subject = '') {
  return SUBJECT_PATTERN.test(subject);
}

async function processHelperApplication(email, name, body) {
  // Upsert application (deduplicate by email — one pending at a time)
  const existing = await pool.query(
    `SELECT id, status FROM helper_applications WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
    [email.toLowerCase()]
  );

  if (existing.rows.length && existing.rows[0].status === 'pending') {
    // Already have a pending application — just acknowledge again
    await sendHelperAck(email, name, true);
    return { duplicate: true };
  }

  const { rows: [app] } = await pool.query(
    `INSERT INTO helper_applications (email, name, expertise_description)
     VALUES ($1, $2, $3) RETURNING *`,
    [email.toLowerCase(), name || null, body.slice(0, 5000)]
  );

  await sendHelperAck(email, name, false);
  await notifyAdmin(app);

  return { application: app };
}

async function sendHelperAck(email, name, isDuplicate) {
  const greeting = `Hi${name ? ` ${name}` : ''},`;
  const body = isDuplicate
    ? `<p>${greeting}</p>
       <p>We already have an application from you and are reviewing it. We'll be in touch soon.</p>`
    : `<p>${greeting}</p>
       <p>Thanks for applying to join the eskp.in helper network.</p>
       <p>We review applications manually and will add you once we've had a chance to look at your background. This usually takes a few days.</p>
       <p style="color:#7A6E68;font-size:14px;">If you have questions, just reply to this email.</p>`;

  await send({
    to: email,
    subject: `We've received your helper application`,
    text: isDuplicate
      ? `${greeting}\n\nWe already have a pending application from you and are reviewing it.\n\n— The eskp.in team`
      : `${greeting}\n\nThanks for applying to join the eskp.in helper network.\n\nWe review applications manually and will be in touch once we've had a chance to look at your background.\n\n— The eskp.in team`,
    html: renderEmail({ preheader: 'Thanks for applying to join the helper network.', body }),
  });
}

async function notifyAdmin(app) {
  const body = `
    <p>New helper application received.</p>
    <p><strong>Email:</strong> ${app.email}</p>
    <p><strong>Name:</strong> ${app.name || '(not provided)'}</p>
    <p><strong>What they said:</strong></p>
    <p style="background:#F7EDE6;border-radius:6px;padding:12px 16px;margin:12px 0;white-space:pre-wrap;">${app.expertise_description}</p>
    <p>To approve: <code>pnpm manage-helpers approve ${app.id}</code></p>
    <p>To reject: <code>pnpm manage-helpers reject ${app.id}</code></p>`;

  await send({
    to: ADMIN_EMAIL,
    subject: `New helper application: ${app.email}`,
    text: `New helper application\n\nEmail: ${app.email}\nName: ${app.name || '(not provided)'}\n\nWhat they said:\n${app.expertise_description}\n\nApprove: pnpm manage-helpers approve ${app.id}\nReject: pnpm manage-helpers reject ${app.id}`,
    html: renderEmail({ preheader: `New helper application from ${app.email}`, body }),
  });
}

module.exports = { isHelperApplication, processHelperApplication };
