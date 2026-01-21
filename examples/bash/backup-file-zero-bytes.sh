#!/bin/bash
# Backup File Zero Bytes
# Problem: Backup file is created but is zero bytes
# Solution: Send file size in payload, validate in DeadManPing panel
# Documentation: https://deadmanping.com/backup-file-zero-bytes

set -e

BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql.gz"
MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run backup
pg_dump mydb | gzip > "$BACKUP_FILE"

# Get file size
FILE_SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || echo 0)

# Always ping with file size in payload
# In DeadManPing panel: set validation rule "size" > 0
# Panel will automatically detect if size is 0
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?size=$FILE_SIZE"
