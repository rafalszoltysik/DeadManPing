#!/usr/bin/env node
/**
 * Silent Cron Failures
 * Problem: Cron job fails silently without producing error logs
 * Solution: Explicit success confirmation with ping
 * Documentation: https://deadmanping.com/silent-cron-failures
 */

const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID

// Your actual work
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
