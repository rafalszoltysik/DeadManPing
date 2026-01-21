#!/usr/bin/env python3
"""
Verify Cron Job Completed
Problem: Job starts but may not complete successfully
Solution: Send explicit completion ping at end of script
Documentation: https://deadmanping.com/verify-cron-job-completed
"""

import requests

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your work
perform_backup()
sync_data()

# Explicit completion ping
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}")
