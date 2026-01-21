#!/bin/bash
# Detect Empty Backup File
# Problem: Backup file is created but is zero bytes
# Solution: Send file size in payload, validate in DeadManPing panel
# Documentation: https://deadmanping.com/detect-empty-backup-file

set -e

BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql.gz"
MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run backup
pg_dump mydb | gzip > "$BACKUP_FILE"

# Get file size (0 if file doesn't exist)
FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo 0)

# Always ping with file size in payload
# In DeadManPing panel: set validation rules:
#   - "size" > 0 (to detect empty files)
#   - "size" >= 1048576 (1MB minimum, optional)
#   - "size" <= 10737418240 (10GB maximum, optional)
# Panel will automatically detect if size violates rules
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?size=$FILE_SIZE"
