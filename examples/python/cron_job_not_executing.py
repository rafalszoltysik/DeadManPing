#!/usr/bin/env python3
"""
Cron Job Not Executing
Problem: Cron job is scheduled but not executing
Solution: Send explicit ping when job completes successfully
Documentation: https://deadmanping.com/cron-job-not-executing
"""

import requests

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your actual work
perform_backup()

# Ping on success - if this doesn't arrive, DeadManPing will alert
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}")
