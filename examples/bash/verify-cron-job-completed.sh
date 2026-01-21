#!/bin/bash
# Verify Cron Job Completed
# Problem: Job starts but may not complete successfully
# Solution: Send explicit completion ping at end of script
# Documentation: https://deadmanping.com/verify-cron-job-completed

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your work
./backup.sh
./sync.sh

# Explicit completion ping
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID"
