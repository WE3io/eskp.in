#!/usr/bin/env node
/**
 * Session pre-check — determines if there is actionable work before starting
 * an expensive Claude CLI session. Zero LLM cost — only filesystem and DB reads.
 *
 * Outputs to stdout:
 *   "work"  — actionable work found (start the session)
 *   "skip"  — no actionable work (skip the session)
 *
 * Checks (in priority order):
 *   1. P0 tasks in task-queue.md
 *   2. Unprocessed feedback in the database
 *   3. Overdue recurring tasks
 *   4. Any pending P1+ tasks
 *
 * Run: node scripts/session-precheck.js
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const TASK_QUEUE = path.join(PROJECT_DIR, 'docs/state/task-queue.md');

async function main() {
  const reasons = [];

  // 1. Check for P0 tasks
  try {
    const queue = fs.readFileSync(TASK_QUEUE, 'utf8');
    const p0Lines = queue.split('\n').filter(line =>
      /\bP0\b/.test(line) && !/\*\*done\*\*/i.test(line) && !/~~/.test(line)
    );
    if (p0Lines.length > 0) {
      reasons.push(`P0 tasks: ${p0Lines.length}`);
    }
  } catch {
    // If task queue doesn't exist, that's itself a reason to run
    reasons.push('task-queue.md not found');
  }

  // 2. Check for unprocessed feedback in database
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query(
      "SELECT COUNT(*) AS count FROM feedback WHERE processed = false"
    );
    const count = parseInt(result.rows[0].count, 10);
    if (count > 0) {
      reasons.push(`unprocessed feedback: ${count}`);
    }
    await pool.end();
  } catch {
    // DB unavailable — don't block on this, other checks may suffice
  }

  // 3. Check for overdue recurring tasks
  try {
    const queue = fs.readFileSync(TASK_QUEUE, 'utf8');
    if (/OVERDUE/i.test(queue)) {
      reasons.push('overdue recurring tasks');
    }

    // Also check if any recurring task's "Next due" date is in the past
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dueDatePattern = /Next due[:\s]*(\d{4}-\d{2}-\d{2})/gi;
    let match;
    while ((match = dueDatePattern.exec(queue)) !== null) {
      if (match[1] <= today) {
        reasons.push(`recurring task due: ${match[1]}`);
        break; // One is enough to justify a session
      }
    }
  } catch {
    // Already handled above
  }

  // 4. Check for pending P1+ tasks
  try {
    const queue = fs.readFileSync(TASK_QUEUE, 'utf8');
    const pendingLines = queue.split('\n').filter(line =>
      /\bP[12]\b/.test(line) && !/\*\*done\*\*/i.test(line) && !/~~/.test(line)
    );
    if (pendingLines.length > 0) {
      reasons.push(`pending P1/P2 tasks: ${pendingLines.length}`);
    }
  } catch {
    // Already handled
  }

  if (reasons.length > 0) {
    process.stdout.write('work\n');
    // Log reasons to stderr for the session log
    process.stderr.write(`Pre-check found work: ${reasons.join('; ')}\n`);
  } else {
    process.stdout.write('skip\n');
    process.stderr.write('Pre-check: no actionable work found\n');
  }
}

main().catch(err => {
  // On error, default to "work" to avoid missing sessions
  process.stderr.write(`Pre-check error: ${err.message}\n`);
  process.stdout.write('work\n');
});
