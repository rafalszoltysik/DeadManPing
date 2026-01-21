# Cron Patterns

Example crontab entries for common scheduling patterns.

## Important Note

**The ping command must be inside your script, not in the cron line.**

This is because:
- Only inside the script do you have access to variables from execution results
- You can check file sizes, exit codes, output content, etc.
- Data must come from execution, not be hardcoded

## Common Patterns

### Daily Jobs

```cron
# Every day at 3 AM
0 3 * * * /path/to/backup.sh

# Every day at midnight
0 0 * * * /path/to/cleanup.sh
```

### Hourly Jobs

```cron
# Every hour at minute 0
0 * * * * /path/to/sync.sh

# Every hour at minute 30
30 * * * * /path/to/check.sh
```

### Weekly Jobs

```cron
# Every Monday at 2 AM
0 2 * * 1 /path/to/report.sh

# Every Sunday at midnight
0 0 * * 0 /path/to/weekly-backup.sh
```

### Frequent Jobs

```cron
# Every 5 minutes
*/5 * * * * /path/to/health-check.sh

# Every 15 minutes
*/15 * * * * /path/to/monitor.sh
```

## Cron Syntax

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

## Examples

- **[daily-backup.cron](./daily-backup.cron)** - Daily backup at 3 AM
- **[hourly-sync.cron](./hourly-sync.cron)** - Hourly sync
- **[weekly-report.cron](./weekly-report.cron)** - Weekly report on Monday
- **[every-5-minutes.cron](./every-5-minutes.cron)** - Health check every 5 minutes

## Setting Up Crontab

1. Edit crontab: `crontab -e`
2. Add your cron line
3. Save and exit
4. Verify: `crontab -l`

## Best Practices

1. **Use absolute paths** - Cron has minimal PATH
2. **Set environment variables** - Add `PATH`, `SHELL`, etc. at top of crontab
3. **Redirect output** - Add `>> /var/log/script.log 2>&1` to capture errors
4. **Test first** - Run script manually before adding to cron
5. **Monitor execution** - Use DeadManPing to verify jobs actually run

## Documentation

See [deadmanping.com/monitor-cron-jobs](https://deadmanping.com/monitor-cron-jobs?utm_source=github&utm_medium=referral&utm_campaign=examples) for detailed documentation.
