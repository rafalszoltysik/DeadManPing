#!/usr/bin/env node
/**
 * Curl Success But Wrong Response
 * Problem: curl returns HTTP 200 but response body contains error
 * Solution: Validate response body content, not just HTTP status
 * Documentation: https://deadmanping.com/curl-success-but-wrong-response
 */

const https = require('https');

const MONITOR_ID = 'YOUR_MONITOR_ID';  // Replace with your actual monitor ID

https.get('https://api.example.com/data', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // Always ping with response data in payload
    // In DeadManPing panel: set validation rules:
    //   - "status_code" == 200
    //   - "has_error" == false (if error field exists in response)
    // Panel will automatically detect if status code is wrong or response has errors
    
    let hasError = false;
    try {
      const json = JSON.parse(data);
      hasError = !!json.error;
    } catch (e) {
      // Invalid JSON - could send status_code=200&has_error=true or handle differently
    }
    
    // Single ping with response data in payload
    // In DeadManPing panel: set validation rules:
    //   - "status_code" == 200
    //   - "has_error" == false
    // Panel will automatically detect violations and alert
    https.request(`https://deadmanping.com/api/ping/${MONITOR_ID}?status_code=${res.statusCode}&has_error=${hasError}`, { method: 'POST' }).end();
  });
});
