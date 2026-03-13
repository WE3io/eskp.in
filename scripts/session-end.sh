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
# Critical: must be updated every session (30 min window)
CRITICAL_STATE_FILES=(
  "docs/state/current-sprint.md"
  "docs/state/recent-decisions.md"
  "docs/state/budget-tracker.md"
  "docs/state/task-queue.md"
)

# Conditional: only needs updating when new feedback arrives (24h window)
CONDITIONAL_STATE_FILES=(
  "docs/state/feedback-queue.md"
)

for f in "${CRITICAL_STATE_FILES[@]}"; do
  if [ ! -f "${f}" ]; then
    echo "[session-end] WARNING: ${f} does not exist"
    WARNINGS=$((WARNINGS + 1))
    continue
  fi
  if find "${f}" -mmin "+${WINDOW_MINUTES}" 2>/dev/null | grep -q .; then
    echo "[session-end] WARNING: ${f} not updated this session (older than ${WINDOW_MINUTES} min)"
    WARNINGS=$((WARNINGS + 1))
  else
    echo "[session-end] OK: ${f}"
  fi
done

for f in "${CONDITIONAL_STATE_FILES[@]}"; do
  if [ ! -f "${f}" ]; then
    echo "[session-end] WARNING: ${f} does not exist"
    WARNINGS=$((WARNINGS + 1))
    continue
  fi
  # Warn only if older than 24 hours (feedback doesn't arrive every session)
  if find "${f}" -mmin "+1440" 2>/dev/null | grep -q .; then
    echo "[session-end] NOTE: ${f} not updated in 24h (update if new feedback received)"
  else
    echo "[session-end] OK: ${f}"
  fi
done

# ── 2. "Next session starts with:" pointer ────────────────────────────────────
if ! grep -qiE "Next session (starts|should start) with:" docs/state/current-sprint.md 2>/dev/null; then
  echo "[session-end] WARNING: 'Next session starts with:' pointer missing from current-sprint.md"
  WARNINGS=$((WARNINGS + 1))
else
  echo "[session-end] OK: 'Next session starts with:' pointer present"
fi

# ── 3. Session log content verification ───────────────────────────────────────
TODAY=$(date +%Y-%m-%d)
if ! grep -q "${TODAY}" docs/state/current-sprint.md 2>/dev/null; then
  echo "[session-end] WARNING: Today's date (${TODAY}) not found in current-sprint.md session entries"
  WARNINGS=$((WARNINGS + 1))
else
  echo "[session-end] OK: current-sprint.md contains today's date"
fi

# ── 4. Exclusion-register alignment check ─────────────────────────────────────
# Scan public HTML for hard-excluded domains marketed as use cases.
# Only checks staged/modified public files (not full history).
EXCLUDED_PATTERNS='<strong>Legal</strong>|<strong>Financial</strong>|<strong>Immigration</strong>|<strong>Medical</strong>'
CHANGED_PUBLIC=$(git diff --name-only HEAD 2>/dev/null | grep '^public/' || true)
if [ -n "${CHANGED_PUBLIC}" ]; then
  EXCLUSION_HITS=$(echo "${CHANGED_PUBLIC}" | xargs grep -lE "${EXCLUDED_PATTERNS}" 2>/dev/null || true)
  if [ -n "${EXCLUSION_HITS}" ]; then
    echo "[session-end] WARNING: Excluded domains found as use cases in modified public files:"
    echo "${EXCLUSION_HITS}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo "[session-end] OK: no excluded domains in modified public files"
  fi
fi

# ── 5. Uncommitted changes — auto-commit state files only ────────────────────
# Only commits docs/state/*.md — never source code or other files.
# If Claude crashed mid-edit, uncommitted source changes are left as-is
# so they can be reviewed and committed intentionally next session.
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  echo "[session-end] Uncommitted changes found — auto-committing docs/state/*.md only..."
  git add docs/state/*.md 2>/dev/null || true
  if ! git diff --cached --quiet 2>/dev/null; then
    git commit -m "state: auto-commit at session end $(date +%Y-%m-%d-%H%M)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>" 2>/dev/null && AUTO_COMMIT="Y" || true
    echo "[session-end] Auto-commit created (state files only)"
  else
    echo "[session-end] No staged state changes — skipping commit"
  fi
  # Report any remaining uncommitted non-state changes for awareness
  if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
    echo "[session-end] WARNING: Uncommitted non-state changes remain — review before next session"
  fi
else
  echo "[session-end] OK: working tree clean"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo "[session-end ${TIMESTAMP}] Done. Warnings: ${WARNINGS}. Auto-commit: ${AUTO_COMMIT}."
