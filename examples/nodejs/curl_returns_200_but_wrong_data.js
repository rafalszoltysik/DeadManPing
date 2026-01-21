#!/usr/bin/env node
/**
 * Curl Returns 200 But Wrong Data
 * Problem: curl returns HTTP 200 but response contains error or wrong data
 * Solution: Validate response body content
 * Documentation: https://deadmanping.com/curl-returns-200-but-wrong-data
 */

const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID

https.get('https://api.example.com/data', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // Extract response data for payload
    let hasError = false;
    try {
      const json = JSON.parse(data);
      hasError = !!json.error;
    } catch (e) {
      // Invalid JSON
    }
    
    // Single ping with response data in payload
    // In DeadManPing panel: set validation rules:
    //   - "status_code" == 200
    //   - "has_error" == false
    // Panel will automatically detect violations and alert
    https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?status_code=${res.statusCode}&has_error=${hasError}`, { method: 'POST' }).end();
  });
});
