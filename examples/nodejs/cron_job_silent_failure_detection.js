#!/usr/bin/env node
/**
 * Cron Job Silent Failure Detection
 * Problem: Cron job fails silently without producing error logs
 * Solution: Always ping on success, missing ping indicates failure
 * Documentation: https://deadmanping.com/cron-job-silent-failure-detection
 */

const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID

// Your work
async function run() {
  await performWork();
  
  // Single ping at end - if job fails, ping won't arrive and DeadManPing will alert
  https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}`, { method: 'POST' }).end();
}

run().catch((err) => {
  // If job fails, ping won't arrive - DeadManPing will detect missing ping
  process.exit(1);
});
