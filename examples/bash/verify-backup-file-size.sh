#!/bin/bash
# Verify Backup File Size
# Problem: Backup completes but file size is wrong (too small or too large)
# Solution: Send file size in payload, validate in DeadManPing panel
# Documentation: https://deadmanping.com/verify-backup-file-size

set -e

BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql.gz"
MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run backup
pg_dump mydb | gzip > "$BACKUP_FILE"

# Get file size
FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")

# Always ping with file size in payload
# In DeadManPing panel: set validation rules:
#   - "size" >= 1048576 (1MB minimum)
#   - "size" <= 10737418240 (10GB maximum)
# Panel will automatically detect if size is outside range
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?size=$FILE_SIZE"
