#!/usr/bin/env python3
"""
Verify Cron Job Actually Ran
Problem: Cron job is scheduled but may not execute
Solution: Send explicit ping when job completes successfully
Documentation: https://deadmanping.com/verify-cron-job-actually-ran
"""

import requests

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your actual work
perform_backup()

# Ping on success - if this doesn't arrive, DeadManPing will alert
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}")
