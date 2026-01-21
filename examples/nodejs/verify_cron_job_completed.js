#!/usr/bin/env node
/**
 * Verify Cron Job Completed
 * Problem: Job starts but may not complete successfully
 * Solution: Send explicit completion ping at end of script
 * Documentation: https://deadmanping.com/verify-cron-job-completed
 */

const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID

// Your work
async function run() {
  await performBackup();
  await syncData();
  
  // Single ping at end - if job fails, ping won't arrive and DeadManPing will alert
  https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}`, { method: 'POST' }).end();
}

run().catch((err) => {
  // If job fails, ping won't arrive - DeadManPing will detect missing ping
  process.exit(1);
});
