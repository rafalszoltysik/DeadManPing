#!/usr/bin/env python3
"""
Curl Returns 200 But Wrong Data
Problem: curl returns HTTP 200 but response contains error or wrong data
Solution: Validate response body content
Documentation: https://deadmanping.com/curl-returns-200-but-wrong-data
"""

import requests
import json
import sys

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

response = requests.get("https://api.example.com/data")

# Extract response data for payload
has_error = False
try:
    data = response.json()
    has_error = "error" in data
except json.JSONDecodeError:
    has_error = True  # Invalid JSON

# Single ping with response data in payload
# In DeadManPing panel: set validation rules:
#   - "status_code" == 200
#   - "has_error" == False
# Panel will automatically detect violations and alert
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}?status_code={response.status_code}&has_error={has_error}")
