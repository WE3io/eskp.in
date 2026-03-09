#!/bin/bash
# Auto-session: runs a Claude Code session every 6 hours.
# Includes budget safety check, lock file, .env loading, outcome
# verification, and failure alerting.
# Logs to ~/logs/session-YYYYMMDD-HHMM.log

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${HOME}/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M)
LOG_FILE="${LOG_DIR}/session-${TIMESTAMP}.log"
LOCK_FILE="/tmp/claude-session.lock"
BUDGET_CAP_PCT=80

mkdir -p "${LOG_DIR}"

# ── Lock: prevent concurrent sessions ────────────────────────────────────────
exec 200>"${LOCK_FILE}"
if ! flock -n 200; then
  echo "[${TIMESTAMP}] Session already running (lock held). Exiting." | tee -a "${LOG_FILE}"
  exit 0
fi
# Lock is held via fd 200 for the lifetime of this process.
# Released automatically on exit (including crash or kill).

echo "[${TIMESTAMP}] Auto-session starting" | tee -a "${LOG_FILE}"

# ── Environment: load .env explicitly ────────────────────────────────────────
# Do not rely on .bashrc or saved Claude config for ANTHROPIC_API_KEY.
# set -a exports all variables defined by source; set +a stops exporting.
set -a
# shellcheck source=/dev/null
source "${PROJECT_DIR}/.env" 2>/dev/null || true
set +a

# ── Budget safety check ───────────────────────────────────────────────────────
cd "${PROJECT_DIR}"
BUDGET_CHECK=$(node scripts/budget-check.js 2>&1)
echo "${BUDGET_CHECK}" >> "${LOG_FILE}"

PCT_USED=$(echo "${BUDGET_CHECK}" | grep "Budget used:" | grep -oP '[0-9]+\.[0-9]+(?=%)' || echo "0")
DAY_OF_MONTH=$(date +%-d)

if (( $(echo "${PCT_USED} >= ${BUDGET_CAP_PCT}" | bc -l) )); then
  MSG="[${TIMESTAMP}] Budget at ${PCT_USED}% — above ${BUDGET_CAP_PCT}% cap. Skipping session."
  echo "${MSG}" | tee -a "${LOG_FILE}"
  if [ "${DAY_OF_MONTH}" -lt 21 ]; then
    node -e "
      require('dotenv').config();
      const {send} = require('./src/services/email');
      send({
        to: process.env.EMAIL_REPLY_TO || 'sunil@eskp.in',
        subject: '[eskp.in] Budget alert — auto-session skipped',
        text: 'Budget at ${PCT_USED}% (cap: ${BUDGET_CAP_PCT}%) on day ${DAY_OF_MONTH}. Auto-session skipped.'
      }).catch(console.error);
    " 2>> "${LOG_FILE}" || true
  fi
  exit 0
fi

echo "[${TIMESTAMP}] Budget OK (${PCT_USED}%). Starting Claude session." | tee -a "${LOG_FILE}"

# ── Capture state before session ──────────────────────────────────────────────
HEAD_BEFORE=$(git rev-parse HEAD 2>/dev/null || echo "none")

# ── Run Claude session ────────────────────────────────────────────────────────
SESSION_EXIT=0
timeout 1800 claude \
  --permission-mode acceptEdits \
  --print \
  "Read CLAUDE.md (focus on: Identity, Current Phase, Risk Assessment Protocol, Session Continuity, Task Management). Read docs/state/current-sprint.md — the 'Next session starts with' line is your first task. Read docs/state/task-queue.md for the prioritised task list. Read docs/state/budget-tracker.md.

Execute work in this priority order, completing as many tasks as time allows (target: 2–4 tasks per session):
1. P0 tasks from task-queue.md (critical bugs, security, data loss)
2. Unprocessed inbound emails or user feedback (check emails table: SELECT id, from_address, subject, created_at FROM emails ORDER BY created_at DESC LIMIT 5)
3. Overdue recurring tasks (check due dates in task-queue.md)
4. The highest-priority incomplete task from the queue — then continue to the next, and the next

After completing each task: commit it immediately with a descriptive message, mark it done in task-queue.md, then move straight to the next task without stopping. Do not treat completing one task as a signal to end the session. Keep working through the queue until fewer than 5 minutes remain or you reach a task that is blocked or requires human input.

