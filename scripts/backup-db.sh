#!/bin/bash
# Database backup script
# Runs daily via cron. See SERVER_SETUP.md for crontab configuration.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -a
# shellcheck source=/dev/null
source "${PROJECT_DIR}/.env" 2>/dev/null || true
set +a

BACKUP_DIR="${HOME}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/platform_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Dump and compress
echo "[$(date)] Starting backup..."
docker exec platform-db pg_dump -U platform platform | gzip > "${BACKUP_FILE}"

# Verify the backup is not empty
if [ ! -s "${BACKUP_FILE}" ]; then
    echo "[$(date)] ERROR: Backup file is empty. Something went wrong."
    rm -f "${BACKUP_FILE}"
    exit 1
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date)] Backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Upload to Backblaze B2 (off-site backup)
if [ -n "${B2_KEY_ID:-}" ] && [ -n "${B2_APP_KEY:-}" ]; then
    echo "[$(date)] Uploading to Backblaze B2..."
    b2 account authorize "${B2_KEY_ID}" "${B2_APP_KEY}" > /dev/null 2>&1
    if b2 file upload "${B2_BUCKET}" "${BACKUP_FILE}" "backups/$(basename "${BACKUP_FILE}")" > /dev/null 2>&1; then
        echo "[$(date)] B2 upload complete: backups/$(basename "${BACKUP_FILE}")"
    else
        echo "[$(date)] ERROR: B2 upload failed. Local backup preserved."
    fi
else
    echo "[$(date)] SKIP: B2 credentials not set — local backup only."
fi

# Clean up old backups
DELETED=$(find "${BACKUP_DIR}" -name "platform_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "${DELETED}" -gt 0 ]; then
    echo "[$(date)] Cleaned up ${DELETED} backup(s) older than ${RETENTION_DAYS} days."
fi

echo "[$(date)] Backup process complete."
