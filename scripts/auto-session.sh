#!/bin/bash
# Auto-session: runs a Claude Code session every 6 hours.
# Includes budget safety check, lock file, .env loading, outcome
# verification, failure alerting, and optional success notification.
# Logs to ~/logs/session-YYYYMMDD-HHMM.log

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${HOME}/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M)
LOG_FILE="${LOG_DIR}/session-${TIMESTAMP}.log"
LOCK_FILE="/tmp/claude-session.lock"
BUDGET_CAP_PCT=80

mkdir -p "${LOG_DIR}"

# ── Log rotation: delete session logs older than 30 days ─────────────────────
find "${LOG_DIR}" -name "session-*.log" -mtime +30 -delete 2>/dev/null || true

# ── Lock: prevent concurrent sessions ────────────────────────────────────────
exec 200>"${LOCK_FILE}"
if ! flock -n 200; then
  echo "[${TIMESTAMP}] Session already running (lock held). Exiting." | tee -a "${LOG_FILE}"
  exit 0
fi
# Lock is held via fd 200 for the lifetime of this process.
# Released automatically on exit (including crash or kill).

SESSION_START_EPOCH=$(date +%s)
echo "[${TIMESTAMP}] Auto-session starting" | tee -a "${LOG_FILE}"

# ── Environment: load .env explicitly ────────────────────────────────────────
# Do not rely on .bashrc or saved Claude config for ANTHROPIC_API_KEY.
# set -a exports all variables defined by source; set +a stops exporting.
set -a
# shellcheck source=/dev/null
source "${PROJECT_DIR}/.env" 2>/dev/null || true
set +a

NOTIFY_ON_SUCCESS="${NOTIFY_ON_SUCCESS:-false}"

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
    ALERT_BODY_FILE=$(mktemp)
    echo "Budget at ${PCT_USED}% (cap: ${BUDGET_CAP_PCT}%) on day ${DAY_OF_MONTH}. Auto-session skipped." > "${ALERT_BODY_FILE}"
    ALERT_BODY_FILE="${ALERT_BODY_FILE}" node -e "
      require('dotenv').config();
      const fs = require('fs');
      const {send} = require('./src/services/email');
      const body = fs.readFileSync(process.env.ALERT_BODY_FILE, 'utf8');
      send({
        to: process.env.EMAIL_REPLY_TO || 'sunil@eskp.in',
        subject: '[eskp.in] Budget alert — auto-session skipped',
        text: body
      }).catch(console.error);
    " 2>> "${LOG_FILE}" || true
    rm -f "${ALERT_BODY_FILE}"
  fi
  exit 0
fi

echo "[${TIMESTAMP}] Budget OK (${PCT_USED}%). Starting Claude session." | tee -a "${LOG_FILE}"

# ── Capture state before session ──────────────────────────────────────────────
HEAD_BEFORE=$(git rev-parse HEAD 2>/dev/null || echo "none")

# ── Run Claude session ────────────────────────────────────────────────────────
# Unset CLAUDECODE so the script can be run manually inside an active session
# without triggering the nested-session guard. The cron job runs outside any
# session so this is a no-op there.
unset CLAUDECODE 2>/dev/null || true

SESSION_EXIT=0
timeout 2700 claude \
  --permission-mode acceptEdits \
  --print \
  "Read CLAUDE.md (focus on: Identity, Current Phase, Risk Assessment Protocol, Session Continuity, Task Management). Read docs/state/current-sprint.md — the 'Next session starts with' line is your first task. Read docs/state/task-queue.md for the prioritised task list. Read docs/state/budget-tracker.md.

Execute work in this priority order:
1. P0 tasks from task-queue.md (critical bugs, security, data loss)
2. Unprocessed inbound emails or user feedback (check emails table: SELECT id, from_address, subject, created_at FROM emails ORDER BY created_at DESC LIMIT 5)
3. Overdue recurring tasks (check due dates in task-queue.md)
4. The highest-priority incomplete task from the queue — then continue to the next, and the next
5. Self-directed improvement (see below) — when the queue is clear or all remaining tasks are blocked

