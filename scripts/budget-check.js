#!/usr/bin/env node
/**
 * Budget tracker — queries local token_usage table for spend vs monthly budget.
 * Anthropic's usage API requires admin keys (not available here).
 * All Claude API calls in this platform log to token_usage at call time.
 *
 * Run: pnpm budget
 */
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const MONTHLY_BUDGET = parseFloat(process.env.MONTHLY_TOKEN_BUDGET || 30);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PRICING = {
  'claude-haiku-4-5-20251001':  { input: 0.80, output: 4.00 },
  'claude-sonnet-4-6':           { input: 3.00, output: 15.00 },
  'claude-opus-4-6':             { input: 15.00, output: 75.00 },
};
const DEFAULT_PRICING = { input: 3.00, output: 15.00 };

async function main() {
  const now = new Date();
  const monthName = now.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const dayOfMonth = now.getDate();
  const pctMonthElapsed = Math.round((dayOfMonth / 31) * 100);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  console.log(`\n=== Budget Check: ${now.toISOString()} ===`);
  console.log(`Month: ${monthName} (day ${dayOfMonth}, ~${pctMonthElapsed}% elapsed)`);
  console.log(`Budget: $${MONTHLY_BUDGET}/month`);

  let spentUSD = 0;
  let usageLines = [];
  let usageNote = '';

  try {
    // Use cost_usd when populated (orchestration layer rows), fall back to token-based pricing
    const { rows } = await pool.query(`
      SELECT model,
             COALESCE(provider, 'anthropic') AS provider,
             SUM(input_tokens)::int  AS input_tokens,
             SUM(output_tokens)::int AS output_tokens,
             SUM(CASE WHEN cost_usd IS NOT NULL THEN cost_usd ELSE 0 END)::numeric AS recorded_cost,
             SUM(CASE WHEN cost_usd IS NULL THEN 1 ELSE 0 END)::int AS uncosted_rows,
             COUNT(*)::int           AS calls
      FROM token_usage
      WHERE created_at >= $1
      GROUP BY model, COALESCE(provider, 'anthropic')
      ORDER BY model
    `, [startOfMonth]);

    if (rows.length === 0) {
      usageNote = 'No API calls recorded this month yet';
    } else {
      for (const row of rows) {
        let cost = parseFloat(row.recorded_cost) || 0;
        // For rows without cost_usd (legacy), compute from token pricing
        if (row.uncosted_rows > 0) {
          const p = PRICING[row.model] || DEFAULT_PRICING;
          const tokenCost = (row.input_tokens / 1_000_000 * p.input) +
                       (row.output_tokens / 1_000_000 * p.output);
          // If all rows lack cost_usd, use full token estimate; otherwise add proportional estimate
          if (cost === 0) cost = tokenCost;
        }
        spentUSD += cost;
        const providerTag = row.provider !== 'anthropic' ? ` [${row.provider}]` : '';
        const line = `  ${row.model}${providerTag}: ${row.calls} calls, ${row.input_tokens.toLocaleString()} in / ${row.output_tokens.toLocaleString()} out = $${cost.toFixed(4)}`;
        usageLines.push(line);
        console.log(line);
      }
    }
  } catch (err) {
    usageNote = `DB query failed: ${err.message}`;
    console.warn(`Warning: ${usageNote}`);
  }

  const pctBudgetUsed = MONTHLY_BUDGET > 0 ? (spentUSD / MONTHLY_BUDGET) * 100 : 0;
  const remaining = MONTHLY_BUDGET - spentUSD;

  console.log(`\nBudget used: ${pctBudgetUsed.toFixed(2)}% ($${spentUSD.toFixed(4)} / $${MONTHLY_BUDGET})`);
  console.log(`Remaining: $${remaining.toFixed(4)}`);

  if (pctBudgetUsed > 70 && dayOfMonth < 21) {
    console.warn(`\n⚠️  ALERT: Over 70% of budget used before the 21st. Reduce activity and notify panel@eskp.in`);
  }

  const status = pctBudgetUsed > 90 ? '🔴 CRITICAL' :
                 pctBudgetUsed > 70 && dayOfMonth < 21 ? '⚠️ ALERT' : '✅ OK';

  const usageDetail = usageLines.length > 0 ? usageLines.join('\n') : (usageNote || 'No usage');

  const trackerPath = path.join(__dirname, '../docs/state/budget-tracker.md');
  const content = `# Budget Tracker

## Current Month: ${monthName}

| Item | Budget | Spent | Remaining | % Used | Status |
|------|--------|-------|-----------|--------|--------|
| Anthropic API tokens | $${MONTHLY_BUDGET} | $${spentUSD.toFixed(4)} | $${remaining.toFixed(4)} | ${pctBudgetUsed.toFixed(2)}% | ${status} |
| **Total** | **$${MONTHLY_BUDGET}** | **$${spentUSD.toFixed(4)}** | **$${remaining.toFixed(4)}** | **${pctBudgetUsed.toFixed(2)}%** | **${status}** |

### Usage detail (from local token_usage table)
\`\`\`
${usageDetail}
\`\`\`

### Pricing reference
| Model | Input ($/MTok) | Output ($/MTok) |
|-------|---------------|----------------|
| claude-haiku-4-5-20251001 | $0.80 | $4.00 |
| claude-sonnet-4-6 | $3.00 | $15.00 |
| claude-opus-4-6 | $15.00 | $75.00 |

### Month progress
Day ${dayOfMonth} of ~31 (~${pctMonthElapsed}% of month elapsed)

## Budget Alert Threshold
- 70% of budget before the 21st → reduce activity, notify panel@eskp.in

## Revenue
- Platform revenue: $0
- Phase status: Phase 1 (Funded)
- Months of self-funding: 0/2 required for Phase 2

---

## History

| Month | Budget | Spent | Revenue | Net |
|-------|--------|-------|---------|-----|
| ${monthName} | $${MONTHLY_BUDGET} | $${spentUSD.toFixed(4)} | $0 | -$${spentUSD.toFixed(4)} |

---

*Last updated: ${now.toISOString()}*
*Run \`pnpm budget\` to refresh*
*Source: local token_usage table (accurate from 2026-03-08 onwards)*
`;

  fs.writeFileSync(trackerPath, content);
  console.log(`\nBudget tracker updated: docs/state/budget-tracker.md`);
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
