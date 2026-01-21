# Node.js Examples

JavaScript/Node.js scripts for monitoring cron jobs with DeadManPing.

## Quick Start

1. No dependencies required - uses built-in Node.js modules
2. Replace `YOUR_MONITOR_ID` in each script with your actual monitor ID from [deadmanping.com](https://deadmanping.com?utm_source=github&utm_medium=referral&utm_campaign=examples)
3. Make script executable: `chmod +x script.js`
4. Add to crontab: `0 3 * * * /usr/bin/node /path/to/script.js`

## Examples

### Basic Monitoring

- **[detect_empty_backup_file_cron.js](./detect_empty_backup_file_cron.js)** - Detect when backup files are empty
- **[verify_cron_job_actually_ran.js](./verify_cron_job_actually_ran.js)** - Verify job execution with timestamps
- **[verify_cron_job_completed.js](./verify_cron_job_completed.js)** - Confirm job finished successfully

### Error Detection

- **[cron_job_exit_code_not_zero.js](./cron_job_exit_code_not_zero.js)** - Check exit codes
- **[cron_job_exit_status_check.js](./cron_job_exit_status_check.js)** - Verify exit status
- **[detect_cron_job_wrong_exit_code.js](./detect_cron_job_wrong_exit_code.js)** - Detect false success

### Silent Failures

- **[silent_cron_failures.js](./silent_cron_failures.js)** - Detect silent failures with process handlers
- **[cron_job_silent_failure_detection.js](./cron_job_silent_failure_detection.js)** - Always ping on success

### Backup Monitoring

- **[detect_empty_backup_file.js](./detect_empty_backup_file.js)** - Check backup file size
- **[detect_backup_file_missing.js](./detect_backup_file_missing.js)** - Verify backup file exists
- **[backup_file_zero_bytes.js](./backup_file_zero_bytes.js)** - Detect zero-byte backups
- **[verify_backup_file_size.js](./verify_backup_file_size.js)** - Validate file size ranges

### API Response Validation

- **[curl_success_but_wrong_response.js](./curl_success_but_wrong_response.js)** - Validate API responses
- **[curl_returns_200_but_wrong_data.js](./curl_returns_200_but_wrong_data.js)** - Check response body content

### Output Validation

- **[verify_cron_output.js](./verify_cron_output.js)** - Validate script output
- **[verify_script_output_content.js](./verify_script_output_content.js)** - Check output content

### Advanced

- **[detect_cron_job_partial_failure.js](./detect_cron_job_partial_failure.js)** - Verify multi-step jobs
- **[cron_job_returns_success_but_fails.js](./cron_job_returns_success_but_fails.js)** - Validate results
- **[cron_job_not_executing.js](./cron_job_not_executing.js)** - Detect non-execution
- **[detect_cron_job_skipped.js](./detect_cron_job_skipped.js)** - Catch skipped jobs

## Best Practices

1. **Use process handlers** - `process.on('exit')` and `process.on('uncaughtException')` to catch failures
2. **Check results** - Don't just trust exit codes, verify actual results
3. **Handle async errors** - Use `.catch()` for async functions
4. **Use try-catch** - Wrap execSync in try-catch to handle exit codes
5. **Validate JSON** - Always validate JSON responses before using

## Dependencies

All examples use only built-in Node.js modules:
- `fs` - File system operations
- `child_process` - Running shell commands
- `https` - HTTP requests

No `npm install` required!

## Documentation

See [deadmanping.com](https://deadmanping.com?utm_source=github&utm_medium=referral&utm_campaign=examples) for detailed documentation on each problem and solution.
