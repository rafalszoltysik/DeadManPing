#!/usr/bin/env python3
"""
Silent Cron Failures
Problem: Cron job fails silently without producing error logs
Solution: Explicit success confirmation with ping
Documentation: https://deadmanping.com/silent-cron-failures
"""

import requests
import sys

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Your actual work
perform_backup()
sync_data()

# Single ping at end - if job fails, ping won't arrive and DeadManPing will alert
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}")
