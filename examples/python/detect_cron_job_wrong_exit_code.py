#!/usr/bin/env python3
"""
Detect Cron Job Wrong Exit Code
Problem: Script returns exit code 0 when it should fail, or non-zero when it should succeed
Solution: Send result data in payload, validate in DeadManPing panel
Documentation: https://deadmanping.com/detect-cron-job-wrong-exit-code
"""

import subprocess
import os
import requests

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID
backup_file = "/backups/db.sql"

# Run backup
subprocess.run(['pg_dump', 'mydb'], stdout=open(backup_file, 'w'))

# Get backup file size (0 if file doesn't exist or is empty)
file_size = os.path.getsize(backup_file) if os.path.exists(backup_file) else 0

# Always ping with file size in payload
# In DeadManPing panel: set validation rule "size" > 0
# Panel will automatically detect if backup file is empty even though exit code was 0
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}?size={file_size}")
