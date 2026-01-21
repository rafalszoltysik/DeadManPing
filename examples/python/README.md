# Python Examples

Python scripts for monitoring cron jobs with DeadManPing.

## Quick Start

1. Install dependencies: `pip install requests`
2. Replace `YOUR_MONITOR_ID` in each script with your actual monitor ID from [deadmanping.com](https://deadmanping.com?utm_source=github&utm_medium=referral&utm_campaign=examples)
3. Make script executable: `chmod +x script.py`
4. Add to crontab: `0 3 * * * /usr/bin/python3 /path/to/script.py`

## Examples

### Basic Monitoring

- **[detect_empty_backup_file_cron.py](./detect_empty_backup_file_cron.py)** - Detect when backup files are empty
- **[verify_cron_job_actually_ran.py](./verify_cron_job_actually_ran.py)** - Verify job execution with timestamps
- **[verify_cron_job_completed.py](./verify_cron_job_completed.py)** - Confirm job finished successfully

### Error Detection

- **[cron_job_exit_code_not_zero.py](./cron_job_exit_code_not_zero.py)** - Check exit codes
- **[cron_job_exit_status_check.py](./cron_job_exit_status_check.py)** - Verify exit status
- **[detect_cron_job_wrong_exit_code.py](./detect_cron_job_wrong_exit_code.py)** - Detect false success

### Silent Failures

- **[silent_cron_failures.py](./silent_cron_failures.py)** - Detect silent failures with try-finally
- **[cron_job_silent_failure_detection.py](./cron_job_silent_failure_detection.py)** - Always ping on success

### Backup Monitoring

- **[detect_empty_backup_file.py](./detect_empty_backup_file.py)** - Check backup file size
- **[detect_backup_file_missing.py](./detect_backup_file_missing.py)** - Verify backup file exists
- **[backup_file_zero_bytes.py](./backup_file_zero_bytes.py)** - Detect zero-byte backups
- **[verify_backup_file_size.py](./verify_backup_file_size.py)** - Validate file size ranges

### API Response Validation

- **[curl_success_but_wrong_response.py](./curl_success_but_wrong_response.py)** - Validate API responses
- **[curl_returns_200_but_wrong_data.py](./curl_returns_200_but_wrong_data.py)** - Check response body content

### Output Validation

- **[verify_cron_output.py](./verify_cron_output.py)** - Validate script output
- **[verify_script_output_content.py](./verify_script_output_content.py)** - Check output content

### Advanced

- **[detect_cron_job_partial_failure.py](./detect_cron_job_partial_failure.py)** - Verify multi-step jobs
- **[cron_job_returns_success_but_fails.py](./cron_job_returns_success_but_fails.py)** - Validate results
- **[cron_job_not_executing.py](./cron_job_not_executing.py)** - Detect non-execution
- **[detect_cron_job_skipped.py](./detect_cron_job_skipped.py)** - Catch skipped jobs

## Best Practices

1. **Use try-finally** - Ensure ping is sent even on exception
2. **Check results** - Don't just trust exit codes, verify actual results
3. **Handle exceptions** - Catch and report errors properly
4. **Use subprocess.run()** - Better control over exit codes than os.system()
5. **Validate JSON** - Always validate JSON responses before using

## Dependencies

All examples require:
```bash
pip install requests
```

## Documentation

See [deadmanping.com](https://deadmanping.com?utm_source=github&utm_medium=referral&utm_campaign=examples) for detailed documentation on each problem and solution.
