#!/bin/bash
# Docker Cron Example
# Problem: Running cron jobs inside Docker containers
# Solution: Use same monitoring approach, container just needs network access
# Documentation: https://deadmanping.com/monitor-cron-jobs

set -e

MONITOR_ID="YOUR_MONITOR_ID"  # Replace with your actual monitor ID

# Run Docker container with cron job
docker run --rm your-backup-image

# Ping after container completes
# Note: This runs on the host, not inside container
# For container-internal monitoring, add ping inside container's entrypoint script
curl -X POST "https://deadmanping.com/api/ping/$MONITOR_ID"
