#!/usr/bin/env python3
"""
Verify Backup File Size
Problem: Backup completes but file size is wrong (too small or too large)
Solution: Send file size in payload, validate in DeadManPing panel
Documentation: https://deadmanping.com/verify-backup-file-size
"""

import os
import subprocess
import requests

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID
backup_file = "/backups/db-backup.sql.gz"

# Run backup
subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file.replace('.gz', ''), "w"))
subprocess.run(["gzip", backup_file.replace('.gz', '')])

# Get current file size
current_size = os.path.getsize(backup_file)

# Always ping with file size in payload
# In DeadManPing panel: set validation rules:
#   - "size" >= 1048576 (1MB minimum)
#   - "size" <= 10737418240 (10GB maximum)
# Panel will automatically detect if size is outside range
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}?size={current_size}")
