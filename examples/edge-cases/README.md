# Edge Cases

Advanced examples for rare scenarios and special use cases.

## Examples

### Docker Containers

- **[docker-cron.sh](./docker-cron.sh)** - Running cron jobs inside Docker containers
  - Container needs network access to ping DeadManPing
  - Can ping from host or inside container's entrypoint script

### Multi-Step Jobs

- **[multi-step-validation.sh](./multi-step-validation.sh)** - Verify all steps in multi-step jobs
  - Track which steps failed
  - Report specific failures in ping payload

### Conditional Monitoring

- **[conditional-ping.sh](./conditional-ping.sh)** - Ping only when conditions are met
  - Example: Only ping if files were actually synced
  - Still ping on no changes to confirm job ran

## Best Practices

1. **Always ping eventually** - Even if condition isn't met, ping to confirm job ran
2. **Include context** - Add relevant data (file counts, step names) to ping payload
3. **Handle edge cases** - Consider what happens when conditions aren't met
4. **Test scenarios** - Test both success and failure paths

## Documentation

See [deadmanping.com](https://deadmanping.com?utm_source=github&utm_medium=referral&utm_campaign=examples) for detailed documentation on monitoring cron jobs.
