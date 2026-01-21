#!/usr/bin/env python3
"""
Detect Empty Backup File Cron
Problem: Backup job completes but creates empty file
Solution: Send file size in payload, validate in DeadManPing panel
Documentation: https://deadmanping.com/detect-empty-backup-file-cron
"""

import os
import subprocess
import requests
from datetime import datetime

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID
backup_file = f"/backups/db-{datetime.now().strftime('%Y%m%d')}.sql"

# Run backup
subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file, "w"))

# Get file size
file_size = os.path.getsize(backup_file) if os.path.exists(backup_file) else 0

# Always ping with file size in payload
# In DeadManPing panel: set validation rule "size" > 0 (or >= 1024 for minimum size)
# Panel will automatically detect if size is 0 or too small
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}?size={file_size}")
