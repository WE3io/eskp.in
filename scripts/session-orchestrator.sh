#!/bin/bash
# session-orchestrator.sh — Lightweight session runner for routine tasks.
#
# Replaces the expensive Claude CLI session for well-specified tasks by
# routing work through the orchestration layer's cheap models:
#
#   Coordinator (Haiku, ~$0.01)  → picks task, identifies files, writes spec
#   Worker (DeepSeek/Haiku)      → generates code/content
#   Reviewer (Sonnet, ~$0.01)    → reviews diff, approves or rejects
#
# Total cost per routine session: ~$0.03 vs ~$0.17 for a full CLI session.
#
# Called by auto-session.sh when session-precheck.js classifies the session
# as "routine". Falls back to Claude CLI for tasks the orchestrator can't handle.
#
# Usage:
#   scripts/session-orchestrator.sh              # run one task cycle
#   ORCHESTRATOR_DRY_RUN=1 scripts/session-orchestrator.sh  # plan only
#
# Exit codes:
#   0  Task completed and committed
#   1  Error (orchestration failure, review rejection after retries)
#   2  No actionable work (nothing to do)
#   3  Task requires CLI (orchestrator can't handle it)

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M)
DRY_RUN="${ORCHESTRATOR_DRY_RUN:-0}"
MAX_RETRIES=2

cd "${PROJECT_DIR}"

# Load environment
set -a
# shellcheck source=/dev/null
source "${PROJECT_DIR}/.env" 2>/dev/null || true
set +a

ALERT_EMAIL="${ALERT_EMAIL:-sunil@eskp.in}"

log() { echo "[orchestrator ${TIMESTAMP}] $*" >&2; }

# TSK-162: Alert on orchestrator failure (retries exhausted or reviewer rejection)
alert_failure() {
  local reason="$1"
  local task_id="${2:-unknown}"
  log "Sending failure alert: ${reason}"
  node -e "
    require('dotenv').config({ quiet: true });
    const { send } = require('./src/services/email');
    send({
      to: '${ALERT_EMAIL}',
      subject: '[eskp.in] Orchestrator failure: ${task_id}',
      text: 'Session orchestrator failed.\n\nTask: ${task_id}\nReason: ${reason}\nTimestamp: ${TIMESTAMP}\n\nThis task will be retried by the next CLI session.',
    }).then(() => process.exit(0)).catch(() => process.exit(0));
  " 2>/dev/null || true
}

# ── 1. Coordinator: pick task and plan ──────────────────────────────────────

log "Phase 1: Coordinator (planner role via Haiku)"

# Build coordinator input: task queue + current sprint pointer
TASK_QUEUE=$(cat "${PROJECT_DIR}/docs/state/task-queue.md" 2>/dev/null || echo "No task queue found")
SPRINT_POINTER=$(grep -iE "Next session (starts|should start) with:" \
  "${PROJECT_DIR}/docs/state/current-sprint.md" 2>/dev/null | tail -1 || echo "")

COORDINATOR_SYSTEM="You are a session coordinator for the eskp.in platform.
Your job: pick ONE task from the task queue and output a structured plan.

Rules:
- Pick the highest-priority OPEN task (not done, not paused, not blocked).
- Priority order: P0 > P1 > P2 > P3.
- Skip tasks that say 'open' but require human action (e.g. 'awaiting Sunil').
- If the sprint pointer suggests a specific task, prefer that.
- Only pick tasks that involve code changes, config updates, or content drafting.
- If no suitable task exists, output ONLY the word: NO_WORK

Output format (YAML, no markdown fences):
task_id: TSK-NNN
description: one-line summary
type: code|config|content|ops
files_to_read:
  - path/to/file1.js
  - path/to/file2.js
files_to_modify:
  - path/to/file1.js
acceptance_criteria:
  - criterion 1
  - criterion 2
implementation_spec: |
  Detailed instructions for the coder/drafter.
  Include what to change, why, and constraints."

COORDINATOR_INPUT="Sprint pointer: ${SPRINT_POINTER}

--- Task Queue ---
${TASK_QUEUE}
--- End Task Queue ---"

