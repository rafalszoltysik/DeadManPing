#!/usr/bin/env python3
"""
Verify Script Output Content
Problem: Script runs successfully but output is missing or wrong
Solution: Validate output content after script execution
Documentation: https://deadmanping.com/verify-script-output-content
"""

import subprocess
import json
import requests
import sys

MONITOR_ID = "YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run script and capture output
result = subprocess.run(['./api-fetch.sh'], capture_output=True, text=True)
output = result.stdout

# Parse output and extract data for payload
is_valid_json = True
has_required_fields = False

try:
    data = json.loads(output)
    required_fields = ['status', 'data', 'timestamp']
    has_required_fields = all(field in data for field in required_fields)
except json.JSONDecodeError:
    is_valid_json = False

# Always ping with output validation data in payload
# In DeadManPing panel: set validation rules:
#   - "is_valid_json" == True
#   - "has_required_fields" == True
# Panel will automatically detect if output is invalid
requests.post(f"https://deadmanping.com/api/ping/{MONITOR_ID}?is_valid_json={is_valid_json}&has_required_fields={has_required_fields}")
