#!/usr/bin/env python3
"""
Cron Job Exit Status Check
Problem: Need to verify job completed with correct exit status
Solution: Check exit status after running commands
Documentation: https://deadmanping.com/cron-job-exit-status-check
"""

import subprocess
import requests
import sys

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run command
result = subprocess.run(['./backup.sh'])

# Check exit status
# Single ping with exit status in payload
# In DeadManPing panel: set validation rule "exit_status" == 0
# Panel will automatically detect if exit status is non-zero and alert
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}?exit_status={result.returncode}")
