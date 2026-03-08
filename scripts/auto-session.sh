#!/bin/bash
# Auto-session: runs a Claude Code session every 6 hours.
# Includes budget safety check before starting.
# Logs to ~/logs/session-YYYYMMDD-HHMM.log

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${HOME}/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M)
LOG_FILE="${LOG_DIR}/session-${TIMESTAMP}.log"
BUDGET_CAP_PCT=80

mkdir -p "${LOG_DIR}"

echo "[${TIMESTAMP}] Auto-session starting" | tee -a "${LOG_FILE}"

# Budget safety check
cd "${PROJECT_DIR}"
BUDGET_CHECK=$(node scripts/budget-check.js 2>&1)
echo "${BUDGET_CHECK}" >> "${LOG_FILE}"

PCT_USED=$(echo "${BUDGET_CHECK}" | grep "Budget used:" | grep -oP '[0-9]+\.[0-9]+(?=%)' || echo "0")
DAY_OF_MONTH=$(date +%-d)

if (( $(echo "${PCT_USED} >= ${BUDGET_CAP_PCT}" | bc -l) )); then
  MSG="[${TIMESTAMP}] Budget at ${PCT_USED}% — above ${BUDGET_CAP_PCT}% cap. Skipping session."
  echo "${MSG}" | tee -a "${LOG_FILE}"
  # Alert panel if over cap before day 21
  if [ "${DAY_OF_MONTH}" -lt 21 ]; then
    echo "Budget alert: ${PCT_USED}% used (cap: ${BUDGET_CAP_PCT}%) on day ${DAY_OF_MONTH}" | \
      node -e "
        require('dotenv').config();
        const {send} = require('./src/services/email');
        let body='';process.stdin.on('data',d=>body+=d).on('end',()=>{
          send({to:process.env.EMAIL_REPLY_TO||'panel@eskp.in',
                subject:'[eskp.in] Budget alert — auto-session skipped',
                text:body}).catch(console.error);
        });
      " 2>> "${LOG_FILE}" || true
  fi
  exit 0
fi

echo "[${TIMESTAMP}] Budget OK (${PCT_USED}%). Starting Claude session." | tee -a "${LOG_FILE}"

# Run Claude session with 30-minute timeout
timeout 1800 claude --print \
  "Read CLAUDE.md and docs/state/current-sprint.md. Check for new inbound emails or feedback in the database. Continue the highest-priority incomplete work from the current sprint. Update all docs/state/ files before ending. Commit with message 'state: end of session $(date -u +%Y-%m-%d)'." \
  >> "${LOG_FILE}" 2>&1 || {
    EXIT=$?
    if [ $EXIT -eq 124 ]; then
      echo "[${TIMESTAMP}] Session timed out after 30 minutes." >> "${LOG_FILE}"
    else
      echo "[${TIMESTAMP}] Session exited with code ${EXIT}." >> "${LOG_FILE}"
    fi
  }

echo "[${TIMESTAMP}] Auto-session complete. Log: ${LOG_FILE}"
