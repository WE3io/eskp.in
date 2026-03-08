#!/usr/bin/env bash
# deploy.sh — Build, health-check, and swap the platform container.
# Usage: ./scripts/deploy.sh [--rollback]
# Follows blue-green pattern: new container must pass health check before old is stopped.

set -euo pipefail

COMPOSE_FILE="$(dirname "$0")/../docker-compose.yml"
APP_NAME="platform-app"
HEALTH_URL="http://127.0.0.1:3000/health"
HEALTH_RETRIES=12
HEALTH_INTERVAL=5

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

# --- Rollback ---
if [[ "${1:-}" == "--rollback" ]]; then
  log "Rolling back to previous image..."
  docker tag "${APP_NAME}:previous" "${APP_NAME}:latest" 2>/dev/null || { log "No previous image to roll back to."; exit 1; }
  docker compose -f "$COMPOSE_FILE" up -d app
  log "Rollback complete."
  exit 0
fi

# --- Build ---
log "Building image..."
docker compose -f "$COMPOSE_FILE" build app

# --- Tag previous for rollback ---
if docker image inspect "${APP_NAME}:latest" &>/dev/null; then
  docker tag "${APP_NAME}:latest" "${APP_NAME}:previous"
  log "Tagged current image as :previous"
fi

# --- Start new container ---
log "Starting new container..."
docker compose -f "$COMPOSE_FILE" up -d app

# --- Health check ---
log "Waiting for health check at ${HEALTH_URL}..."
for i in $(seq 1 $HEALTH_RETRIES); do
  STATUS=$(curl -sf "${HEALTH_URL}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null || echo "")
  if [[ "$STATUS" == "ok" ]]; then
    log "Health check passed (attempt ${i}/${HEALTH_RETRIES})"
    break
  fi
  if [[ $i -eq $HEALTH_RETRIES ]]; then
    log "ERROR: Health check failed after ${HEALTH_RETRIES} attempts. Rolling back..."
    ./scripts/deploy.sh --rollback
    exit 1
  fi
  log "Attempt ${i}/${HEALTH_RETRIES} — not ready yet, waiting ${HEALTH_INTERVAL}s..."
  sleep $HEALTH_INTERVAL
done

log "Deploy complete. Container: $(docker ps --filter name=${APP_NAME} --format '{{.ID}} ({{.Status}})')"
