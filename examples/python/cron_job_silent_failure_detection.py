#!/usr/bin/env python3
"""
Cron Job Silent Failure Detection
Problem: Cron job fails silently without producing error logs
Solution: Always ping on success, missing ping indicates failure
Documentation: https://deadmanping.com/cron-job-silent-failure-detection
"""

import requests

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your work
perform_work()

# Single ping at end - if job fails, ping won't arrive and DeadManPing will alert
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}")
