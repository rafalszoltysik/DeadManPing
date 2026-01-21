#!/bin/bash
# Cron Job Not Executing
# Problem: Cron job is scheduled but not executing
# Solution: Send explicit ping when job completes successfully
# Documentation: https://deadmanping.com/cron-job-not-executing

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your actual work
./backup.sh

# Ping on success - if this doesn't arrive, DeadManPing will alert
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID"
