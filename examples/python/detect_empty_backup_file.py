#!/usr/bin/env python3
"""
Detect Empty Backup File
Problem: Backup file is created but is zero bytes
Solution: Send file size in payload, validate in DeadManPing panel
Documentation: https://deadmanping.com/detect-empty-backup-file
"""

import os
import subprocess
import requests

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID
backup_file = "/backups/db-backup.sql.gz"

# Run backup
subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file.replace('.gz', ''), "w"))
subprocess.run(["gzip", backup_file.replace('.gz', '')])

# Get file size (0 if file doesn't exist)
file_size = os.path.getsize(backup_file) if os.path.exists(backup_file) else 0

# Always ping with file size in payload
# In DeadManPing panel: set validation rules:
#   - "size" > 0 (to detect empty files)
#   - "size" >= 1024 (minimum size, optional)
# Panel will automatically detect if size violates rules
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}?size={file_size}")
