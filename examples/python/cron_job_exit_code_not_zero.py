#!/usr/bin/env python3
"""
Cron Job Exit Code Not Zero
Problem: Cron job exits with non-zero exit code indicating failure
Solution: Check exit codes after running commands
Documentation: https://deadmanping.com/cron-job-exit-code-not-zero
"""

import subprocess
import requests
import sys

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run command and check exit code
result = subprocess.run(['./backup.sh'], capture_output=True)

# Single ping with exit code in payload
# In DeadManPing panel: set validation rule "exit_code" == 0
# Panel will automatically detect if exit code is non-zero and alert
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}?exit_code={result.returncode}")
