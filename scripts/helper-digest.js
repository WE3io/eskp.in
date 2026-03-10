#!/usr/bin/env node
/**
 * TSK-072: Weekly helper digest email.
 *
 * Sends each active helper a summary of the goal types submitted in the last 7 days.
 * Designed to run weekly (Monday 08:00 UTC). Zero-cost when there are no goals;
 * when the network has multiple helpers it scales naturally.
 *
 * Usage:
 *   node scripts/helper-digest.js          # real send
 *   DRY_RUN=1 node scripts/helper-digest.js  # print emails, don't send
 */

require('dotenv').config();
const { Pool } = require('pg');
const { send } = require('../src/services/email');
const { renderEmail } = require('../src/services/email-template');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const FROM = process.env.EMAIL_FROM_ADDRESS || 'hello@mail.eskp.in';
const DRY_RUN = process.env.DRY_RUN === '1';

async function run() {
  // 1. Goals submitted in the last 7 days that completed decomposition
  const { rows: goals } = await pool.query(`
    SELECT
      g.id,
      g.status,
      g.decomposed,
      g.created_at
    FROM goals g
    WHERE g.created_at >= NOW() - INTERVAL '7 days'
      AND g.decomposed IS NOT NULL
    ORDER BY g.created_at DESC
  `);

  // 1b. Currently unmatched goals (submitted but no introduction made)
  const { rows: unmatchedGoals } = await pool.query(`
    SELECT g.id, g.decomposed
    FROM goals g
    WHERE g.status IN ('submitted', 'clarifying', 'pending_clarification', 'proposed', 'matched')
      AND g.decomposed IS NOT NULL
  `);

  // Build tag counts for unmatched pipeline
  const pipelineTagCounts = {};
  for (const g of unmatchedGoals) {
    if (g.decomposed && Array.isArray(g.decomposed.needs)) {
      for (const need of g.decomposed.needs) {
        for (const tag of (need.expertise || [])) {
          pipelineTagCounts[tag] = (pipelineTagCounts[tag] || 0) + 1;
        }
      }
    }
  }

  // 2. Active helpers — with average match rating (TSK-095)
  const { rows: helpers } = await pool.query(`
    SELECT
      h.id AS helper_id,
      h.expertise,
      u.name,
      u.email,
      ROUND(AVG(m.user_rating), 1) AS avg_rating,
      COUNT(m.user_rating) AS rating_count
    FROM helpers h
    JOIN users u ON u.id = h.user_id
    LEFT JOIN matches m ON m.helper_id = h.id AND m.user_rating IS NOT NULL
    WHERE h.is_active = TRUE
      AND u.deleted_at IS NULL
    GROUP BY h.id, h.expertise, u.name, u.email
  `);

  if (helpers.length === 0) {
    console.log('helper-digest: no active helpers — nothing to send');
    await pool.end();
    return;
  }

  // 3. Build aggregated stats
  const tagCounts = {};
  const statusCounts = {};
  let totalGoals = goals.length;

  for (const g of goals) {
    // Count statuses
    statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;

    // Count expertise tags from decomposed needs
    if (g.decomposed && Array.isArray(g.decomposed.needs)) {
      for (const need of g.decomposed.needs) {
        for (const tag of (need.expertise || [])) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }
  }

  // Top 10 tags by count
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const introduced = statusCounts['introduced'] || 0;
  const matched = (statusCounts['matched'] || 0) + (statusCounts['proposed'] || 0);
  const unmatched = totalGoals - introduced - matched;

  // 4. Send personalised digest to each helper
  for (const helper of helpers) {
    // Which of the top tags overlap with this helper's expertise?
    const helperTagSet = new Set(helper.expertise || []);
    const relevantTags = topTags.filter(([tag]) => helperTagSet.has(tag));

    // Goals in this helper's domain currently awaiting a match (pipeline visibility — TSK-076)
    const pipelineInDomain = Object.entries(pipelineTagCounts)
      .filter(([tag]) => helperTagSet.has(tag))
      .reduce((sum, [, count]) => sum + count, 0);

    const greeting = `Hi${helper.name ? ` ${helper.name}` : ''},`;
    const weekOf = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const plainText = buildPlainText({
      greeting, weekOf, totalGoals, topTags, relevantTags,
      introduced, matched, unmatched, pipelineInDomain,
      avgRating: helper.avg_rating, ratingCount: parseInt(helper.rating_count, 10),
    });

    const htmlBody = buildHtmlBody({
      greeting, weekOf, totalGoals, topTags, relevantTags,
      introduced, matched, unmatched, pipelineInDomain,
      avgRating: helper.avg_rating, ratingCount: parseInt(helper.rating_count, 10),
    });

    if (DRY_RUN) {
      console.log(`\n=== DRY RUN: ${helper.email} ===`);
      console.log(plainText);
      continue;
    }

    try {
      await send({
        to: helper.email,
        subject: `eskp.in weekly digest — w/e ${weekOf}`,
        text: plainText,
        html: renderEmail({
          preheader: `${totalGoals} goal${totalGoals === 1 ? '' : 's'} submitted this week — here's what came in`,
          body: htmlBody,
        }),
      });
      console.log(`helper-digest: sent to ${helper.email}`);
    } catch (err) {
      console.error(`helper-digest: failed to send to ${helper.email}: ${err.message}`);
    }
  }

  await pool.end();
  console.log(`helper-digest: done (${helpers.length} helper(s), ${totalGoals} goal(s) this week)`);
}

function buildPlainText({ greeting, weekOf, totalGoals, topTags, relevantTags, introduced, matched, unmatched, pipelineInDomain, avgRating, ratingCount }) {
  const lines = [
    greeting,
    '',
    `Here's a quick summary of what came through eskp.in in the week ending ${weekOf}.`,
    '',
  ];

  if (totalGoals === 0) {
    lines.push('No goals were submitted this week. We\'re still growing the platform — thank you for your patience.');
  } else {
    lines.push(`Goals submitted: ${totalGoals}`);
    if (introduced > 0)  lines.push(`  • Introductions made: ${introduced}`);
    if (matched > 0)     lines.push(`  • Awaiting payment / confirmation: ${matched}`);
    if (unmatched > 0)   lines.push(`  • No match found yet: ${unmatched}`);
    lines.push('');

    if (topTags.length > 0) {
      lines.push('Most-requested expertise areas this week:');
      for (const [tag, count] of topTags) {
        lines.push(`  • ${tag} (${count})`);
      }
    }

    if (relevantTags.length > 0) {
      lines.push('');
      lines.push('In your areas of expertise:');
      for (const [tag, count] of relevantTags) {
        lines.push(`  • ${tag}: ${count} goal${count === 1 ? '' : 's'}`);
      }
    }
  }

  if (pipelineInDomain > 0) {
    lines.push('');
    lines.push(`Pipeline in your domain: ${pipelineInDomain} goal${pipelineInDomain === 1 ? '' : 's'} currently awaiting a helper match.`);
    lines.push('These goals are unmatched — if you know anyone with relevant expertise, you can share the platform: https://eskp.in/join.html');
  }

  if (avgRating && ratingCount > 0) {
    lines.push('');
    lines.push(`Your match rating: ${avgRating}/5 (based on ${ratingCount} rating${ratingCount === 1 ? '' : 's'})`);
    lines.push('Ratings are submitted by goal-submitters after their introduction.');
  }

  lines.push('');
  lines.push('If you have updated your expertise or availability, reply to this email and we\'ll update your profile.');
  lines.push('');
  lines.push('Thank you for being part of the network.');
  lines.push('');
  lines.push('— The eskp.in team');

  return lines.join('\n');
}

function buildHtmlBody({ greeting, weekOf, totalGoals, topTags, relevantTags, introduced, matched, unmatched, pipelineInDomain, avgRating, ratingCount }) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let html = `<p>${esc(greeting)}</p>
    <p>Here's a quick summary of what came through eskp.in in the week ending <strong>${esc(weekOf)}</strong>.</p>`;

  if (totalGoals === 0) {
    html += `<p style="color:#7A6E68;">No goals were submitted this week. We're still growing the platform — thank you for your patience.</p>`;
  } else {
    html += `<table style="border-collapse:collapse;margin:16px 0 20px;">`;
    html += `<tr><td style="padding:4px 16px 4px 0;font-weight:bold;">Goals submitted</td><td style="padding:4px 0;">${totalGoals}</td></tr>`;
    if (introduced > 0) html += `<tr><td style="padding:4px 16px 4px 0;color:#7A6E68;">Introductions made</td><td style="padding:4px 0;">${introduced}</td></tr>`;
    if (matched > 0)    html += `<tr><td style="padding:4px 16px 4px 0;color:#7A6E68;">Awaiting payment / confirmation</td><td style="padding:4px 0;">${matched}</td></tr>`;
    if (unmatched > 0)  html += `<tr><td style="padding:4px 16px 4px 0;color:#7A6E68;">No match found yet</td><td style="padding:4px 0;">${unmatched}</td></tr>`;
    html += `</table>`;

    if (topTags.length > 0) {
      html += `<p><strong>Most-requested expertise areas this week:</strong></p>
        <ul style="margin:8px 0 16px 20px;padding:0;">`;
      for (const [tag, count] of topTags) {
        html += `<li style="margin-bottom:5px;">${esc(tag)} <span style="color:#7A6E68;">(${count})</span></li>`;
      }
      html += `</ul>`;
    }

    if (relevantTags.length > 0) {
      html += `<div style="background:#F7EDE6;border-radius:6px;padding:14px 18px;margin:16px 0;">
        <p style="margin:0 0 10px;font-weight:bold;">In your areas of expertise:</p>
        <ul style="margin:0;padding-left:20px;">`;
      for (const [tag, count] of relevantTags) {
        html += `<li style="margin-bottom:4px;">${esc(tag)}: <strong>${count} goal${count === 1 ? '' : 's'}</strong></li>`;
      }
      html += `</ul></div>`;
    }
  }

  if (pipelineInDomain > 0) {
    html += `<div style="border-left:3px solid #C4753A;padding:10px 16px;margin:20px 0;background:#FDF8F5;">
      <p style="margin:0 0 6px;font-weight:bold;">Pipeline in your domain</p>
      <p style="margin:0;">${pipelineInDomain} goal${pipelineInDomain === 1 ? '' : 's'} currently awaiting a helper match in your area.
        If you know someone who could help, <a href="https://eskp.in/join.html" style="color:#C4753A;">invite them to join</a>.</p>
      </div>`;
  }

  if (avgRating && ratingCount > 0) {
    const stars = '★'.repeat(Math.round(Number(avgRating))) + '☆'.repeat(5 - Math.round(Number(avgRating)));
    html += `<div style="background:#F0F7F1;border-radius:6px;padding:14px 18px;margin:16px 0;">
      <p style="margin:0 0 4px;font-weight:bold;">Your match rating</p>
      <p style="margin:0;font-size:1.1em;">${stars} <strong>${avgRating}/5</strong> <span style="color:#7A6E68;font-size:14px;">(${ratingCount} rating${ratingCount === 1 ? '' : 's'})</span></p>
      <p style="margin:6px 0 0;font-size:13px;color:#7A6E68;">Submitted by goal-submitters after their introduction.</p>
    </div>`;
  }

  html += `<p style="color:#7A6E68;font-size:14px;margin-top:24px;">If you have updated your expertise or availability, reply to this email and we'll update your profile.</p>
    <p>Thank you for being part of the network.</p>`;

  return html;
}

run().catch(err => {
  console.error('helper-digest: fatal error:', err);
  process.exit(1);
});
