#!/bin/bash
# session-end.sh — post-session handoff checks.
# Called automatically by auto-session.sh after every Claude run.
# Run manually at the end of any interactive session:
#   bash scripts/session-end.sh
#
# Checks:
#   1. Each state file was modified in the last 30 minutes
#   2. No uncommitted changes exist (auto-commits if found)
#   3. "Next session starts with:" pointer exists in current-sprint.md
# Logs warnings for anything missing. Never pushes to remote.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M)
WINDOW_MINUTES=30
WARNINGS=0
AUTO_COMMIT="N"

cd "${PROJECT_DIR}"

echo "[session-end ${TIMESTAMP}] Running handoff checks..."

# ── 1. State file freshness ───────────────────────────────────────────────────
STATE_FILES=(
  "docs/state/current-sprint.md"
  "docs/state/recent-decisions.md"
  "docs/state/feedback-queue.md"
  "docs/state/budget-tracker.md"
  "docs/state/task-queue.md"
)

for f in "${STATE_FILES[@]}"; do
  if [ ! -f "${f}" ]; then
    echo "[session-end] WARNING: ${f} does not exist"
    WARNINGS=$((WARNINGS + 1))
    continue
  fi
  # Find files NOT modified in the last WINDOW_MINUTES
  if find "${f}" -mmin "+${WINDOW_MINUTES}" 2>/dev/null | grep -q .; then
    echo "[session-end] WARNING: ${f} not updated this session (older than ${WINDOW_MINUTES} min)"
    WARNINGS=$((WARNINGS + 1))
  else
    echo "[session-end] OK: ${f}"
  fi
done

# ── 2. "Next session starts with:" pointer ────────────────────────────────────
if ! grep -q "Next session starts with:" docs/state/current-sprint.md 2>/dev/null; then
  echo "[session-end] WARNING: 'Next session starts with:' pointer missing from current-sprint.md"
  WARNINGS=$((WARNINGS + 1))
else
  echo "[session-end] OK: 'Next session starts with:' pointer present"
fi

# ── 3. Uncommitted changes — auto-commit if found ────────────────────────────
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  echo "[session-end] Uncommitted changes found — auto-committing state files..."
  git add docs/state/ docs/backlog/ 2>/dev/null || true
  if ! git diff --cached --quiet 2>/dev/null; then
    git commit -m "state: auto-commit session cleanup ${TIMESTAMP}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>" 2>/dev/null && AUTO_COMMIT="Y" || true
    echo "[session-end] Auto-commit created"
  else
    echo "[session-end] No staged changes after git add — skipping commit"
  fi
else
  echo "[session-end] OK: working tree clean"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo "[session-end ${TIMESTAMP}] Done. Warnings: ${WARNINGS}. Auto-commit: ${AUTO_COMMIT}."
