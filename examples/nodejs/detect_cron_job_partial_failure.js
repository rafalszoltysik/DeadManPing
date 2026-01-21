#!/usr/bin/env node
/**
 * Detect Cron Job Partial Failure
 * Problem: Multi-step job partially fails - some steps succeed, others fail
 * Solution: Verify each step explicitly
 * Documentation: https://deadmanping.com/detect-cron-job-partial-failure
 */

const { execSync } = require('child_process');
const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID
const failedSteps = [];

// Step 1
try {
  execSync('pg_dump mydb > /backups/db.sql');
} catch {
  failedSteps.push('database_backup');
}

// Step 2
try {
  execSync('rsync -avz /data/ user@server:/backup/');
} catch {
  failedSteps.push('file_sync');
}

// Step 3
try {
  execSync('./send-report.sh');
} catch {
  failedSteps.push('send_report');
}

// Always ping with step completion data in payload
// In DeadManPing panel: set validation rule "failed_steps_count" == 0
// Panel will automatically detect if any steps failed
const failedStepsCount = failedSteps.length;
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?failed_steps_count=${failedStepsCount}`, { method: 'POST' }).end();
