#!/bin/bash
# Detect Backup File Missing
# Problem: Backup job completes but backup file is missing
# Solution: Verify backup file exists after backup creation
# Documentation: https://deadmanping.com/detect-backup-file-missing

set -e

BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql.gz"
MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run backup
pg_dump mydb | gzip > "$BACKUP_FILE"

# Get file data
FILE_EXISTS=0
FILE_SIZE=0
if [ -f "$BACKUP_FILE" ]; then
  FILE_EXISTS=1
  FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
fi

# Always ping with file data in payload
# In DeadManPing panel: set validation rules:
#   - "file_exists" == 1
#   - "size" > 0
# Panel will automatically detect if file is missing or empty
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?file_exists=$FILE_EXISTS&size=$FILE_SIZE"
