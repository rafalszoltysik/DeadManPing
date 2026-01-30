import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { Footer } from '@/components/Footer'
import { CodeBlock } from '@/components/CodeBlock'
import { RelatedArticles } from '@/components/RelatedArticles'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Dead Man Switch for Backups | Monitor Backup Jobs | DeadManPing",
  description: "Dead man switch for backups. Keep your backup scripts. Add one curl line. Get alerts when backups fail.",
  keywords: "dead man switch, backup monitoring, dead man switch for backups, monitor backup jobs, backup failure detection, automated backup monitoring, backup alert system",
  openGraph: {
    title: "Dead Man Switch for Backups | DeadManPing",
    description: "Dead man switch for backups. Keep your backup scripts. Add one curl line. Get alerts when backups fail.",
    type: "article",
    url: `${cleanBaseUrl}/blog/dead-man-switch`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dead Man Switch for Backups | DeadManPing",
    description: "Dead man switch for backups. Keep your backup scripts. Add one curl line. Get alerts when backups fail.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/dead-man-switch`,
  },
}

export default function DeadManSwitchPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Dead Man Switch for Backups: Never Miss a Failed Backup Again",
    "description": "How to implement dead man switch monitoring for backup jobs to detect failures immediately.",
    "url": `${cleanBaseUrl}/blog/dead-man-switch`,
    "datePublished": "2026-01-15",
    "dateModified": "2026-01-15",
    "author": {
      "@type": "Organization",
      "name": "DeadManPing",
      "url": cleanBaseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing",
      "logo": {
        "@type": "ImageObject",
        "url": `${cleanBaseUrl}/icon.png`,
        "width": 1200,
        "height": 1200
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${cleanBaseUrl}/blog/dead-man-switch`
    },
    "articleSection": "Backup Monitoring Guides",
    "keywords": "dead man switch, backup monitoring, dead man switch for backups, monitor backup jobs, backup failure detection, automated backup monitoring, backup alert system",
    "inLanguage": "en-US"
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": cleanBaseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Dead Man Switch",
        "item": `${cleanBaseUrl}/blog/dead-man-switch`
      }
    ]
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth group"
          >
            <svg 
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to Blog</span>
          </Link>
        </div>
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Dead Man Switch for Backups: Never Miss a Failed Backup Again
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4">
              Dead man switch that doesn't touch your execution.
            </p>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your backup script runs as before. Just add one curl line at the end.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why Backup Monitoring Matters
                </h2>
              <p className="text-muted-foreground mb-4">
                Backups are your last line of defense against data loss. But if your backup job fails silently, 
                you're left with false confidence. Common backup failure scenarios:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Disk space runs out mid-backup</li>
                <li>Database connection fails during dump</li>
                <li>Network issues when syncing to remote storage</li>
                <li>Permission errors after system updates</li>
                <li>Backup script crashes due to unhandled errors</li>
                <li>Cron job gets disabled or removed</li>
              </ul>
              <p className="text-muted-foreground">
                Traditional monitoring checks if files exist, but doesn't verify they're recent or complete. 
                A dead man switch confirms the backup process actually ran.
              </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How Dead Man Switch Works for Backups
                </h2>
              <p className="text-muted-foreground mb-4">
                <strong>DeadManPing doesn't run your backups. Your cron does. DeadManPing only observes if the ping arrived.</strong>
              </p>
              <p className="text-muted-foreground mb-4">
                After each successful backup, your script pings a monitoring service. If the ping doesn't arrive 
                within the expected interval (e.g., daily backups should ping every 24 hours), you get an alert. 
                It's independent of your backup infrastructure, so it works with any backup method.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Important:</strong> The curl command must be <strong>inside your backup script</strong>, not in the cron line, because only in the script do you have access to variables from execution results (e.g., backup file size, success status).
              </p>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                rsync Backup Example
              </h3>
              <CodeBlock
                code={`#!/bin/bash
set -e

# Run backup
rsync -avz /data/ user@backup-server:/backups/

# Single ping at end - if job fails, ping won't arrive and DeadManPing will alert
curl -X POST "https://deadmanping.com/api/ping/backup-daily"`}
                language="bash"
              />
              <p className="text-muted-foreground mb-4">
                The <code className="bg-muted px-1.5 py-0.5 rounded text-sm">set -e</code> ensures the script exits on any error, 
                so the ping only happens if rsync succeeds.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Database Backup Example
              </h3>
              <CodeBlock
                code={`#!/bin/bash

BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql"

pg_dump mydb > "$BACKUP_FILE"
gzip "$BACKUP_FILE"

# Get backup file size
FILE_SIZE=$(stat -f%z "$BACKUP_FILE.gz" 2>/dev/null || stat -c%s "$BACKUP_FILE.gz" 2>/dev/null || echo 0)

# Single ping with file size in payload
# In DeadManPing panel: set validation rule "size" > 0
# Panel will automatically detect if backup file is empty
curl -X POST "https://deadmanping.com/api/ping/backup-db?size=$FILE_SIZE"`}
                language="bash"
              />

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Cloud Backup (S3, GCS, etc.)
              </h3>
              <CodeBlock
                code={`#!/bin/bash

# Create backup archive
tar -czf backup.tar.gz /data/

# Upload to S3
aws s3 cp backup.tar.gz s3://my-bucket/backups/
UPLOAD_EXIT_CODE=$?
rm backup.tar.gz

# Single ping with upload exit code in payload
# In DeadManPing panel: set validation rule "upload_exit_code" == 0
# Panel will automatically detect if S3 upload failed
curl -X POST "https://deadmanping.com/api/ping/backup-s3?upload_exit_code=$UPLOAD_EXIT_CODE"`}
                language="bash"
              />
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  What Makes a Good Backup Dead Man Switch
                </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Independent infrastructure</strong> - Runs outside your backup system, so it detects failures even if your monitoring is down</li>
                <li><strong>Simple integration</strong> - Just add a curl command, no agents or complex setup</li>
                <li><strong>Immediate alerts</strong> - Notifies you as soon as a backup is missed, not days later</li>
                <li><strong>Works with any backup method</strong> - rsync, tar, database dumps, cloud sync, etc.</li>
                <li><strong>Failure reporting</strong> - Can distinguish between "backup didn't run" and "backup failed"</li>
              </ul>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Setting Up Monitoring Intervals
                </h2>
              <p className="text-muted-foreground mb-4">
                Match your monitoring interval to your backup frequency, with a grace period:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li><strong>Daily backups</strong> - Expect ping every 24 hours, alert if missing for 25+ hours</li>
                <li><strong>Hourly backups</strong> - Expect ping every hour, alert if missing for 65+ minutes</li>
                <li><strong>Weekly backups</strong> - Expect ping every 7 days, alert if missing for 8+ days</li>
              </ul>
              <p className="text-muted-foreground">
                The grace period accounts for slight timing variations and gives you time to respond before it's critical.
              </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Start Monitoring Your Backups Today
                </h2>
                <p className="text-muted-foreground mb-4">
                  DeadManPing provides dead man switch monitoring for backup jobs. Set up monitoring in 2 minutes, 
                  works with any backup method, and sends alerts via email, Slack, or Discord.
                </p>
                <Link
                  href="/auth/signup"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift"
                >
                  Start Free Trial
                </Link>
              </div>
              </section>
            </AnimatedSection>

            <RelatedArticles slug="dead-man-switch" />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
