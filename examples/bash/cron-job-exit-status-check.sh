#!/bin/bash
# Cron Job Exit Status Check
# Problem: Need to verify job completed with correct exit status
# Solution: Check exit status after running commands
# Documentation: https://deadmanping.com/cron-job-exit-status-check

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run command
./backup.sh
EXIT_STATUS=$?

# Check exit status
# Single ping with exit status in payload
# In DeadManPing panel: set validation rule "exit_status" == 0
# Panel will automatically detect if exit status is non-zero and alert
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?exit_status=$EXIT_STATUS"
