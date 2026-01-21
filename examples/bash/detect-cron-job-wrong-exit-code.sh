#!/bin/bash
# Detect Cron Job Wrong Exit Code
# Problem: Script returns exit code 0 when it should fail, or non-zero when it should succeed
# Solution: Send result data in payload, validate in DeadManPing panel
# Documentation: https://deadmanping.com/detect-cron-job-wrong-exit-code

set -e

BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql"
MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run backup
pg_dump mydb > "$BACKUP_FILE"

# Get backup file size (0 if file doesn't exist or is empty)
FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo 0)

# Always ping with file size in payload
# In DeadManPing panel: set validation rule "size" > 0
# Panel will automatically detect if backup file is empty even though exit code was 0
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?size=$FILE_SIZE"
