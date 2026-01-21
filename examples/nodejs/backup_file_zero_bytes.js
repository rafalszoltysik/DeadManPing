#!/usr/bin/env node
/**
 * Backup File Zero Bytes
 * Problem: Backup file is created but is zero bytes
 * Solution: Send file size in payload, validate in DeadManPing panel
 * Documentation: https://deadmanping.com/backup-file-zero-bytes
 */

const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID
const backupFile = '/backups/db-backup.sql.gz';

// Run backup
execSync('pg_dump mydb | gzip > ' + backupFile);

// Get file size
let fileSize = 0;
try {
  fileSize = fs.statSync(backupFile).size;
} catch (e) {
  // File doesn't exist
}

// Always ping with file size in payload
// In DeadManPing panel: set validation rule "size" > 0
// Panel will automatically detect if size is 0
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?size=${fileSize}`, { method: 'POST' }).end();
