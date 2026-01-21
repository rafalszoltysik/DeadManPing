#!/usr/bin/env python3
"""
Detect Cron Job Partial Failure
Problem: Multi-step job partially fails - some steps succeed, others fail
Solution: Verify each step explicitly
Documentation: https://deadmanping.com/detect-cron-job-partial-failure
"""

import subprocess
import requests
import sys

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

failed_steps = []

# Step 1
if subprocess.run(['pg_dump', 'mydb'], stdout=open('/backups/db.sql', 'w')).returncode != 0:
    failed_steps.append('database_backup')

# Step 2
if subprocess.run(['rsync', '-avz', '/data/', 'user@server:/backup/']).returncode != 0:
    failed_steps.append('file_sync')

# Step 3
if subprocess.run(['./send-report.sh']).returncode != 0:
    failed_steps.append('send_report')

# Always ping with step completion data in payload
# In DeadManPing panel: set validation rule "failed_steps_count" == 0
# Panel will automatically detect if any steps failed
failed_steps_count = len(failed_steps)
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}?failed_steps_count={failed_steps_count}")
