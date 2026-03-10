#!/bin/bash
# check-cron-health.sh — verifies auto-session cron is still running.
# Runs at 04:00, 12:00, 20:00 (offset from auto-session at 00:00/06:00/12:00/18:00).
# Checks: at least one session log exists with mtime < 7 hours.
# On failure: sends email alert to Sunil.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${HOME}/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M)
MAX_AGE_HOURS=7

cd "${PROJECT_DIR}"

# Load .env for email credentials
set -a
# shellcheck source=/dev/null
source "${PROJECT_DIR}/.env" 2>/dev/null || true
set +a

# Find session logs modified in the last MAX_AGE_HOURS hours
RECENT_LOG=$(find "${LOG_DIR}" -name "session-*.log" -mmin "-$((MAX_AGE_HOURS * 60))" 2>/dev/null | sort | tail -1)

if [ -z "${RECENT_LOG}" ]; then
  node -e "
    require('dotenv').config();
    const {send} = require('./src/services/email');
    send({
      to: process.env.ALERT_EMAIL || 'sunil@eskp.in',
      subject: '[eskp.in] Cron health alert — no auto-session in ${MAX_AGE_HOURS}h',
      text: 'No auto-session log found in the last ${MAX_AGE_HOURS} hours.\n\nTimestamp: ${TIMESTAMP}\nLog directory: ${LOG_DIR}\n\nThe auto-session cron job may have stopped or failed silently.\n\nCheck: crontab -l\nCheck: cat /root/logs/cron.log'
    }).catch(console.error);
  " 2>/dev/null || true
  echo "[cron-health ${TIMESTAMP}] ALERT: no session log in last ${MAX_AGE_HOURS}h"
  exit 1
fi

echo "[cron-health ${TIMESTAMP}] OK: most recent session log: ${RECENT_LOG}"
