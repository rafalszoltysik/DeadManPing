#!/usr/bin/env node
/**
 * Cron Job Not Executing
 * Problem: Cron job is scheduled but not executing
 * Solution: Send explicit ping when job executes
 * Documentation: https://deadmanping.com/cron-job-not-executing
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
