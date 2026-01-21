#!/usr/bin/env python3
"""
Detect Backup File Missing
Problem: Backup job completes but backup file is missing
Solution: Verify backup file exists after backup creation
Documentation: https://deadmanping.com/detect-backup-file-missing
"""

import os
import subprocess
import requests
import sys

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID
backup_file = "/backups/db-backup.sql.gz"

# Run backup
subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file.replace('.gz', ''), "w"))
subprocess.run(["gzip", backup_file.replace('.gz', '')])

# Get file data
file_exists = os.path.exists(backup_file)
file_size = os.path.getsize(backup_file) if file_exists else 0

# Always ping with file data in payload
# In DeadManPing panel: set validation rules:
#   - "file_exists" == True
#   - "size" > 0
# Panel will automatically detect if file is missing or empty
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}?file_exists={file_exists}&size={file_size}")
