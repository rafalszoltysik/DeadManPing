#!/usr/bin/env node
/**
 * Verify Cron Output
 * Problem: Script runs successfully but output is missing or wrong
 * Solution: Validate output content after script execution
 * Documentation: https://deadmanping.com/verify-cron-output
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID

// Run script
execSync('./process-data.sh');

// Get output file data
const outputFile = '/output/processed-data.json';
let fileExists = fs.existsSync(outputFile);
let lineCount = 0;
let hasStatusField = false;

if (fileExists) {
  const content = fs.readFileSync(outputFile, 'utf8');
  lineCount = content.split('\n').length;
  hasStatusField = content.includes('"status": "success"');
}

// Always ping with output data in payload
// In DeadManPing panel: set validation rules:
//   - "file_exists" == true
//   - "line_count" >= 10
//   - "has_status_field" == true
// Panel will automatically detect if output is invalid
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?file_exists=${fileExists}&line_count=${lineCount}&has_status_field=${hasStatusField}`, { method: 'POST' }).end();
