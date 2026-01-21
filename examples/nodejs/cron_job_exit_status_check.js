#!/usr/bin/env node
/**
 * Cron Job Exit Status Check
 * Problem: Need to verify job completed with correct exit status
 * Solution: Check exit status after running commands
 * Documentation: https://deadmanping.com/cron-job-exit-status-check
 */

const { execSync } = require('child_process');
const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID

let exitStatus = 0;
try {
  // execSync throws on non-zero exit code
  execSync('./backup.sh', { stdio: 'inherit' });
} catch (error) {
  exitStatus = error.status || 1;
}

// Single ping with exit status in payload
// In DeadManPing panel: set validation rule "exit_status" == 0
// Panel will automatically detect if exit status is non-zero and alert
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?exit_status=${exitStatus}`, { method: 'POST' }).end();
