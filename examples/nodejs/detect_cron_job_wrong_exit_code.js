#!/usr/bin/env node
/**
 * Detect Cron Job Wrong Exit Code
 * Problem: Script returns exit code 0 when it should fail, or non-zero when it should succeed
 * Solution: Send result data in payload, validate in DeadManPing panel
 * Documentation: https://deadmanping.com/detect-cron-job-wrong-exit-code
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID
const backupFile = '/backups/db.sql';

// Run backup
try {
  execSync('pg_dump mydb > ' + backupFile);
} catch (error) {
  // If backup fails, exit - ping won't arrive, DeadManPing will alert
  process.exit(error.status || 1);
}

// Get backup file size (0 if file doesn't exist or is empty)
let fileSize = 0;
try {
  fileSize = fs.statSync(backupFile).size;
} catch (e) {
  // File doesn't exist
}

// Always ping with file size in payload
// In DeadManPing panel: set validation rule "size" > 0
// Panel will automatically detect if backup file is empty even though exit code was 0
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?size=${fileSize}`, { method: 'POST' }).end();
