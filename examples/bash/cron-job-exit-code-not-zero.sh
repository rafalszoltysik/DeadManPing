#!/bin/bash
# Cron Job Exit Code Not Zero
# Problem: Cron job exits with non-zero exit code indicating failure
# Solution: Check exit codes after running commands
# Documentation: https://deadmanping.com/cron-job-exit-code-not-zero

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run command and capture exit code
./backup.sh
EXIT_CODE=$?

# Check exit code
# Single ping with exit code in payload
# In DeadManPing panel: set validation rule "exit_code" == 0
# Panel will automatically detect if exit code is non-zero and alert
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?exit_code=$EXIT_CODE"
