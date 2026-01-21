#!/bin/bash
# Detect Cron Job Partial Failure
# Problem: Multi-step job partially fails - some steps succeed, others fail
# Solution: Verify each step explicitly
# Documentation: https://deadmanping.com/detect-cron-job-partial-failure

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID
FAILED_STEPS=()

# Step 1: Backup database
if ! pg_dump mydb > /backups/db.sql; then
  FAILED_STEPS+=("database_backup")
fi

# Step 2: Sync files
if ! rsync -avz /data/ user@server:/backup/; then
  FAILED_STEPS+=("file_sync")
fi

# Step 3: Send report
if ! ./send-report.sh; then
  FAILED_STEPS+=("send_report")
fi

# Always ping with step completion data in payload
# In DeadManPing panel: set validation rule "failed_steps_count" == 0
# Panel will automatically detect if any steps failed
FAILED_STEPS_COUNT=${#FAILED_STEPS[@]}
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?failed_steps_count=$FAILED_STEPS_COUNT"
