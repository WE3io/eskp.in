#!/bin/bash
# heartbeat.sh — infrastructure health check.
# Runs every 15 minutes via cron.
# Checks: app, PostgreSQL, nginx, disk usage.
# On any failure: sends email alert to Sunil via Resend.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP=$(date +%Y%m%d-%H%M)
DISK_ALERT_PCT=85

cd "${PROJECT_DIR}"

# Load .env for email credentials
set -a
# shellcheck source=/dev/null
source "${PROJECT_DIR}/.env" 2>/dev/null || true
set +a

FAILURES=()

# ── 1. App health (via Docker healthcheck status) ─────────────────────────────
APP_HEALTH=$(docker inspect platform-app --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
if [ "${APP_HEALTH}" != "healthy" ]; then
  FAILURES+=("App container health: ${APP_HEALTH} (expected: healthy)")
fi

# ── 2. PostgreSQL ─────────────────────────────────────────────────────────────
if ! docker exec platform-db pg_isready -U platform -q 2>/dev/null; then
  FAILURES+=("PostgreSQL: pg_isready failed")
fi

# ── 3. nginx / HTTPS ─────────────────────────────────────────────────────────
NGINX_STATUS=$(curl -s -k -o /dev/null -w "%{http_code}" --max-time 5 https://localhost 2>/dev/null || echo "000")
if [ "${NGINX_STATUS}" != "200" ] && [ "${NGINX_STATUS}" != "301" ] && [ "${NGINX_STATUS}" != "302" ]; then
  FAILURES+=("nginx HTTPS: got HTTP ${NGINX_STATUS} (expected 200/301/302)")
fi

# ── 4. TLS certificate expiry ─────────────────────────────────────────────────
CERT_WARN_DAYS=30
if command -v openssl &>/dev/null; then
  CERT_EXPIRY=$(echo | openssl s_client -connect eskp.in:443 -servername eskp.in 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null | sed 's/notAfter=//' || echo "")
  if [ -n "${CERT_EXPIRY}" ]; then
    CERT_EPOCH=$(date -d "${CERT_EXPIRY}" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (CERT_EPOCH - NOW_EPOCH) / 86400 ))
    if [ "${DAYS_LEFT}" -lt "${CERT_WARN_DAYS}" ]; then
      FAILURES+=("TLS cert for eskp.in expires in ${DAYS_LEFT} days (threshold: ${CERT_WARN_DAYS})")
    fi
  fi
fi

# ── 5. Disk usage ─────────────────────────────────────────────────────────────
DISK_PCT=$(df / 2>/dev/null | awk 'NR==2 {gsub(/%/,""); print $5}' || echo 0)
if [ "${DISK_PCT}" -ge "${DISK_ALERT_PCT}" ]; then
  FAILURES+=("Disk usage: ${DISK_PCT}% used (threshold: ${DISK_ALERT_PCT}%)")
fi

# ── 6. Ollama (optional — warning only, not a critical failure) ───────────────
OLLAMA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:11434/api/tags 2>/dev/null || echo "000")
if [ "${OLLAMA_STATUS}" != "200" ]; then
  echo "[heartbeat ${TIMESTAMP}] WARN: Ollama not responding (HTTP ${OLLAMA_STATUS}) — local fallback unavailable"
fi

# ── Alert if any failures ─────────────────────────────────────────────────────
if [ "${#FAILURES[@]}" -gt 0 ]; then
  FAILURE_LIST=$(printf '%s\n' "${FAILURES[@]}")
  node -e "
    require('dotenv').config();
    const {send} = require('./src/services/email');
    send({
      to: process.env.ALERT_EMAIL || 'sunil@eskp.in',
      subject: '[eskp.in] Heartbeat alert — ${#FAILURES[@]} check(s) failed',
      text: 'Platform health check failed at ${TIMESTAMP}.\n\nFailed checks:\n${FAILURE_LIST}\n\nServer: $(hostname)'
    }).catch(console.error);
  " 2>/dev/null || true
  echo "[heartbeat ${TIMESTAMP}] ALERT: ${#FAILURES[@]} failure(s): ${FAILURE_LIST}"
  exit 1
fi

echo "[heartbeat ${TIMESTAMP}] OK: app=${APP_HEALTH}, pg=ready, nginx=${NGINX_STATUS}, disk=${DISK_PCT}%, ollama=${OLLAMA_STATUS}"
