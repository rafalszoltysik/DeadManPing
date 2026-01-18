import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'

export const metadata: Metadata = {
  title: "Backup Monitoring Service | Monitor Backup Jobs | DeadManPing",
  description: "Backup monitoring that doesn't touch your execution. Keep your backup scripts. Add one curl line. Get alerts when backups fail.",
  keywords: "backup monitoring, backup monitoring service, monitor backup jobs, backup failure detection, automated backup monitoring, backup alert, backup job monitoring",
  openGraph: {
    title: "Backup Monitoring Service | DeadManPing",
    description: "Backup monitoring that doesn't touch your execution. Keep your backup scripts. Add one curl line. Get alerts when backups fail.",
    type: "article",
  },
  alternates: {
    canonical: "/backup-monitoring",
  },
}

export default function BackupMonitoringPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Backup Monitoring Service: Never Miss a Failed Backup",
    "description": "How to set up automated monitoring for backup jobs to detect failures immediately.",
    "author": {
      "@type": "Organization",
      "name": "DeadManPing"
    }
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Backup Monitoring Service: Never Miss a Failed Backup
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4">
              Backup monitoring that doesn't touch your execution.
            </p>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Keep your backup scripts. Add one curl line. Get alerts when backups fail.
            </p>
          </header>

          <div className="space-y-8">
            <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                Why You Need Backup Monitoring
              </h2>
              <p className="text-muted-foreground mb-4">
                Backups are useless if they fail silently. Without monitoring, you might discover your backups 
                haven't been running for weeks when you need them most. Common backup failure scenarios:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Silent failures</strong> - Script crashes without logging errors</li>
                <li><strong>Disk space exhaustion</strong> - Backups fail when disk fills up</li>
                <li><strong>Network issues</strong> - Remote backup syncs fail intermittently</li>
                <li><strong>Permission errors</strong> - System updates break backup permissions</li>
                <li><strong>Cron job disabled</strong> - Backup job gets removed or disabled</li>
                <li><strong>Database connection failures</strong> - Database dumps fail due to connection issues</li>
              </ul>
              <p className="text-muted-foreground">
                Traditional file-based monitoring (checking if backup files exist) doesn't verify they're recent 
                or complete. You need process-level monitoring that confirms the backup actually ran.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                How Backup Monitoring Works
              </h2>
              <p className="text-muted-foreground mb-4">
                <strong>DeadManPing doesn't run your backups. Your cron does. DeadManPing only observes if the ping arrived.</strong>
              </p>
              <p className="text-muted-foreground mb-4">
                A backup monitoring service uses a dead man switch pattern: your backup script pings the monitoring 
                service after each successful backup. If the ping doesn't arrive within the expected interval, 
                you get an alert. It's independent of your backup infrastructure, so it works with any backup method.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Important:</strong> The curl command must be <strong>inside your backup script</strong>, not in the cron line, because only in the script do you have access to variables from execution results (e.g., backup file size, success status).
              </p>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Integration Examples
              </h3>

              <h4 className="text-base sm:text-lg font-semibold mb-2 mt-4">
                rsync Backup
              </h4>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div>#!/bin/bash</div>
                  <div>set -e</div>
                  <div>rsync -avz /data/ user@backup-server:/backups/</div>
                  <div>curl -X POST "https://your-domain.com/api/ping/backup-rsync?s=ok"</div>
                </code>
              </div>

              <h4 className="text-base sm:text-lg font-semibold mb-2 mt-4">
                PostgreSQL Backup
              </h4>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div>#!/bin/bash</div>
                  <div>BACKUP_FILE="/backups/pg-$(date +%Y%m%d).sql"</div>
                  <div>if pg_dump mydb &gt; "$BACKUP_FILE"; then</div>
                  <div>  gzip "$BACKUP_FILE"</div>
                  <div>  curl -X POST "https://your-domain.com/api/ping/backup-postgres?s=ok"</div>
                  <div>else</div>
                  <div>  curl -X POST "https://your-domain.com/api/ping/backup-postgres?s=fail&m=pg_dump+failed"</div>
                  <div>  exit 1</div>
                  <div>fi</div>
                </code>
              </div>

              <h4 className="text-base sm:text-lg font-semibold mb-2 mt-4">
                MySQL Backup
              </h4>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div>#!/bin/bash</div>
                  <div>if mysqldump mydb &gt; /backups/mysql-$(date +%Y%m%d).sql; then</div>
                  <div>  curl -X POST "https://your-domain.com/api/ping/backup-mysql?s=ok"</div>
                  <div>else</div>
                  <div>  curl -X POST "https://your-domain.com/api/ping/backup-mysql?s=fail"</div>
                  <div>  exit 1</div>
                  <div>fi</div>
                </code>
              </div>

              <h4 className="text-base sm:text-lg font-semibold mb-2 mt-4">
                S3/Cloud Backup
              </h4>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div>#!/bin/bash</div>
                  <div>tar -czf backup.tar.gz /data/</div>
                  <div>if aws s3 cp backup.tar.gz s3://my-bucket/backups/; then</div>
                  <div>  rm backup.tar.gz</div>
                  <div>  curl -X POST "https://your-domain.com/api/ping/backup-s3?s=ok"</div>
                  <div>else</div>
                  <div>  curl -X POST "https://your-domain.com/api/ping/backup-s3?s=fail"</div>
                  <div>  exit 1</div>
                  <div>fi</div>
                </code>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                What to Monitor
              </h2>
              <p className="text-muted-foreground mb-4">
                Prioritize monitoring backups that protect critical data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Database backups</strong> - PostgreSQL, MySQL, MongoDB, etc.</li>
                <li><strong>File system backups</strong> - rsync, tar, cloud sync</li>
                <li><strong>Application backups</strong> - Configuration files, user data</li>
                <li><strong>Incremental backups</strong> - Daily/weekly incremental syncs</li>
                <li><strong>Offsite backups</strong> - Remote replication jobs</li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                Alert Channels
              </h2>
              <p className="text-muted-foreground mb-4">
                A good backup monitoring service supports multiple alert channels:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Email</strong> - Immediate notifications to your inbox</li>
                <li><strong>Slack</strong> - Team notifications in your Slack workspace</li>
                <li><strong>Discord</strong> - Webhook notifications to Discord channels</li>
                <li><strong>Webhooks</strong> - Custom integrations with PagerDuty, OpsGenie, etc.</li>
              </ul>
            </section>

            <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Start Monitoring Your Backups
                </h2>
                <p className="text-muted-foreground mb-4">
                  DeadManPing provides automated backup monitoring with dead man switch technology. 
                  Set up monitoring in 2 minutes, works with any backup method, and sends alerts via 
                  email, Slack, or Discord.
                </p>
                <Link
                  href="/auth/signup"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift"
                >
                  Start Free Trial
                </Link>
              </div>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
