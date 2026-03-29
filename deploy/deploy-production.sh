#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="/home/openclawops/services/blowmu-prod/docker-compose.yml"
PROJECT_DIR="/home/openclawops/services/blowmu-prod"
LOG_FILE="/home/openclawops/services/blowmu-prod/.last_deploy.log"
STAMP_FILE="/home/openclawops/services/blowmu-prod/.deploy_id"

mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date -Is)] Starting production deploy" | tee -a "$LOG_FILE"
sudo docker compose -f "$COMPOSE_FILE" up -d --build 2>&1 | tee -a "$LOG_FILE"
echo "[$(date -Is)] Services status:" | tee -a "$LOG_FILE"
sudo docker compose -f "$COMPOSE_FILE" ps 2>&1 | tee -a "$LOG_FILE"
date -Is > "$STAMP_FILE"
echo "[$(date -Is)] Production deploy finished" | tee -a "$LOG_FILE"
