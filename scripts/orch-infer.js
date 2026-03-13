#!/usr/bin/env node
/**
 * CLI wrapper for the orchestration layer's infer() function.
 * Designed for use by the Claude CLI during auto-sessions.
 *
 * Usage:
 *   node scripts/orch-infer.js --role classifier --input "email body text"
 *   node scripts/orch-infer.js --role drafter --system "Write a blog post" --input "context..."
 *   node scripts/orch-infer.js --role coder --system "Implement..." --input "task" --files src/index.js src/db/connection.js
 *   echo '{"role":"classifier","input":"..."}' | node scripts/orch-infer.js --json
 *
 * Flags:
 *   --role <role>      Required. Role from config/roles.yaml (classifier, coder, etc.)
 *   --input <text>     Required. The user message / task description.
 *   --system <text>    Optional. System prompt.
 *   --files <paths...> Optional. File paths to inject as context (read and appended to input).
 *   --validate         Optional. Check output quality; exit 2 if output appears empty or malformed.
 *   --json             Read { role, system, input, files } from stdin as JSON.
 *
 * Exit codes:
 *   0  Success
 *   1  Error (missing args, API failure, etc.)
 *   2  Validation failure (--validate flag; output was empty or malformed)
 *
 * Run: pnpm orch:infer -- --role <role> --input "text"
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { infer } = require('../src/orchestration');

async function main() {
  const args = process.argv.slice(2);

  let role, system, input, files, validate;

  if (args.includes('--json')) {
    // Read JSON from stdin
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const data = JSON.parse(Buffer.concat(chunks).toString());
    role = data.role;
    system = data.system;
    input = data.input;
    files = data.files || [];
    validate = data.validate || false;
  } else {
    role = getArg(args, '--role');
    system = getArg(args, '--system');
    input = getArg(args, '--input');
    files = getListArg(args, '--files');
    validate = args.includes('--validate');
  }

  if (!role) {
    console.error('Error: --role is required');
    process.exit(1);
  }
  if (!input) {
    console.error('Error: --input is required');
    process.exit(1);
  }

  // Build user message: input + file contents
  let userContent = input;

  if (files && files.length > 0) {
    const fileBlocks = [];
    for (const filePath of files) {
      try {
        const resolved = path.resolve(filePath);
        const content = fs.readFileSync(resolved, 'utf8');
        fileBlocks.push(`<file path="${filePath}">\n${content}\n</file>`);
      } catch (err) {
        console.error(`Warning: could not read file ${filePath}: ${err.message}`);
      }
    }
    if (fileBlocks.length > 0) {
      userContent = `${input}\n\n--- File Context ---\n${fileBlocks.join('\n\n')}`;
    }
  }

  const response = await infer({
    role,
    system: system || undefined,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = response.text || '';

  // Validate output if --validate flag is set
  if (validate) {
    if (!text.trim()) {
      console.error('Validation failed: empty response');
      process.exit(2);
    }
    // For coder role, expect code fences in output
    if (role === 'coder' && !text.includes('```') && text.length < 50) {
      console.error('Validation failed: coder response appears too short and has no code fences');
      process.exit(2);
    }
  }

  // Output just the text for easy piping
  process.stdout.write(text);
  process.stdout.write('\n');
}

function getArg(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

/**
 * Get a list of values after a flag, consuming all args until the next --flag.
 * e.g. --files a.js b.js c.js → ['a.js', 'b.js', 'c.js']
 */
function getListArg(args, flag) {
  const idx = args.indexOf(flag);
  if (idx === -1) return [];
  const values = [];
  for (let i = idx + 1; i < args.length; i++) {
    if (args[i].startsWith('--')) break;
    values.push(args[i]);
  }
  return values;
}

main().catch(err => {
  console.error(`orch-infer error: ${err.message}`);
  process.exit(1);
});
