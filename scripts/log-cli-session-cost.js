#!/usr/bin/env node
/**
 * log-cli-session-cost.js — Logs estimated CLI session cost to the token_usage table.
 *
 * The Claude CLI sessions go through OpenRouter but their costs are NOT tracked
 * in the local token_usage table (only orchestration layer calls are). This script
 * queries the OpenRouter activity API after a session to capture the spend.
 *
 * Usage (called from auto-session.sh after CLI session ends):
 *   node scripts/log-cli-session-cost.js --since <epoch> --model <sonnet|opus> --type <agentic|strategic>
 *
 * What it does:
 *   1. Queries OpenRouter /api/v1/auth/key for current credit balance
 *   2. Logs a summary row to token_usage with operation='cli-session'
 *   3. Outputs the estimated cost for the session log
 *
 * Requires: OPENROUTER_API_KEY in environment.
 *
 * Exit codes:
 *   0  Logged successfully (or no OpenRouter key — skip silently)
 *   1  Error
 */
require('dotenv').config({ quiet: true });

const https = require('https');

const MODEL_COSTS = {
  'sonnet': { input_per_mtok: 3.00, output_per_mtok: 15.00, model: 'anthropic/claude-sonnet-4-6' },
  'opus': { input_per_mtok: 15.00, output_per_mtok: 75.00, model: 'anthropic/claude-opus-4-6' },
};

function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers,
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch {
          reject(new Error(`Parse error: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    // No OpenRouter key — can't track. Skip silently.
    process.exit(0);
  }

  const args = process.argv.slice(2);
  const sinceIdx = args.indexOf('--since');
  const modelIdx = args.indexOf('--model');
  const typeIdx = args.indexOf('--type');

  const sinceEpoch = sinceIdx !== -1 ? parseInt(args[sinceIdx + 1], 10) : 0;
  const modelName = modelIdx !== -1 ? args[modelIdx + 1] : 'sonnet';
  const sessionType = typeIdx !== -1 ? args[typeIdx + 1] : 'agentic';

  const modelInfo = MODEL_COSTS[modelName] || MODEL_COSTS['sonnet'];

  // Query OpenRouter for recent generation stats
  // The /auth/key endpoint returns rate limit + usage info
  try {
    const { statusCode, data } = await httpGet(
      'https://openrouter.ai/api/v1/auth/key',
      { 'Authorization': `Bearer ${apiKey}` }
    );

    if (statusCode !== 200) {
      console.error(`OpenRouter API returned ${statusCode}`);
      process.exit(1);
    }

    // The auth/key response includes usage but not per-session breakdown.
    // For now, log an estimated cost based on typical session token counts.
    // A more accurate approach would query /api/v1/generation with date filters.

    // Estimate: agentic sessions ~35K input + 5K output, strategic ~15K input + 3K output
    const estimates = {
      'agentic': { input: 35000, output: 5000 },
      'strategic': { input: 15000, output: 3000 },
      'routine': { input: 0, output: 0 }, // routine sessions don't use CLI
    };

    const est = estimates[sessionType] || estimates['agentic'];
    const costUsd = (est.input / 1_000_000) * modelInfo.input_per_mtok +
                    (est.output / 1_000_000) * modelInfo.output_per_mtok;

    // Log to token_usage table
    if (costUsd > 0) {
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });

      await pool.query(
        `INSERT INTO token_usage (model, input_tokens, output_tokens, operation, provider, cost_usd)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          modelInfo.model,
          est.input,
          est.output,
          `cli-${sessionType}`,
          'openrouter',
          costUsd,
        ]
      );

      await pool.end();
      console.log(`CLI session cost logged: ~$${costUsd.toFixed(4)} (${sessionType}, ${modelName}, est. ${est.input}/${est.output} tokens)`);
    }
  } catch (err) {
    // Non-fatal — don't crash the session for cost tracking failure
    console.error(`CLI cost tracking failed: ${err.message}`);
  }
}

main().catch(err => {
  console.error(`log-cli-session-cost error: ${err.message}`);
  process.exit(1);
});
