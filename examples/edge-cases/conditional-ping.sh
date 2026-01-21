#!/bin/bash
# Conditional Ping Example
# Problem: Only ping on certain conditions (e.g., if data changed)
# Solution: Check conditions before pinging
# Documentation: https://deadmanping.com/monitor-cron-jobs

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run sync
rsync -avz /data/ user@server:/backup/

# Check if files were actually synced (rsync returns 0 even if nothing changed)
SYNC_OUTPUT=$(rsync -avz /data/ user@server:/backup/ 2>&1)
CHANGED_FILES=$(echo "$SYNC_OUTPUT" | grep -c ">" || true)

# Single ping with changed files count in payload
# In DeadManPing panel: set validation rule "files" >= 0 (or > 0 if you want to alert on no changes)
# Panel will automatically detect violations and alert
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?files=$CHANGED_FILES"
