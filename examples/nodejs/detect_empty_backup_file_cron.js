#!/usr/bin/env node
/**
 * Detect Empty Backup File Cron
 * Problem: Backup job completes but creates empty file
 * Solution: Send file size in payload, validate in DeadManPing panel
 * Documentation: https://deadmanping.com/detect-empty-backup-file-cron
 */

const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID
const backupFile = `/backups/db-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.sql`;

// Run backup
execSync(`pg_dump mydb > ${backupFile}`);

// Get file size
const stats = fs.statSync(backupFile);

// Always ping with file size in payload
// In DeadManPing panel: set validation rule "size" > 0 (or >= 1024 for minimum size)
// Panel will automatically detect if size is 0 or too small
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?size=${stats.size}`, { method: 'POST' }).end();
