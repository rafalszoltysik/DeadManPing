#!/bin/bash
# Verify Cron Output
# Problem: Script runs successfully but output is missing or wrong
# Solution: Validate output content after script execution
# Documentation: https://deadmanping.com/verify-cron-output

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run script and capture output
OUTPUT=$(./generate-report.sh)

# Get output validation data
HAS_EXPECTED_CONTENT=0
OUTPUT_LENGTH=${#OUTPUT}
if echo "$OUTPUT" | grep -q "Report generated successfully"; then
  HAS_EXPECTED_CONTENT=1
fi

# Always ping with output validation data in payload
# In DeadManPing panel: set validation rules:
#   - "has_expected_content" == 1
#   - "output_length" > 0
# Panel will automatically detect if output is invalid
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID?has_expected_content=$HAS_EXPECTED_CONTENT&output_length=$OUTPUT_LENGTH"
