#!/usr/bin/env node
/**
 * Cron Job Returns Success But Fails
 * Problem: Script exits with code 0 but doesn't actually complete work
 * Solution: Send result data in payload, validate in DeadManPing panel
 * Documentation: https://deadmanping.com/cron-job-returns-success-but-fails
 */

const { execSync } = require('child_process');
const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID

// Query might succeed but return no rows
const output = execSync('psql -c "SELECT COUNT(*) FROM users"', { encoding: 'utf8' });

// Parse count from output
const match = output.match(/(\d+)/);
const count = match ? parseInt(match[1]) : 0;

// Always ping with count in payload
// In DeadManPing panel: set validation rules:
//   - "count" > 0 (to detect empty results)
//   - "count" >= 10 (minimum expected count, optional)
// Panel will automatically detect if count violates rules
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?count=${count}`, { method: 'POST' }).end();
