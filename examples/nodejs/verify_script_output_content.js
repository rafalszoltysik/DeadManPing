#!/usr/bin/env node
/**
 * Verify Script Output Content
 * Problem: Script runs successfully but output is missing or wrong
 * Solution: Validate output content after script execution
 * Documentation: https://deadmanping.com/verify-script-output-content
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
let hasStatusField = false;

if (fileExists) {
  const content = fs.readFileSync(outputFile, 'utf8');
  hasStatusField = content.includes('"status": "success"');
}

// Always ping with output data in payload
// In DeadManPing panel: set validation rules:
//   - "file_exists" == true
//   - "has_status_field" == true
// Panel will automatically detect if output is invalid
https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?file_exists=${fileExists}&has_status_field=${hasStatusField}`, { method: 'POST' }).end();
