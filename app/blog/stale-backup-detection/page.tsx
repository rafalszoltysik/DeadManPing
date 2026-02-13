import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'
import { Footer } from '@/components/Footer'
import { CodeBlock } from '@/components/CodeBlock'
import { createArticleSchema, createBreadcrumbSchema } from '@/lib/seo-helpers'
import { RelatedArticles } from '@/components/RelatedArticles'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Stale Backup Detection: Last Backup Was a Month Ago | DeadManPing",
  description: "Your backup runs but the last good one was weeks ago. Learn how to detect stale backups and verify backup age with payload validation. Examples in Bash, Python, Node.js.",
  keywords: "stale backup detection, last backup was month ago, backup age monitoring, verify backup not old, detect outdated backup, backup modified date check, backup freshness monitoring",
  openGraph: {
    title: "Stale Backup Detection: Last Backup Was a Month Ago",
    description: "Learn how to detect stale backups and verify backup age with payload validation.",
    type: "article",
    url: `${cleanBaseUrl}/blog/stale-backup-detection`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Stale Backup Detection: Last Backup Was a Month Ago",
    description: "Learn how to detect stale backups and verify backup age with payload validation.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/stale-backup-detection`,
  },
}

export default function StaleBackupDetectionPage() {
  const structuredData = createArticleSchema({
    slug: "stale-backup-detection",
    headline: "Stale Backup Detection: Last Backup Was a Month Ago",
    description: "How to detect when the last good backup is too old. Verify backup age and freshness with modified_at and payload validation.",
    keywords: "stale backup detection, last backup was month ago, backup age monitoring, backup freshness",
    articleSection: "Cron Monitoring Guides"
  })

  const breadcrumbSchema = createBreadcrumbSchema({
    slug: "stale-backup-detection",
    title: "Stale Backup Detection"
  })

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
              Stale Backup Detection: Last Backup Was a Month Ago
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              The backup job runs every night and exits 0. But the last time it actually wrote a valid file was a month ago. 
              Learn how to detect stale backups by checking backup age and get alerts before you need to restore.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: Backup &quot;Runs&quot; but Isn&apos;t Fresh
                </h2>
                <p className="text-muted-foreground mb-4">
                  Cron runs the backup script. The script exits successfully. But the backup file hasn&apos;t been updated in weeks—maybe the script is writing to the wrong path, 
                  or a step failed silently and the file is old. You only find out when you need to restore.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Backup script runs but writes to a path that changed; real backup is elsewhere and old</li>
                  <li>First step fails; script still exits 0 and pings &quot;success&quot;</li>
                  <li>Disk full or permission error after the last good run; no new file, nobody checks date</li>
                  <li>Last good backup was a month ago—you discover it during an incident</li>
                </ul>
                <p className="text-muted-foreground">
                  A simple success ping isn&apos;t enough. You need to verify that the backup file (or artifact) was actually updated recently.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Send Backup Age (modified_at) and Validate It
                </h2>
                <p className="text-muted-foreground mb-4">
                  After creating or updating the backup, read the file&apos;s modification time (or your backup tool&apos;s completion time). 
                  Send that as part of the ping payload. In DeadManPing, set a validation rule: e.g. backup must be no older than 25 hours (or 2x your backup interval). 
                  If the backup is stale, validation fails and you get an alert.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash: File mtime as Unix timestamp
                </h3>
                <CodeBlock
                  code={`#!/bin/bash
BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql.gz"
/path/to/backup.sh -o "$BACKUP_FILE"

# Get last modified time (Unix timestamp) and size
MTIME=$(stat -c %Y "$BACKUP_FILE")
SIZE=$(stat -c %s "$BACKUP_FILE")

# Ping with payload; in DeadManPing set rule: modified_at within last 25 hours
curl -X POST "https://deadmanping.com/api/ping/backup-daily?modified_at=$MTIME&file_size=$SIZE"`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python: Send ISO date or timestamp
                </h3>
                <CodeBlock
                  code={`import os
from datetime import datetime
import urllib.request

backup_path = "/backups/db-latest.sql.gz"
run_backup(backup_path)

mtime = os.path.getmtime(backup_path)
# Send as Unix timestamp; DeadManPing can validate max age
url = f"https://deadmanping.com/api/ping/backup-daily?modified_at={int(mtime)}&file_size={os.path.getsize(backup_path)}"
urllib.request.urlopen(url)`}
                  language="python"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js: Backup age in seconds
                </h3>
                <CodeBlock
                  code={`const fs = require('fs');
const path = '/backups/db-latest.sql.gz';

await runBackup(path);
const stat = fs.statSync(path);
const modifiedAt = Math.floor(stat.mtimeMs / 1000);
const fileSize = stat.size;

await fetch(
  \`https://deadmanping.com/api/ping/backup-daily?modified_at=\${modifiedAt}&file_size=\${fileSize}\`,
  { method: 'POST' }
);`}
                  language="javascript"
                />
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Configure Max Age in DeadManPing
                </h2>
                <p className="text-muted-foreground mb-4">
                  In the monitor&apos;s payload validation rules, use <strong>modified_at</strong>: &quot;must be within last X hours&quot; (or &quot;max age&quot; in seconds). 
                  If the backup file is older than that, the ping fails validation and you get an alert—so you know the last good backup is too old before you need to restore.
                </p>
                <p className="text-muted-foreground">
                  Combine with <strong>file_size</strong> (or file_size_mb) so you also catch empty or zero-byte backups. 
                  One ping with file metadata; the dashboard does the rest.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Don&apos;t Discover a Stale Backup When You Restore
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing payload validation checks backup age and size. Add one ping with <code className="bg-muted px-1.5 py-0.5 rounded text-sm">modified_at</code> and optional <code className="bg-muted px-1.5 py-0.5 rounded text-sm">file_size</code>; 
                    get alerts when the backup is stale or empty.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/auth/signup"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Start Free
                    </Link>
                    <Link
                      href="/backup-dead-man-switch"
                      className="border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Backup Dead Man Switch
                    </Link>
                  </div>
                </div>
              </section>
            </AnimatedSection>

            <RelatedArticles slug="stale-backup-detection" />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
