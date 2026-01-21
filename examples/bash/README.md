# Bash Examples

Shell scripts for monitoring cron jobs with DeadManPing on Linux/Unix systems.

## Quick Start

1. Replace `YOUR_MONITOR_ID` in each script with your actual monitor ID from [deadmanping.com](https://deadmanping.com?utm_source=github&utm_medium=referral&utm_campaign=examples)
2. Make script executable: `chmod +x script.sh`
3. Add to crontab: `0 3 * * * /path/to/script.sh`

## Examples

### Basic Monitoring

- **[detect-empty-backup-file-cron.sh](./detect-empty-backup-file-cron.sh)** - Detect when backup files are empty
- **[verify-cron-job-actually-ran.sh](./verify-cron-job-actually-ran.sh)** - Verify job execution with start/end pings
- **[verify-cron-job-completed.sh](./verify-cron-job-completed.sh)** - Confirm job finished successfully

### Error Detection

- **[cron-job-exit-code-not-zero.sh](./cron-job-exit-code-not-zero.sh)** - Check exit codes
- **[cron-job-exit-status-check.sh](./cron-job-exit-status-check.sh)** - Verify exit status
- **[detect-cron-job-wrong-exit-code.sh](./detect-cron-job-wrong-exit-code.sh)** - Detect false success

### Silent Failures

- **[silent-cron-failures.sh](./silent-cron-failures.sh)** - Detect silent failures with trap
- **[cron-job-silent-failure-detection.sh](./cron-job-silent-failure-detection.sh)** - Always ping on success

### Backup Monitoring

- **[detect-empty-backup-file.sh](./detect-empty-backup-file.sh)** - Check backup file size
- **[detect-backup-file-missing.sh](./detect-backup-file-missing.sh)** - Verify backup file exists
- **[backup-file-zero-bytes.sh](./backup-file-zero-bytes.sh)** - Detect zero-byte backups
- **[verify-backup-file-size.sh](./verify-backup-file-size.sh)** - Validate file size ranges

### API Response Validation

- **[curl-success-but-wrong-response.sh](./curl-success-but-wrong-response.sh)** - Validate API responses
- **[curl-returns-200-but-wrong-data.sh](./curl-returns-200-but-wrong-data.sh)** - Check response body content

### Output Validation

- **[verify-cron-output.sh](./verify-cron-output.sh)** - Validate script output
- **[verify-script-output-content.sh](./verify-script-output-content.sh)** - Check output content

### Advanced

- **[detect-cron-job-partial-failure.sh](./detect-cron-job-partial-failure.sh)** - Verify multi-step jobs
- **[cron-job-returns-success-but-fails.sh](./cron-job-returns-success-but-fails.sh)** - Validate results
- **[cron-job-not-executing.sh](./cron-job-not-executing.sh)** - Detect non-execution
- **[detect-cron-job-skipped.sh](./detect-cron-job-skipped.sh)** - Catch skipped jobs

## Best Practices

1. **Always use `set -e`** - Exit immediately on error
2. **Use `set -o pipefail`** - Catch failures in pipes
3. **Ping inside script** - Not in cron line, so you have access to variables
4. **Check results** - Don't just trust exit codes, verify actual results
5. **Use traps** - Ensure ping is sent even on unexpected exit

## Documentation

See [deadmanping.com](https://deadmanping.com?utm_source=github&utm_medium=referral&utm_campaign=examples) for detailed documentation on each problem and solution.
