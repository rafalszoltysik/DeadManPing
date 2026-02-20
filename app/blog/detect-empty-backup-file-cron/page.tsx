import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'
import { CodeBlock } from '@/components/CodeBlock'
import { createArticleSchema, createBreadcrumbSchema } from '@/lib/seo-helpers'
import { RelatedArticles } from '@/components/RelatedArticles'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Detect Empty Backup Files From Cron Jobs - Automated Size Check",
  description: "Detect when cron backup jobs create empty files. Automated file size verification in Bash, Python, Node.js. Get alerts for 0-byte backups.",
  keywords: "detect empty backup file cron, empty backup file detection, cron backup empty file, verify backup file not empty, detect zero byte backup, backup file size check cron",
  openGraph: {
    title: "Detect Empty Backup Files From Cron Jobs - Automated Size Check",
    description: "How to detect when cron backup jobs create empty files. Examples in bash, Python, Node.js.",
    type: "article",
    url: `${cleanBaseUrl}/blog/detect-empty-backup-file-cron`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect Empty Backup Files From Cron Jobs - Automated Size Check",
    description: "How to detect when cron backup jobs create empty files. Examples in bash, Python, Node.js.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/detect-empty-backup-file-cron`,
  },
}

export default function DetectEmptyBackupFileCronPage() {
  const structuredData = createArticleSchema({
    slug: "detect-empty-backup-file-cron",
    headline: "Detect Empty Backup File Cron: How to Verify Backup Files Aren't Empty",
    description: "Complete guide on detecting when cron backup jobs create empty files and how to monitor this automatically.",
    keywords: "detect empty backup file cron, empty backup file detection, cron backup empty file, verify backup file not empty, detect zero byte backup, backup file size check cron",
    articleSection: "Backup Monitoring Guides"
  })

  const breadcrumbSchema = createBreadcrumbSchema({
    slug: "detect-empty-backup-file-cron",
    title: "Detect Empty Backup File Cron"
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
              Detect Empty Backup File Cron: Verify Your Backups Aren't Empty
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron backup job returns success, but the backup file is empty. Learn how to detect and prevent this silent failure.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: Empty Backup Files
                </h2>
                <p className="text-muted-foreground mb-4">
                  A cron backup job can exit with success code (0) even when the backup file is empty. This happens when:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Database connection fails silently, creating an empty dump file</li>
                  <li>Disk space runs out mid-backup, leaving a zero-byte file</li>
                  <li>Backup script errors are caught but not properly handled</li>
                  <li>File permissions prevent writes, but the script doesn't check</li>
                  <li>Network timeouts during remote backups create empty files</li>
                </ul>
                <p className="text-muted-foreground">
                  Without checking file size, you might think backups are working when they're actually failing silently.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Check File Size After Backup
                </h2>
                <p className="text-muted-foreground mb-4">
                  Always verify backup file size after creation. The check must be inside your script, not in the cron line, because you need access to the file path and size.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example
                </h3>
                <CodeBlock
                  code={`#!/bin/bash
BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql"
pg_dump mydb > "$BACKUP_FILE"

# Get file size
FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo 0)

# Single ping with file size in payload
# In DeadManPing panel: set validation rule "size" > 0 (or >= 1024 for minimum size)
# Panel will automatically detect if size is 0 or too small
curl -X POST "https://deadmanping.com/api/ping/backup-daily?size=$FILE_SIZE"`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example
                </h3>
                <CodeBlock
                  code={`import os
import subprocess
import requests
from datetime import datetime

backup_file = f"/backups/db-{datetime.now().strftime('%Y%m%d')}.sql"
subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file, "w"))

# Get file size
file_size = os.path.getsize(backup_file) if os.path.exists(backup_file) else 0

# Single ping with file size in payload
# In DeadManPing panel: set validation rule "size" > 0 (or >= 1024 for minimum size)
# Panel will automatically detect if size is 0 or too small
requests.post(f"https://deadmanping.com/api/ping/backup-daily?size={file_size}")`}
                  language="python"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example
                </h3>
                <CodeBlock
                  code={`const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

const backupFile = \`/backups/db-\${new Date().toISOString().split('T')[0].replace(/-/g, '')}.sql\`;
execSync(\`pg_dump mydb > \${backupFile}\`);

// Get file size
let fileSize = 0;
try {
  fileSize = fs.statSync(backupFile).size;
} catch (e) {
  // File doesn't exist
}

// Single ping with file size in payload
// In DeadManPing panel: set validation rule "size" > 0 (or >= 1024 for minimum size)
// Panel will automatically detect if size is 0 or too small
https.request(\`https://deadmanping.com/api/ping/backup-daily?size=\${fileSize}\`, { method: 'POST' }).end();`}
                  language="javascript"
                />
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Monitoring Empty Backup Files
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding file size checks to your backup script, use a dead man switch to monitor whether the check completed successfully. If your script detects an empty file and exits with error code, the ping never arrives, and you get an alert.
                </p>
                <p className="text-muted-foreground mb-4">
                  Include the file size in your ping payload so you can track backup sizes over time and detect gradual decreases that might indicate problems.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Working Examples
                </h2>
                <p className="text-muted-foreground mb-4">
                  See complete, working code examples in our GitHub repository:
                </p>
                <Link
                  href="https://github.com/DeadManPing/examples"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-2"
                >
                  View Examples on GitHub →
                </Link>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Start Monitoring Backup File Sizes
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your backup verification completes. Set up monitoring in 2 minutes, get alerts when backups are empty or too small.
                  </p>
                  <Link
                    href="/auth/signup"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift"
                  >
                    Start Monitoring Free
                  </Link>
                </div>
              </section>
            </AnimatedSection>

            <RelatedArticles slug="detect-empty-backup-file-cron" />
          </div>
        </article>
      </main>
    </div>
  )
}
