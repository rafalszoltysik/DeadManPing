#!/usr/bin/env node
/**
 * Detect Backup File Missing
 * Problem: Backup job completes but backup file is missing
 * Solution: Verify backup file exists after backup creation
 * Documentation: https://deadmanping.com/detect-backup-file-missing
 */

const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID
const backupFile = '/backups/db-backup.sql.gz';

// Run backup
execSync('pg_dump mydb | gzip > ' + backupFile);

// Get file data
let fileExists = fs.existsSync(backupFile);
let fileSize = 0;
if (fileExists) {
  fileSize = fs.statSync(backupFile).size;
}

// Always ping with file data in payload
// In DeadManPing panel: set validation rules:
//   - "file_exists" == true
//   - "size" > 0
// Panel will automatically detect if file is missing or empty
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?file_exists=${fileExists}&size=${fileSize}`, { method: 'POST' }).end();