Complete as many tasks as possible within this session. Do not stop after one task — check the queue again and continue with the next priority item. Only stop when fewer than 5 minutes remain (budget time for state file updates and commits). Commit after each completed task, not just at the end — this creates clean checkpoints.

--- SELF-DIRECTED WORK ---
Read docs/state/self-directed.md to see which category was last done. Pick the next one in rotation. Choose one of:

a) RESEARCH — Search the web for better approaches to something the platform currently does (matching algorithms, security best practices, privacy-preserving architectures, email deliverability, etc.). Create docs/research/YYYY-MM-DD-topic.md. Generate tasks if improvements are viable.

b) CODE QUALITY — Review your own code. Run: cd /root/project && npm audit 2>&1 | head -40. Check for unhandled errors, missing edge cases, insecure patterns. Create tasks for any real issues found.

c) INFRASTRUCTURE — Check server health beyond the basics: disk trends (df -h), memory (free -h), Docker image sizes (docker images), dependency CVEs (npm audit), SSL expiry, backup log freshness. Fix what you can; create tasks for what you cannot.

d) MISSION ALIGNMENT — Re-read CONSTITUTION.md Articles 1 and 3. Review docs/state/recent-decisions.md against constitutional principles. Are there gaps between what the platform does and what it should? Generate tasks if so.

e) GROWTH — Think from the outside: what would attract the next user? What would make an existing helper more effective? What friction exists in the current flow? Generate tasks if ideas are viable.

f) COMMUNICATION — Draft build-in-public content, review and improve the landing page, check whether docs/updates/ reflects real progress, review README currency.

After completing self-directed work: update docs/state/self-directed.md with what category was done and what was found. Commit.
--- END SELF-DIRECTED WORK ---

Rules and skills:
- Follow .claude/rules/ for all work: security.md (input validation, no secrets in code, SQL injection prevention), debugging.md (observe→hypothesize→test→fix), testing.md (black-box, deterministic), context-management.md (checkpoint every 10–15 messages)
- Use available skills where they match the task: 'implementation-executor' when executing a well-formed backlog item, 'work-item-designer' when defining a new task, 'safety-lens' before any risky or public-facing change, 'decision-lens' when evaluating options, 'simplify' after writing new code
- Before starting any multi-file development task, check .claude/skills/ for relevant skills and follow their processes. For complex tasks that would benefit from Agent Teams, run through the task-scope-gate skill first to validate scope.

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
5. Run git push to publish commits to remote
6. Write a 'Next session starts with:' line at the bottom of current-sprint.md" \
  >> "${LOG_FILE}" 2>&1 || {
    SESSION_EXIT=$?
    if [ "${SESSION_EXIT}" -eq 124 ]; then
      echo "[${TIMESTAMP}] Session timed out after 45 minutes." >> "${LOG_FILE}"
    else
      echo "[${TIMESTAMP}] Session exited with code ${SESSION_EXIT}." >> "${LOG_FILE}"
    fi
  }

# ── Push any commits made during the session ─────────────────────────────────
git push 2>> "${LOG_FILE}" || true

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

# TSK-083: calculate session duration
SESSION_END_EPOCH=$(date +%s)
SESSION_DURATION_S=$(( SESSION_END_EPOCH - SESSION_START_EPOCH ))
SESSION_DURATION_MIN=$(( SESSION_DURATION_S / 60 ))
SESSION_DURATION_SEC=$(( SESSION_DURATION_S % 60 ))

