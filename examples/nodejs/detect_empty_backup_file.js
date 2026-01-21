#!/usr/bin/env node
/**
 * Detect Empty Backup File
 * Problem: Backup file is created but is zero bytes
 * Solution: Send file size in payload, validate in DeadManPing panel
 * Documentation: https://deadmanping.com/detect-empty-backup-file
 */

const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID
const backupFile = '/backups/db-backup.sql.gz';

// Run backup
execSync(`pg_dump mydb | gzip > ${backupFile}`);

// Get file size (0 if file doesn't exist)
let fileSize = 0;
try {
  fileSize = fs.statSync(backupFile).size;
} catch (e) {
  // File doesn't exist
}

// Always ping with file size in payload
// In DeadManPing panel: set validation rules:
//   - "size" > 0 (to detect empty files)
//   - "size" >= 1024 (minimum size, optional)
// Panel will automatically detect if size violates rules
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?size=${fileSize}`, { method: 'POST' }).end();