PLAN=$(node scripts/orch-infer.js --role planner \
  --system "${COORDINATOR_SYSTEM}" \
  --input "${COORDINATOR_INPUT}" 2>/dev/null) || {
  log "ERROR: Coordinator failed"
  alert_failure "Coordinator (planner) failed to produce a plan" "none"
  exit 1
}

# Check for NO_WORK
if echo "${PLAN}" | grep -q "NO_WORK"; then
  log "No actionable work found by coordinator"
  exit 2
fi

# Extract key fields from YAML plan
TASK_ID=$(echo "${PLAN}" | grep -oP 'task_id:\s*\K\S+' || echo "unknown")
TASK_TYPE=$(echo "${PLAN}" | grep -oP 'type:\s*\K\S+' || echo "code")
TASK_DESC=$(echo "${PLAN}" | grep -oP 'description:\s*\K.+' || echo "unknown task")

log "Coordinator selected: ${TASK_ID} (${TASK_TYPE}) — ${TASK_DESC}"

# Extract files_to_read as space-separated list
FILES_TO_READ=$(echo "${PLAN}" | sed -n '/^files_to_read:/,/^[a-z_]*:/p' | grep '^\s*-' | sed 's/^\s*-\s*//' | tr '\n' ' ')

if [ "${DRY_RUN}" = "1" ]; then
  log "DRY RUN — plan output:"
  echo "${PLAN}" >&2
  exit 0
fi

# Check if task type is something we can handle
if [ "${TASK_TYPE}" = "ops" ]; then
  log "Task type 'ops' requires CLI session (shell commands, monitoring)"
  exit 3
fi

# ── 2. Worker: generate code/content ────────────────────────────────────────

log "Phase 2: Worker (${TASK_TYPE} generation)"

# Build file context flags for orch-infer.js
FILE_FLAGS=""
for f in ${FILES_TO_READ}; do
  if [ -f "${PROJECT_DIR}/${f}" ]; then
    FILE_FLAGS="${FILE_FLAGS} ${f}"
  else
    log "WARN: file not found: ${f}"
  fi
done

# Select the right role based on task type
case "${TASK_TYPE}" in
  code|config)  WORKER_ROLE="coder" ;;
  content)      WORKER_ROLE="drafter" ;;
  *)            WORKER_ROLE="coder" ;;
esac

# Extract implementation_spec from plan (everything after "implementation_spec: |")
IMPL_SPEC=$(echo "${PLAN}" | sed -n '/^implementation_spec:/,$ p' | tail -n +2 | sed 's/^  //')

WORKER_SYSTEM="You are implementing a change for the eskp.in platform.
Output your changes as <file path=\"relative/path\">...code...</file> blocks.
Include the COMPLETE file content for each modified file.
Do not include explanations outside the file blocks.
Do not modify files that don't need changes."

WORKER_INPUT="Task: ${TASK_ID} — ${TASK_DESC}

${IMPL_SPEC}

Output each modified file as a <file path=\"...\">...</file> block."

ATTEMPT=0
WORKER_SUCCESS=0

while [ "${ATTEMPT}" -lt "${MAX_RETRIES}" ]; do
  ATTEMPT=$((ATTEMPT + 1))
  log "Worker attempt ${ATTEMPT}/${MAX_RETRIES} via ${WORKER_ROLE} role"

  if [ -n "${FILE_FLAGS}" ]; then
    # shellcheck disable=SC2086
    WORKER_OUTPUT=$(node scripts/orch-infer.js --role "${WORKER_ROLE}" \
      --system "${WORKER_SYSTEM}" \
      --input "${WORKER_INPUT}" \
      --files ${FILE_FLAGS} \
      --validate 2>/dev/null) && WORKER_EXIT=0 || WORKER_EXIT=$?
  else
    WORKER_OUTPUT=$(node scripts/orch-infer.js --role "${WORKER_ROLE}" \
      --system "${WORKER_SYSTEM}" \
      --input "${WORKER_INPUT}" \
      --validate 2>/dev/null) && WORKER_EXIT=0 || WORKER_EXIT=$?
  fi

  if [ "${WORKER_EXIT}" -eq 2 ]; then
    log "Worker output validation failed (attempt ${ATTEMPT})"
    continue
  elif [ "${WORKER_EXIT}" -ne 0 ]; then
    log "Worker error (exit ${WORKER_EXIT})"
    continue
  fi

  # Try to apply the output
  APPLY_OUTPUT=$(echo "${WORKER_OUTPUT}" | node scripts/apply-code-output.js 2>&1) && APPLY_EXIT=0 || APPLY_EXIT=$?

  if [ "${APPLY_EXIT}" -ne 0 ]; then
    log "Apply failed: ${APPLY_OUTPUT}"
    continue
  fi

  log "Applied: ${APPLY_OUTPUT}"
  WORKER_SUCCESS=1
  break
