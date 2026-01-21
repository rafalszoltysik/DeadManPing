#!/bin/bash
# Curl Returns 200 But Wrong Data
# Problem: curl returns HTTP 200 but response contains error or wrong data
# Solution: Validate response body content
# Documentation: https://deadmanping.com/curl-returns-200-but-wrong-data

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Make API call
RESPONSE=$(curl -s -w "\n%{http_code}" "https://api.example.com/data")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Extract response validation data
HAS_ERROR=0
if echo "$BODY" | grep -q '"error"'; then
  HAS_ERROR=1
fi

# Single ping with response data in payload
# In DeadManPing panel: set validation rules:
#   - "status_code" == 200
#   - "has_error" == 0
# Panel will automatically detect violations and alert
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?status_code=$HTTP_CODE&has_error=$HAS_ERROR"
