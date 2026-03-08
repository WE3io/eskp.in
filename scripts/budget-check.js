#!/usr/bin/env node
/**
 * Budget tracker — queries Anthropic usage API and reports spend vs monthly budget.
 * Run: pnpm budget
 * Called daily by cron; outputs to stdout and updates docs/state/budget-tracker.md
 */
require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const MONTHLY_BUDGET = parseFloat(process.env.MONTHLY_BUDGET || process.env.MONTHLY_TOKEN_BUDGET || 30);
const API_KEY = process.env.ANTHROPIC_API_KEY;

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
  });
}

async function getMonthlyUsage() {
  if (!API_KEY || API_KEY === 'sk-ant-REPLACE_ME') {
    return { error: 'ANTHROPIC_API_KEY not configured' };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  const url = `https://api.anthropic.com/v1/usage?start_date=${startOfMonth}&end_date=${today}`;
  try {
    const res = await httpsGet(url, {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    });
    return res;
  } catch (err) {
    return { error: err.message };
  }
}

async function main() {
  const now = new Date();
  const monthName = now.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const dayOfMonth = now.getDate();
  const pctMonthElapsed = Math.round((dayOfMonth / 31) * 100);

  console.log(`\n=== Budget Check: ${now.toISOString()} ===`);
  console.log(`Month: ${monthName} (day ${dayOfMonth}, ~${pctMonthElapsed}% elapsed)`);
  console.log(`Budget: $${MONTHLY_BUDGET}/month`);

  const usage = await getMonthlyUsage();

  let spentUSD = 0;
  let usageNote = '';

  if (usage.error) {
    usageNote = `Could not fetch usage: ${usage.error}`;
    console.log(`Warning: ${usageNote}`);
  } else if (usage.status === 200 && usage.body) {
    // Anthropic usage API returns token counts; estimate cost
    const data = usage.body;
    const inputTokens = data.input_tokens || 0;
    const outputTokens = data.output_tokens || 0;
    // Blended estimate: Sonnet pricing ($3/MTok in, $15/MTok out)
    spentUSD = (inputTokens / 1_000_000 * 3) + (outputTokens / 1_000_000 * 15);
    usageNote = `Input: ${inputTokens.toLocaleString()} tokens, Output: ${outputTokens.toLocaleString()} tokens`;
    console.log(`Usage: ${usageNote}`);
    console.log(`Estimated spend: $${spentUSD.toFixed(4)}`);
  } else {
    usageNote = `API returned status ${usage.status}`;
    console.log(`Warning: ${usageNote}`);
  }

  const pctBudgetUsed = MONTHLY_BUDGET > 0 ? (spentUSD / MONTHLY_BUDGET) * 100 : 0;
  const remaining = MONTHLY_BUDGET - spentUSD;

  console.log(`Budget used: ${pctBudgetUsed.toFixed(1)}% ($${spentUSD.toFixed(4)} / $${MONTHLY_BUDGET})`);
  console.log(`Remaining: $${remaining.toFixed(4)}`);

  // Alert if >70% before 21st
  if (pctBudgetUsed > 70 && dayOfMonth < 21) {
    console.warn(`\n⚠️  ALERT: Over 70% of budget used before the 21st. Reduce activity and notify panel@eskp.in`);
  }

  // Update docs/state/budget-tracker.md
  const trackerPath = path.join(__dirname, '../docs/state/budget-tracker.md');
  const status = pctBudgetUsed > 70 && dayOfMonth < 21 ? '⚠️ ALERT' : pctBudgetUsed > 90 ? '🔴 CRITICAL' : '✅ OK';

  const content = `# Budget Tracker

## Current Month: ${monthName}

| Item | Budget | Spent | Remaining | % Used | Status |
|------|--------|-------|-----------|--------|--------|
| Anthropic API tokens | $${MONTHLY_BUDGET} | $${spentUSD.toFixed(4)} | $${remaining.toFixed(4)} | ${pctBudgetUsed.toFixed(1)}% | ${status} |
| **Total** | **$${MONTHLY_BUDGET}** | **$${spentUSD.toFixed(4)}** | **$${remaining.toFixed(4)}** | **${pctBudgetUsed.toFixed(1)}%** | **${status}** |

### Usage detail
${usageNote || 'No data available'}

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
`;

  fs.writeFileSync(trackerPath, content);
  console.log(`\nBudget tracker updated: docs/state/budget-tracker.md`);
}

main().catch(console.error);
