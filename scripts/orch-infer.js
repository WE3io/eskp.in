#!/usr/bin/env node
/**
 * CLI wrapper for the orchestration layer's infer() function.
 * Designed for use by the Claude CLI during auto-sessions.
 *
 * Usage:
 *   node scripts/orch-infer.js --role classifier --input "email body text"
 *   node scripts/orch-infer.js --role drafter --system "Write a blog post" --input "context..."
 *   echo '{"role":"classifier","input":"..."}' | node scripts/orch-infer.js --json
 *
 * Run: pnpm orch:infer -- --role <role> --input "text"
 */
require('dotenv').config();

const { infer } = require('../src/orchestration');

async function main() {
  const args = process.argv.slice(2);

  let role, system, input;

  if (args.includes('--json')) {
    // Read JSON from stdin
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const data = JSON.parse(Buffer.concat(chunks).toString());
    role = data.role;
    system = data.system;
    input = data.input;
  } else {
    role = getArg(args, '--role');
    system = getArg(args, '--system');
    input = getArg(args, '--input');
  }

  if (!role) {
    console.error('Error: --role is required');
    process.exit(1);
  }
  if (!input) {
    console.error('Error: --input is required');
    process.exit(1);
  }

  const response = await infer({
    role,
    system: system || undefined,
    messages: [{ role: 'user', content: input }],
  });

  // Output just the text for easy piping
  process.stdout.write(response.text || '');
  process.stdout.write('\n');
}

function getArg(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

main().catch(err => {
  console.error(`orch-infer error: ${err.message}`);
  process.exit(1);
});