Constraints for this automated session:
- Do not modify CONSTITUTION.md
- Do not send emails to addresses outside the panel unless processing a legitimate user goal through the standard platform flow
- Do not deploy breaking changes without flagging in current-sprint.md first
- Prefer small, committable units of work over large refactors

Before this session ends:
1. Update docs/state/current-sprint.md with what you did and what is next
2. Update docs/state/task-queue.md — mark completed tasks, adjust priorities, update recurring task dates
3. Run pnpm budget to update docs/state/budget-tracker.md
4. Commit all changes with a descriptive message
5. Write a 'Next session starts with:' line at the bottom of current-sprint.md" \
  >> "${LOG_FILE}" 2>&1 || {
    SESSION_EXIT=$?
    if [ "${SESSION_EXIT}" -eq 124 ]; then
      echo "[${TIMESTAMP}] Session timed out after 30 minutes." >> "${LOG_FILE}"
    else
      echo "[${TIMESTAMP}] Session exited with code ${SESSION_EXIT}." >> "${LOG_FILE}"
    fi
  }

# ── Outcome verification ──────────────────────────────────────────────────────
HEAD_AFTER=$(git rev-parse HEAD 2>/dev/null || echo "none")
COMMITS_MADE=0
if [ "${HEAD_BEFORE}" != "none" ] && [ "${HEAD_AFTER}" != "none" ] && [ "${HEAD_BEFORE}" != "${HEAD_AFTER}" ]; then
  COMMITS_MADE=$(git log --oneline "${HEAD_BEFORE}..${HEAD_AFTER}" 2>/dev/null | wc -l | tr -d ' ')
fi

STATE_UPDATED="N"
if find "${PROJECT_DIR}/docs/state" -name "*.md" -newer "${LOG_FILE}" 2>/dev/null | grep -q .; then
  STATE_UPDATED="Y"
fi

OUTPUT_LINES=$(wc -l < "${LOG_FILE}" 2>/dev/null | tr -d ' ' || echo 0)

echo "[${TIMESTAMP}] Summary: Commits: ${COMMITS_MADE}. State updated: ${STATE_UPDATED}. Output lines: ${OUTPUT_LINES}. Exit: ${SESSION_EXIT}." \
  | tee -a "${LOG_FILE}"

# ── Failure alerting ──────────────────────────────────────────────────────────
FAILED="N"
FAILURE_REASON=""

if [ "${SESSION_EXIT}" -ne 0 ]; then
  FAILED="Y"
  FAILURE_REASON="Session exited with code ${SESSION_EXIT}"
elif [ "${COMMITS_MADE}" -eq 0 ] && [ "${STATE_UPDATED}" = "N" ]; then
  FAILED="Y"
  FAILURE_REASON="Session produced no observable output (zero commits, state files unchanged)"
fi

if [ "${FAILED}" = "Y" ]; then
  TAIL_LOG=$(tail -50 "${LOG_FILE}" 2>/dev/null || echo "(log unavailable)")
  node -e "
    require('dotenv').config();
    const {send} = require('./src/services/email');
    const body = [
      'Auto-session alert: ${FAILURE_REASON}',
      'Timestamp: ${TIMESTAMP}',
      'Log: ${LOG_FILE}',
      '',
      '--- Last 50 lines of session log ---',
      $(echo "${TAIL_LOG}" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")
    ].join('\n');
    send({
      to: process.env.EMAIL_REPLY_TO || 'sunil@eskp.in',
      subject: '[eskp.in] Auto-session alert — ${FAILURE_REASON}',
      text: body
    }).catch(console.error);
  " 2>> "${LOG_FILE}" || true
  echo "[${TIMESTAMP}] Failure alert sent: ${FAILURE_REASON}" >> "${LOG_FILE}"
fi

# ── Session-end checks ────────────────────────────────────────────────────────
if [ -x "${PROJECT_DIR}/scripts/session-end.sh" ]; then
  bash "${PROJECT_DIR}/scripts/session-end.sh" >> "${LOG_FILE}" 2>&1 || true
fi

echo "[${TIMESTAMP}] Auto-session complete. Log: ${LOG_FILE}"