done

if [ "${WORKER_SUCCESS}" -ne 1 ]; then
  log "ERROR: Worker failed after ${MAX_RETRIES} attempts — needs CLI session"
  alert_failure "Worker failed after ${MAX_RETRIES} attempts" "${TASK_ID}"
  # Reset any partial changes
  git checkout -- . 2>/dev/null || true
  exit 3
fi

# ── 3. Reviewer: check the diff ────────────────────────────────────────────

log "Phase 3: Reviewer (sonnet via reviewer role)"

# Stage changes and capture diff
git add -A
DIFF=$(git diff --cached 2>/dev/null || echo "")

if [ -z "${DIFF}" ]; then
  log "No changes to review (diff is empty)"
  git reset HEAD -- . 2>/dev/null || true
  exit 2
fi

DIFF_LINES=$(echo "${DIFF}" | wc -l | tr -d ' ')
log "Reviewing diff: ${DIFF_LINES} lines"

# Truncate very large diffs to stay within context limits
MAX_DIFF_CHARS=15000
TRUNCATED_DIFF="${DIFF}"
if [ "${#DIFF}" -gt "${MAX_DIFF_CHARS}" ]; then
  TRUNCATED_DIFF="${DIFF:0:${MAX_DIFF_CHARS}}

... [truncated — ${DIFF_LINES} total lines] ..."
  log "WARN: diff truncated to ${MAX_DIFF_CHARS} chars for review"
fi

REVIEW_SYSTEM="You are a code reviewer for the eskp.in platform.
Review this diff for:
1. Correctness — does it do what the task requires?
2. Security — SQL injection, XSS, path traversal, credential exposure?
3. Quality — obvious bugs, missing error handling, broken logic?

Output EXACTLY one of:
  APPROVED — if the change is acceptable
  REJECTED: <reason> — if there is a concrete problem

Do not reject for style preferences. Only reject for real issues.
Be concise. One line."

REVIEW_INPUT="Task: ${TASK_ID} — ${TASK_DESC}

--- Diff ---
${TRUNCATED_DIFF}
--- End Diff ---"

REVIEW=$(node scripts/orch-infer.js --role reviewer \
  --system "${REVIEW_SYSTEM}" \
  --input "${REVIEW_INPUT}" 2>/dev/null) || {
  log "ERROR: Reviewer API failed — reverting and escalating to CLI session"
  git reset HEAD -- . 2>/dev/null || true
  git checkout -- . 2>/dev/null || true
  alert_failure "Reviewer API call failed (transient or budget issue)" "${TASK_ID}"
  exit 3
}

log "Review result: ${REVIEW}"

if echo "${REVIEW}" | grep -qi "REJECTED"; then
  log "Review REJECTED — reverting changes"
  alert_failure "Reviewer rejected: $(echo "${REVIEW}" | head -1)" "${TASK_ID}"
  git reset HEAD -- . 2>/dev/null || true
  git checkout -- . 2>/dev/null || true
  # Could retry with feedback, but for now escalate to CLI
  exit 3
fi

# ── 4. Commit ───────────────────────────────────────────────────────────────

log "Phase 4: Commit"

COMMIT_MSG="${TASK_ID}: ${TASK_DESC}

Implemented via session orchestrator (planner→coder→reviewer).
Models: planner=haiku, worker=${WORKER_ROLE}, reviewer=sonnet.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git commit -m "${COMMIT_MSG}" 2>/dev/null || {
  log "ERROR: git commit failed"
  exit 1
}

COMMIT_SHA=$(git rev-parse --short HEAD)
log "Committed: ${COMMIT_SHA}"

# ── 5. Summary ──────────────────────────────────────────────────────────────

log "Session complete: ${TASK_ID} committed as ${COMMIT_SHA}"
echo "${TASK_ID}"
