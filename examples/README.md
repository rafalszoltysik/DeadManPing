# DeadManPing Examples

Working code examples for monitoring cron jobs, backups, and scheduled tasks with DeadManPing.

This repository contains real-world examples in multiple languages showing how to:
- Detect silent cron failures
- Verify backup files aren't empty
- Check exit codes and status
- Handle edge cases
- Monitor job execution

## Quick Start

1. Sign up for [DeadManPing](https://deadmanping.com?utm_source=github&utm_medium=referral&utm_campaign=examples) (free account)
2. Create a monitor and get your ping URL
3. Copy an example script below
4. Replace `YOUR_MONITOR_ID` with your actual monitor ID
5. Add the script to your cron job

## Examples by Problem

| Problem | Solution | Examples |
|---------|----------|----------|
| [Detect Empty Backup File Cron](./bash/detect-empty-backup-file-cron.sh) | Check backup file size after creation | [Bash](./bash/detect-empty-backup-file-cron.sh) \| [Python](./python/detect_empty_backup_file_cron.py) \| [Node.js](./nodejs/detect_empty_backup_file_cron.js) |
| [Curl Success But Wrong Response](./bash/curl-success-but-wrong-response.sh) | Validate API response content | [Bash](./bash/curl-success-but-wrong-response.sh) \| [Python](./python/curl_success_but_wrong_response.py) \| [Node.js](./nodejs/curl_success_but_wrong_response.js) |
| [Silent Cron Failures](./bash/silent-cron-failures.sh) | Explicit success confirmation with ping | [Bash](./bash/silent-cron-failures.sh) \| [Python](./python/silent_cron_failures.py) \| [Node.js](./nodejs/silent_cron_failures.js) |
| [Verify Cron Output](./bash/verify-cron-output.sh) | Validate script output content | [Bash](./bash/verify-cron-output.sh) \| [Python](./python/verify_cron_output.py) \| [Node.js](./nodejs/verify_cron_output.js) |
| [Detect Empty Backup File](./bash/detect-empty-backup-file.sh) | Check if backup file is zero bytes | [Bash](./bash/detect-empty-backup-file.sh) \| [Python](./python/detect_empty_backup_file.py) \| [Node.js](./nodejs/detect_empty_backup_file.js) |
| [Cron Job Exit Code Not Zero](./bash/cron-job-exit-code-not-zero.sh) | Check and handle exit codes | [Bash](./bash/cron-job-exit-code-not-zero.sh) \| [Python](./python/cron_job_exit_code_not_zero.py) \| [Node.js](./nodejs/cron_job_exit_code_not_zero.js) |
| [Verify Cron Job Actually Ran](./bash/verify-cron-job-actually-ran.sh) | Confirm job execution with pings | [Bash](./bash/verify-cron-job-actually-ran.sh) \| [Python](./python/verify_cron_job_actually_ran.py) \| [Node.js](./nodejs/verify_cron_job_actually_ran.js) |
| [Cron Job Returns Success But Fails](./bash/cron-job-returns-success-but-fails.sh) | Validate results, not just exit codes | [Bash](./bash/cron-job-returns-success-but-fails.sh) \| [Python](./python/cron_job_returns_success_but_fails.py) \| [Node.js](./nodejs/cron_job_returns_success_but_fails.js) |
| [Verify Backup File Size](./bash/verify-backup-file-size.sh) | Check backup file size ranges | [Bash](./bash/verify-backup-file-size.sh) \| [Python](./python/verify_backup_file_size.py) \| [Node.js](./nodejs/verify_backup_file_size.js) |
| [Cron Job Silent Failure Detection](./bash/cron-job-silent-failure-detection.sh) | Detect failures without logs | [Bash](./bash/cron-job-silent-failure-detection.sh) \| [Python](./python/cron_job_silent_failure_detection.py) \| [Node.js](./nodejs/cron_job_silent_failure_detection.js) |
| [Curl Returns 200 But Wrong Data](./bash/curl-returns-200-but-wrong-data.sh) | Validate API response body | [Bash](./bash/curl-returns-200-but-wrong-data.sh) \| [Python](./python/curl_returns_200_but_wrong_data.py) \| [Node.js](./nodejs/curl_returns_200_but_wrong_data.js) |
| [Detect Cron Job Partial Failure](./bash/detect-cron-job-partial-failure.sh) | Verify all steps complete | [Bash](./bash/detect-cron-job-partial-failure.sh) \| [Python](./python/detect_cron_job_partial_failure.py) \| [Node.js](./nodejs/detect_cron_job_partial_failure.js) |
| [Detect Cron Job Wrong Exit Code](./bash/detect-cron-job-wrong-exit-code.sh) | Validate exit codes | [Bash](./bash/detect-cron-job-wrong-exit-code.sh) \| [Python](./python/detect_cron_job_wrong_exit_code.py) \| [Node.js](./nodejs/detect_cron_job_wrong_exit_code.js) |
| [Verify Script Output Content](./bash/verify-script-output-content.sh) | Check output contains expected data | [Bash](./bash/verify-script-output-content.sh) \| [Python](./python/verify_script_output_content.py) \| [Node.js](./nodejs/verify_script_output_content.js) |
| [Detect Backup File Missing](./bash/detect-backup-file-missing.sh) | Verify backup file exists | [Bash](./bash/detect-backup-file-missing.sh) \| [Python](./python/detect_backup_file_missing.py) \| [Node.js](./nodejs/detect_backup_file_missing.js) |
| [Cron Job Not Executing](./bash/cron-job-not-executing.sh) | Detect when jobs don't run | [Bash](./bash/cron-job-not-executing.sh) \| [Python](./python/cron_job_not_executing.py) \| [Node.js](./nodejs/cron_job_not_executing.js) |
| [Verify Cron Job Completed](./bash/verify-cron-job-completed.sh) | Confirm job finished successfully | [Bash](./bash/verify-cron-job-completed.sh) \| [Python](./python/verify_cron_job_completed.py) \| [Node.js](./nodejs/verify_cron_job_completed.js) |
| [Detect Cron Job Skipped](./bash/detect-cron-job-skipped.sh) | Catch jobs that don't run | [Bash](./bash/detect-cron-job-skipped.sh) \| [Python](./python/detect_cron_job_skipped.py) \| [Node.js](./nodejs/detect_cron_job_skipped.js) |
| [Backup File Zero Bytes](./bash/backup-file-zero-bytes.sh) | Detect empty backup files | [Bash](./bash/backup-file-zero-bytes.sh) \| [Python](./python/backup_file_zero_bytes.py) \| [Node.js](./nodejs/backup_file_zero_bytes.js) |
| [Cron Job Exit Status Check](./bash/cron-job-exit-status-check.sh) | Verify exit status codes | [Bash](./bash/cron-job-exit-status-check.sh) \| [Python](./python/cron_job_exit_status_check.py) \| [Node.js](./nodejs/cron_job_exit_status_check.js) |

## Examples by Language

- **[Bash Examples](./bash/)** - Shell scripts for Linux/Unix systems
- **[Python Examples](./python/)** - Python scripts with error handling
- **[Node.js Examples](./nodejs/)** - JavaScript/Node.js examples
- **[Cron Patterns](./cron/)** - Example crontab entries
- **[Edge Cases](./edge-cases/)** - Advanced scenarios and rare cases

## Documentation

Each example links to detailed documentation on [deadmanping.com](https://deadmanping.com?utm_source=github&utm_medium=referral&utm_campaign=examples):

- [Monitor Cron Jobs](https://deadmanping.com/monitor-cron-jobs?utm_source=github&utm_medium=referral&utm_campaign=examples)
- [Backup Monitoring](https://deadmanping.com/backup-monitoring?utm_source=github&utm_medium=referral&utm_campaign=examples)
- [Dead Man Switch](https://deadmanping.com/dead-man-switch?utm_source=github&utm_medium=referral&utm_campaign=examples)
- [Cron Job Failed](https://deadmanping.com/cron-job-failed?utm_source=github&utm_medium=referral&utm_campaign=examples)

## How It Works

DeadManPing uses a **dead man switch** pattern:

1. Your cron job runs your script
2. Your script performs its work
3. Your script sends a ping to DeadManPing when done
4. If the ping doesn't arrive, you get an alert

**Important:** The ping must be **inside your script**, not in the cron line, because only in the script do you have access to variables from execution results.

## Getting Your Ping URL

1. Sign up at [deadmanping.com](https://deadmanping.com/auth/signup?utm_source=github&utm_medium=referral&utm_campaign=examples)
2. Create a monitor
3. Copy your unique ping URL (format: `https://deadmanping.com/api/ping/YOUR_MONITOR_ID`)
4. Replace `YOUR_MONITOR_ID` in the examples with your actual monitor ID

## Contributing

Found a bug or have a better example? Open an issue or submit a pull request!

## License

These examples are provided as-is for educational purposes. See the main [DeadManPing](https://deadmanping.com?utm_source=github&utm_medium=referral&utm_campaign=examples) repository for license information.
