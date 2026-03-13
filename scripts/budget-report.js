#!/usr/bin/env node
/**
 * TSK-126: Weekly budget report email to panel.
 *
 * Art 5.1 constitutional obligation: "Report spend weekly to the panel."
 * Sends a structured email with this week's spend, month-to-date totals,
 * budget status, and revenue summary.
 *
 * Schedule: Monday 09:00 UTC (cron: 0 9 * * 1)
 * Usage:
 *   node scripts/budget-report.js            # real send
 *   DRY_RUN=1 node scripts/budget-report.js  # print, don't send
 */

require('dotenv').config({ quiet: true });
const { Pool } = require('pg');
const { send } = require('../src/services/email');
const { renderEmail, safeHtml, rawHtml } = require('../src/services/email-template');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const MONTHLY_BUDGET = parseFloat(process.env.MONTHLY_TOKEN_BUDGET || 30);
const PANEL_EMAIL = process.env.PANEL_EMAIL || 'panel@eskp.in';
const DRY_RUN = process.env.DRY_RUN === '1';

async function run() {
  const now = new Date();
  const monthName = now.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const dayOfMonth = now.getDate();

  // Start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  // Start of last 7 days
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Pricing for rows without cost_usd (legacy direct Anthropic calls)
  const PRICING = {
    'claude-haiku-4-5-20251001': { input: 0.80, output: 4.00 },
    'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
    'claude-opus-4-6': { input: 15.00, output: 75.00 },
  };
  const DEFAULT_PRICING = { input: 3.00, output: 15.00 };

  // Month-to-date spend by model
  const { rows: monthRows } = await pool.query(`
    SELECT model,
           COALESCE(provider, 'anthropic') AS provider,
           SUM(input_tokens)::int AS input_tokens,
           SUM(output_tokens)::int AS output_tokens,
           SUM(COALESCE(cost_usd, 0))::numeric AS recorded_cost,
           SUM(CASE WHEN cost_usd IS NULL THEN 1 ELSE 0 END)::int AS uncosted_rows,
           COUNT(*)::int AS calls
    FROM token_usage
    WHERE created_at >= $1
    GROUP BY model, COALESCE(provider, 'anthropic')
    ORDER BY recorded_cost DESC
  `, [startOfMonth]);

  // Compute cost for rows missing cost_usd (same logic as budget-check.js)
  for (const row of monthRows) {
    let cost = parseFloat(row.recorded_cost) || 0;
    if (row.uncosted_rows > 0 && cost === 0) {
      const p = PRICING[row.model] || DEFAULT_PRICING;
      cost = (row.input_tokens / 1_000_000 * p.input) +
             (row.output_tokens / 1_000_000 * p.output);
    }
    row.cost = cost;
  }

  // This week's spend (with same fallback)
  const { rows: weekRows } = await pool.query(`
    SELECT SUM(COALESCE(cost_usd, 0))::numeric AS recorded_cost,
           SUM(input_tokens)::int AS input_tokens,
           SUM(output_tokens)::int AS output_tokens,
           COUNT(*)::int AS calls
    FROM token_usage
    WHERE created_at >= $1
  `, [weekAgo]);

  // Revenue this month
  const { rows: revenueRows } = await pool.query(`
    SELECT COUNT(*)::int AS paid_intros
    FROM matches
    WHERE paid_at IS NOT NULL
      AND paid_at >= $1
  `, [startOfMonth]);

  // Goal funnel this month
  const { rows: goalRows } = await pool.query(`
    SELECT COUNT(*)::int AS total_goals
    FROM goals
    WHERE created_at >= $1
  `, [startOfMonth]);

  const monthSpent = monthRows.reduce((sum, r) => sum + (r.cost || 0), 0);
  // Week spend: use recorded cost, fallback to token estimate
  let weekSpent = parseFloat(weekRows[0]?.recorded_cost || 0);
  if (weekSpent === 0 && weekRows[0]?.input_tokens > 0) {
    weekSpent = (weekRows[0].input_tokens / 1_000_000 * DEFAULT_PRICING.input) +
                (weekRows[0].output_tokens / 1_000_000 * DEFAULT_PRICING.output);
  }
  const weekCalls = weekRows[0]?.calls || 0;
  const paidIntros = revenueRows[0]?.paid_intros || 0;
  const revenueGBP = paidIntros * 10;
  const totalGoals = goalRows[0]?.total_goals || 0;
  const remaining = MONTHLY_BUDGET - monthSpent;
  const pctUsed = MONTHLY_BUDGET > 0 ? ((monthSpent / MONTHLY_BUDGET) * 100).toFixed(1) : '0.0';

  const status = parseFloat(pctUsed) > 90 ? 'CRITICAL'
    : (parseFloat(pctUsed) > 70 && dayOfMonth < 21) ? 'WARNING'
    : 'OK';

  // Model breakdown lines
  const modelLines = monthRows.map(r => {
    const providerTag = r.provider !== 'anthropic' ? ` [${r.provider}]` : '';
    return `${r.model}${providerTag}: ${r.calls} calls, $${parseFloat(r.cost).toFixed(4)}`;
  });

  // Plain text
  const plainText = `Weekly Budget Report — ${monthName}
Week ending ${now.toISOString().split('T')[0]}

This week: ${weekCalls} API calls, $${weekSpent.toFixed(4)} spent
Month to date: $${monthSpent.toFixed(4)} / $${MONTHLY_BUDGET} (${pctUsed}% used)
Remaining: $${remaining.toFixed(4)}
Status: ${status}

Model breakdown (month to date):
${modelLines.length > 0 ? modelLines.join('\n') : '  No API calls this month'}

Revenue this month: ${paidIntros} paid introductions = £${revenueGBP}
Goals submitted this month: ${totalGoals}

Phase: ${revenueGBP > 0 ? 'Generating revenue' : 'Phase 1 (Funded, $0 revenue)'}

— eskp.in platform (automated report, Art 5.1)`;

  const statusColour = status === 'OK' ? '#3a7d44' : status === 'WARNING' ? '#C4622D' : '#8B1A1A';

  const htmlBody = safeHtml`
    <h2 style="margin:0 0 16px;font-size:20px;">Weekly Budget Report</h2>
    <p style="color:#7A6E68;margin:0 0 20px;">${monthName} — week ending ${now.toISOString().split('T')[0]}</p>

    <table style="border-collapse:collapse;width:100%;margin:0 0 20px;">
      <tr>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">This week</td>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">${weekCalls} calls, $${weekSpent.toFixed(4)}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">Month to date</td>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">$${monthSpent.toFixed(4)} / $${MONTHLY_BUDGET}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">Budget used</td>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;color:${statusColour};font-weight:bold;">${pctUsed}% — ${status}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">Remaining</td>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">$${remaining.toFixed(4)}</td>
      </tr>
    </table>

    ${rawHtml(modelLines.length > 0
      ? '<p style="font-size:14px;color:#5a504c;"><strong>Model breakdown:</strong></p><ul style="font-size:13px;color:#5a504c;margin:0 0 16px;">'
        + modelLines.map(l => `<li>${l}</li>`).join('')
        + '</ul>'
      : '<p style="color:#7A6E68;font-size:14px;">No API calls recorded this month.</p>'
    )}

    <table style="border-collapse:collapse;width:100%;margin:0 0 20px;">
      <tr>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">Revenue this month</td>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">${paidIntros} introductions = £${revenueGBP}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">Goals submitted</td>
        <td style="padding:8px 12px;border:1px solid #e8e0d8;">${totalGoals}</td>
      </tr>
    </table>

    <p style="color:#7A6E68;font-size:13px;">Automated weekly report (Constitution Art 5.1). Run <code>pnpm budget</code> for the latest figures.</p>`;

  const subject = `[eskp.in] Weekly budget: $${monthSpent.toFixed(2)}/$${MONTHLY_BUDGET} (${pctUsed}%)`;

  if (DRY_RUN) {
    console.log('--- DRY RUN ---');
    console.log(`To: ${PANEL_EMAIL}`);
    console.log(`Subject: ${subject}`);
    console.log(plainText);
    console.log('--- END DRY RUN ---');
  } else {
    await send({
      to: PANEL_EMAIL,
      subject,
      text: plainText,
      html: renderEmail({ preheader: `Budget ${pctUsed}% used — ${status}`, body: htmlBody }),
    });
    console.log(`Budget report sent to ${PANEL_EMAIL}`);
  }

  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
