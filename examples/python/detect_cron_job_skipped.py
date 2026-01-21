#!/usr/bin/env python3
"""
Detect Cron Job Skipped
Problem: Cron job should run but is being skipped
Solution: Send explicit ping when job completes successfully
Documentation: https://deadmanping.com/detect-cron-job-skipped
"""

import requests

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your work
perform_backup()

# Ping on success - if this doesn't arrive, DeadManPing will alert
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}")
