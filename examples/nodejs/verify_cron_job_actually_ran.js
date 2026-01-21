#!/usr/bin/env node
/**
 * Verify Cron Job Actually Ran
 * Problem: Cron job is scheduled but may not execute
 * Solution: Send explicit ping at start and end of job
 * Documentation: https://deadmanping.com/verify-cron-job-actually-ran
 */

const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID

// Your actual work
async function run() {
  await performBackup();
  
  // Single ping at end - if job fails, ping won't arrive and DeadManPing will alert
  https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}`, { method: 'POST' }).end();
}

run().catch((err) => {
  // If job fails, ping won't arrive - DeadManPing will detect missing ping
  process.exit(1);
});
