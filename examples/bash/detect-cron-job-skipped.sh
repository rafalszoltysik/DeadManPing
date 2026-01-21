#!/bin/bash
# Detect Cron Job Skipped
# Problem: Cron job should run but is being skipped
# Solution: Send explicit ping when job completes successfully
# Documentation: https://deadmanping.com/detect-cron-job-skipped

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your work
./backup.sh

# Ping on success - if this doesn't arrive, DeadManPing will alert
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID"
