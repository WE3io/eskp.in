#!/usr/bin/env node
/**
 * manage-helpers.js — Admin CLI for the helper network.
 *
 * Usage:
 *   pnpm manage-helpers list              List pending applications
 *   pnpm manage-helpers list-all          List all applications
 *   pnpm manage-helpers approve <id>      Approve application, create helper profile
 *   pnpm manage-helpers reject <id>       Reject application
 *   pnpm manage-helpers add-tags <id> [tags...]  Set expertise tags on an approved helper
 *   pnpm manage-helpers helpers           List all active helpers
 */
require('dotenv').config();
const { pool } = require('../src/db/connection');
const { send } = require('../src/services/email');
const { renderEmail } = require('../src/services/email-template');

const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';
const [,, command, ...args] = process.argv;

async function list(all = false) {
  const where = all ? '' : `WHERE status = 'pending'`;
  const { rows } = await pool.query(
    `SELECT id, email, name, status, created_at,
            LEFT(expertise_description, 120) AS preview
     FROM helper_applications ${where}
     ORDER BY created_at DESC`
  );
  if (rows.length === 0) {
    console.log(all ? 'No applications.' : 'No pending applications.');
    return;
  }
  for (const r of rows) {
    console.log(`\n[${r.status.toUpperCase()}] ${r.id}`);
    console.log(`  Email: ${r.email}${r.name ? ` (${r.name})` : ''}`);
    console.log(`  Date:  ${r.created_at.toISOString().slice(0, 10)}`);
    console.log(`  Bio:   ${r.preview}${r.preview?.length === 120 ? '...' : ''}`);
  }
}

async function approve(appId) {
  const { rows } = await pool.query(
    `SELECT * FROM helper_applications WHERE id = $1`, [appId]
  );
  if (!rows.length) return console.error('Application not found:', appId);
  const app = rows[0];
  if (app.status !== 'pending') return console.error(`Application is already ${app.status}.`);

  // Get or create user
  const { rows: [user] } = await pool.query(
    `INSERT INTO users (email, name)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET name = COALESCE(EXCLUDED.name, users.name)
     RETURNING *`,
    [app.email, app.name || null]
  );

  // Create helper profile (bio from application text, tags added separately)
  const { rows: [helper] } = await pool.query(
    `INSERT INTO helpers (user_id, expertise, bio, is_active)
     VALUES ($1, '{}', $2, TRUE)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [user.id, app.expertise_description.slice(0, 500)]
  );

  let helperId;
  if (!helper) {
    const { rows: [existing] } = await pool.query(
      `SELECT id FROM helpers WHERE user_id = $1`, [user.id]
    );
    helperId = existing.id;
    console.log('Helper profile already exists for this user.');
  } else {
    helperId = helper.id;
    console.log(`Helper profile created: ${helperId}`);
    console.log(`Next: set expertise tags with:\n  pnpm manage-helpers add-tags ${helperId} <tag1> <tag2> ...`);
  }

  await pool.query(
    `UPDATE helper_applications SET status = 'approved', reviewed_at = NOW(), helper_id = $1
     WHERE id = $2`,
    [helperId, appId]
  );

  // Welcome email to new helper
  const greeting = `Hi${app.name ? ` ${app.name}` : ''},`;
  await send({
    to: app.email,
    subject: `You've been added to the eskp.in helper network`,
    text: `${greeting}\n\nYou're now part of the eskp.in helper network. When someone needs help that matches your background, we'll introduce you by email.\n\nThere's no obligation — if an introduction doesn't feel like a good fit, just ignore it.\n\nThank you for offering your time.\n\n— The eskp.in team`,
    html: renderEmail({
      preheader: "You're now part of the eskp.in helper network.",
      body: `<p>${greeting}</p>
             <p>You're now part of the eskp.in helper network.</p>
             <p>When someone needs help that matches your background, we'll introduce you by email. There's no obligation — if an introduction doesn't feel like a good fit, just ignore it.</p>
             <p style="color:#7A6E68;font-size:14px;">Thank you for offering your time.</p>`,
    }),
  });

  console.log(`Approved: ${app.email}. Welcome email sent.`);
}

async function reject(appId) {
  const { rows } = await pool.query(
    `SELECT * FROM helper_applications WHERE id = $1`, [appId]
  );
  if (!rows.length) return console.error('Application not found:', appId);
  const app = rows[0];
  if (app.status !== 'pending') return console.error(`Application is already ${app.status}.`);

  await pool.query(
    `UPDATE helper_applications SET status = 'rejected', reviewed_at = NOW() WHERE id = $1`,
    [appId]
  );
  console.log(`Rejected: ${app.email}`);
}

async function addTags(helperId, tags) {
  if (!tags.length) return console.error('Provide at least one tag.');
  const cleanTags = tags.map(t => t.toLowerCase().replace(/\s+/g, '-'));
  const { rows } = await pool.query(
    `UPDATE helpers SET expertise = $1 WHERE id = $2 RETURNING id, expertise`,
    [cleanTags, helperId]
  );
  if (!rows.length) return console.error('Helper not found:', helperId);
  console.log(`Tags set on ${helperId}:`, rows[0].expertise.join(', '));
}

async function listHelpers() {
  const { rows } = await pool.query(`
    SELECT h.id, u.email, u.name, h.expertise, h.is_active, h.created_at
    FROM helpers h JOIN users u ON u.id = h.user_id
    ORDER BY h.created_at ASC
  `);
  if (!rows.length) return console.log('No helpers.');
  for (const h of rows) {
    console.log(`\n[${h.is_active ? 'ACTIVE' : 'INACTIVE'}] ${h.id}`);
    console.log(`  Email:     ${h.email}${h.name ? ` (${h.name})` : ''}`);
    console.log(`  Expertise: ${h.expertise.join(', ') || '(none set)'}`);
  }
}

async function main() {
  try {
    switch (command) {
      case 'list':       await list(false); break;
      case 'list-all':   await list(true); break;
      case 'approve':    await approve(args[0]); break;
      case 'reject':     await reject(args[0]); break;
      case 'add-tags':   await addTags(args[0], args.slice(1)); break;
      case 'helpers':    await listHelpers(); break;
      default:
        console.log(`Usage:
  pnpm manage-helpers list
  pnpm manage-helpers list-all
  pnpm manage-helpers approve <application-id>
  pnpm manage-helpers reject <application-id>
  pnpm manage-helpers add-tags <helper-id> <tag1> <tag2> ...
  pnpm manage-helpers helpers`);
    }
  } finally {
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
