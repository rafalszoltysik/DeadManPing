#!/bin/bash
# Detect Empty Backup File Cron
# Problem: Backup job completes but creates empty file
# Solution: Send file size in payload, validate in DeadManPing panel
# Documentation: https://deadmanping.com/detect-empty-backup-file-cron

set -e

BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql"
MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run backup
pg_dump mydb > "$BACKUP_FILE"

# Get file size
FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")

# Always ping with file size in payload
# In DeadManPing panel: set validation rule "size" > 0 (or >= 1024 for minimum size)
# Panel will automatically detect if size is 0 or too small
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?size=$FILE_SIZE"
