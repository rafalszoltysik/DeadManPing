#!/bin/bash
# Cron Job Silent Failure Detection
# Problem: Cron job fails silently without producing error logs
# Solution: Always ping on success, missing ping indicates failure
# Documentation: https://deadmanping.com/cron-job-silent-failure-detection

set -e
set -o pipefail

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your work
./process.sh

# Single ping at end - if job fails, ping won't arrive and DeadManPing will alert
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID"