SUMMARY_LINE="[${TIMESTAMP}] Summary: Commits: ${COMMITS_MADE}. State updated: ${STATE_UPDATED}. Output lines: ${OUTPUT_LINES}. Exit: ${SESSION_EXIT}. Duration: ${SESSION_DURATION_MIN}m${SESSION_DURATION_SEC}s."
echo "${SUMMARY_LINE}" | tee -a "${LOG_FILE}"

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
  ALERT_BODY_FILE=$(mktemp)
  {
    echo "Auto-session alert: ${FAILURE_REASON}"
    echo "Timestamp: ${TIMESTAMP}"
    echo "Log: ${LOG_FILE}"
    echo ""
    echo "--- Last 50 lines of session log ---"
    tail -50 "${LOG_FILE}" 2>/dev/null || echo "(log unavailable)"
  } > "${ALERT_BODY_FILE}"
  ALERT_BODY_FILE="${ALERT_BODY_FILE}" FAILURE_REASON="${FAILURE_REASON}" node -e "
    require('dotenv').config();
    const fs = require('fs');
    const {send} = require('./src/services/email');
    const body = fs.readFileSync(process.env.ALERT_BODY_FILE, 'utf8');
    const reason = process.env.FAILURE_REASON;
    send({
      to: process.env.EMAIL_REPLY_TO || 'sunil@eskp.in',
      subject: '[eskp.in] Auto-session alert — ' + reason,
      text: body
    }).catch(console.error);
  " 2>> "${LOG_FILE}" || true
  rm -f "${ALERT_BODY_FILE}"
  echo "[${TIMESTAMP}] Failure alert sent: ${FAILURE_REASON}" >> "${LOG_FILE}"
fi

# ── Optional success notification ─────────────────────────────────────────────
if [ "${FAILED}" = "N" ] && [ "${NOTIFY_ON_SUCCESS}" = "true" ]; then
  NEXT_POINTER=$(grep -iE "Next session (starts|should start) with:" "${PROJECT_DIR}/docs/state/current-sprint.md" 2>/dev/null | tail -1 || echo "(not set)")
  COMMIT_LOG=""
  if [ "${COMMITS_MADE}" -gt 0 ]; then
    COMMIT_LOG=$(git log --oneline "${HEAD_BEFORE}..${HEAD_AFTER}" 2>/dev/null || echo "(unavailable)")
  fi
  SUCCESS_BODY_FILE=$(mktemp)
  {
    echo "Auto-session completed successfully."
    echo "Timestamp: ${TIMESTAMP}"
    echo "Commits made: ${COMMITS_MADE}"
    echo ""
    if [ -n "${COMMIT_LOG}" ]; then
      echo "--- Commits ---"
      echo "${COMMIT_LOG}"
      echo ""
    fi
    echo "--- Next session ---"
    echo "${NEXT_POINTER}"
  } > "${SUCCESS_BODY_FILE}"
  SUCCESS_BODY_FILE="${SUCCESS_BODY_FILE}" COMMITS_MADE="${COMMITS_MADE}" node -e "
    require('dotenv').config();
    const fs = require('fs');
    const {send} = require('./src/services/email');
    const body = fs.readFileSync(process.env.SUCCESS_BODY_FILE, 'utf8');
    const commits = process.env.COMMITS_MADE;
    send({
      to: process.env.EMAIL_REPLY_TO || 'sunil@eskp.in',
      subject: '[eskp.in] Auto-session complete — ' + commits + ' commit(s)',
      text: body
    }).catch(console.error);
  " 2>> "${LOG_FILE}" || true
  rm -f "${SUCCESS_BODY_FILE}"
  echo "[${TIMESTAMP}] Success notification sent." >> "${LOG_FILE}"
fi

# ── Session-end checks ────────────────────────────────────────────────────────
if [ -x "${PROJECT_DIR}/scripts/session-end.sh" ]; then
  bash "${PROJECT_DIR}/scripts/session-end.sh" >> "${LOG_FILE}" 2>&1 || true
fi

echo "[${TIMESTAMP}] Auto-session complete. Log: ${LOG_FILE}"
