#!/usr/bin/env node
/**
 * Verify Backup File Size
 * Problem: Backup completes but file size is wrong (too small or too large)
 * Solution: Send file size in payload, validate in DeadManPing panel
 * Documentation: https://deadmanping.com/verify-backup-file-size
 */

const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID
const backupFile = '/backups/db-backup.sql.gz';

// Run backup
execSync(`pg_dump mydb | gzip > ${backupFile}`);

// Get file size
const stats = fs.statSync(backupFile);

// Always ping with file size in payload
// In DeadManPing panel: set validation rules:
//   - "size" >= 1048576 (1MB minimum)
//   - "size" <= 10737418240 (10GB maximum)
// Panel will automatically detect if size is outside range
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?size=${stats.size}`, { method: 'POST' }).end();
