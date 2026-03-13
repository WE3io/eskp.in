#!/usr/bin/env node
/**
 * Session pre-check — determines if there is actionable work and what kind
 * of session to run. Zero LLM cost — only filesystem and DB reads.
 *
 * Outputs to stdout (one line):
 *   "skip"              — no actionable work (skip the session)
 *   "routine"           — well-specified tasks; can use session-orchestrator.sh
 *   "agentic"           — needs CLI (multi-step, debugging, research, ops)
 *   "strategic"         — needs CLI + Opus (architecture, planning, design)
 *
 * Classification logic:
 *   - P0 tasks, unprocessed feedback, DB operations → "agentic"
 *   - Tasks with keywords (research|plan|architect|design|strategy) → "strategic"
 *   - Self-directed rotation categories → "agentic" (need web, shell, multi-step)
 *   - Regular P1-P3 code/config/content tasks → "routine"
 *   - Overdue recurring tasks → "agentic" (varied operations)
 *
 * Run: node scripts/session-precheck.js
 */
require('dotenv').config({ quiet: true });

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const TASK_QUEUE = path.join(PROJECT_DIR, 'docs/state/task-queue.md');

// Keywords that indicate a task needs strategic (Opus) treatment
const STRATEGIC_KEYWORDS = /research|plan|architect|design|spec|decision|strategy/i;

// Keywords that indicate a task needs agentic (CLI) treatment
const AGENTIC_KEYWORDS = /debug|investigate|deploy|migrate|refactor|audit|monitor|review.*log/i;

async function main() {
  const reasons = [];
  let sessionType = 'routine'; // default: cheapest path

  // 1. Check for P0 tasks → always agentic (critical, needs full agent capability)
  //    Only match actual task rows (contain TSK-), not section headers or definitions.
  try {
    const queue = fs.readFileSync(TASK_QUEUE, 'utf8');
    // Find the P0 section and look for undone task rows
    const p0Section = queue.match(/### P0[^\n]*\n[\s\S]*?(?=\n---|\n###|$)/);
    if (p0Section) {
      const p0Lines = p0Section[0].split('\n').filter(line =>
        /\bTSK-\d+\b/.test(line) && !/\*\*done\*\*/i.test(line) && !/~~/.test(line)
      );
      if (p0Lines.length > 0) {
        reasons.push(`P0 tasks: ${p0Lines.length}`);
        sessionType = 'agentic';
      }
    }
  } catch {
    // If task queue doesn't exist, that's itself a reason to run
    reasons.push('task-queue.md not found');
    sessionType = 'agentic';
  }

  // 2. Check for unprocessed feedback in database → agentic (DB + email ops)
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query(
      "SELECT COUNT(*) AS count FROM feedback WHERE processed = false"
    );
    const count = parseInt(result.rows[0].count, 10);
    if (count > 0) {
      reasons.push(`unprocessed feedback: ${count}`);
      if (sessionType !== 'strategic') sessionType = 'agentic';
    }
    await pool.end();
  } catch {
    // DB unavailable — don't block on this, other checks may suffice
  }

  // 3. Check for overdue recurring tasks → agentic (varied operations)
  try {
    const queue = fs.readFileSync(TASK_QUEUE, 'utf8');
    const today = new Date().toISOString().slice(0, 10);
    const dueDatePattern = /Next due[:\s]*(\d{4}-\d{2}-\d{2})/gi;
    let match;
    let hasOverdue = false;
    while ((match = dueDatePattern.exec(queue)) !== null) {
      if (match[1] <= today) {
        reasons.push(`recurring task due: ${match[1]}`);
        hasOverdue = true;
        break;
      }
    }
    if (/OVERDUE/i.test(queue)) {
      reasons.push('overdue recurring tasks');
      hasOverdue = true;
    }
    if (hasOverdue && sessionType !== 'strategic') {
      sessionType = 'agentic';
    }
  } catch {
    // Already handled above
  }

  // 4. Check for pending P1+ tasks and classify by content
  //    Only match actual task rows (contain TSK-), not headers or definitions.
  try {
    const queue = fs.readFileSync(TASK_QUEUE, 'utf8');
    const pendingLines = queue.split('\n').filter(line =>
      /\bTSK-\d+\b/.test(line) && !/\*\*done\*\*/i.test(line) && !/~~/.test(line) && !/\*\*paused\*\*/i.test(line)
    );
    if (pendingLines.length > 0) {
      reasons.push(`pending tasks: ${pendingLines.length}`);

      // Check top task for type classification
      const topTask = pendingLines[0];
      if (STRATEGIC_KEYWORDS.test(topTask)) {
        sessionType = 'strategic';
      } else if (AGENTIC_KEYWORDS.test(topTask) && sessionType === 'routine') {
        sessionType = 'agentic';
      }
      // Otherwise stays 'routine' — orchestrator can handle it
    }
  } catch {
    // Already handled
  }

  // 5. Check sprint pointer for self-directed work → agentic
  try {
    const sprint = fs.readFileSync(
      path.join(PROJECT_DIR, 'docs/state/current-sprint.md'), 'utf8'
    );
    const pointer = sprint.match(/Next session (?:starts|should start) with:\s*(.+)/i);
    if (pointer) {
      const pointerText = pointer[1];
      if (/self-directed|rotation|research|infrastructure|mission/i.test(pointerText)) {
        if (reasons.length === 0) reasons.push('self-directed rotation');
        if (sessionType === 'routine') sessionType = 'agentic';
      }
      if (STRATEGIC_KEYWORDS.test(pointerText)) {
        sessionType = 'strategic';
      }
    }
  } catch {
    // Sprint file missing is not fatal
  }

  if (reasons.length > 0) {
    process.stdout.write(`${sessionType}\n`);
    process.stderr.write(`Pre-check: ${sessionType} session — ${reasons.join('; ')}\n`);
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
