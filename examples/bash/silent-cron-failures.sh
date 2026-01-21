#!/bin/bash
# Silent Cron Failures
# Problem: Cron job fails silently without producing error logs
# Solution: Explicit success confirmation with ping
# Documentation: https://deadmanping.com/silent-cron-failures

set -e
set -o pipefail

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your actual work
./backup.sh
./sync.sh

# Single ping at end - if job fails, ping won't arrive and DeadManPing will alert
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID"
