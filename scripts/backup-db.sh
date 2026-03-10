#!/bin/bash
# Database backup script
# Runs daily via cron. See SERVER_SETUP.md for crontab configuration.

set -euo pipefail

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

# Clean up old backups
DELETED=$(find "${BACKUP_DIR}" -name "platform_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "${DELETED}" -gt 0 ]; then
    echo "[$(date)] Cleaned up ${DELETED} backup(s) older than ${RETENTION_DAYS} days."
fi

echo "[$(date)] Backup process complete."
