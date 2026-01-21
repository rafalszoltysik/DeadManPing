#!/bin/bash
# Verify Cron Job Actually Ran
# Problem: Cron job is scheduled but may not execute
# Solution: Send explicit ping when job completes successfully
# Documentation: https://deadmanping.com/verify-cron-job-actually-ran

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your actual work
./backup.sh
./sync.sh

# Ping on success - if this doesn't arrive, DeadManPing will alert
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID"
