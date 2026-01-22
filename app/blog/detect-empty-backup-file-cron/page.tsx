import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Detect Empty Backup File Cron | DeadManPing",
  description: "How to detect when cron backup jobs create empty files. Examples in bash, Python, Node.js for verifying backup file size.",
  keywords: "detect empty backup file cron, empty backup file detection, cron backup empty file, verify backup file not empty, detect zero byte backup, backup file size check cron",
  openGraph: {
    title: "Detect Empty Backup File Cron | DeadManPing",
    description: "How to detect when cron backup jobs create empty files. Examples in bash, Python, Node.js.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect Empty Backup File Cron | DeadManPing",
    description: "How to detect when cron backup jobs create empty files. Examples in bash, Python, Node.js.",
  },
  alternates: {
    canonical: "/blog/detect-empty-backup-file-cron",
  },
}

export default function DetectEmptyBackupFileCronPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Detect Empty Backup File Cron: How to Verify Backup Files Aren't Empty",
    "description": "Complete guide on detecting when cron backup jobs create empty files and how to monitor this automatically.",
    "author": {
      "@type": "Organization",
      "name": "DeadManPing"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql"</div>
                    <div>pg_dump mydb &gt; "$BACKUP_FILE"</div>
                    <div></div>
                    <div># Get file size</div>
                    <div>FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2&gt;/dev/null || stat -c%s "$BACKUP_FILE" 2&gt;/dev/null || echo 0)</div>
                    <div></div>
                    <div># Single ping with file size in payload</div>
                    <div># In DeadManPing panel: set validation rule "size" &gt; 0 (or &gt;= 1024 for minimum size)</div>
                    <div># Panel will automatically detect if size is 0 or too small</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?size=$FILE_SIZE"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import os</div>
                    <div>import subprocess</div>
                    <div>import requests</div>
                    <div></div>
                    <div>backup_file = f"/backups/db-{'{'}os.popen('date +%Y%m%d').read().strip(){'}'}.sql"</div>
                    <div>subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file, "w"))</div>
                    <div></div>
                    <div># Get file size</div>
                    <div>file_size = os.path.getsize(backup_file) if os.path.exists(backup_file) else 0</div>
                    <div></div>
                    <div># Single ping with file size in payload</div>
                    <div># In DeadManPing panel: set validation rule "size" &gt; 0 (or &gt;= 1024 for minimum size)</div>
                    <div># Panel will automatically detect if size is 0 or too small</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/backup-daily?size={'{'}file_size{'}'}")</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>const fs = require('fs');</div>
                    <div>const {'{'} execSync {'}'} = require(&apos;child_process&apos;);</div>
                    <div>const https = require('https');</div>
                    <div></div>
                    <div>const backupFile = &#96;/backups/db-${'{'}new Date().toISOString().split('T')[0].replace(/-/g, ''){'}'}.sql&#96;;</div>
                    <div>execSync(&#96;pg_dump mydb &gt; ${'{'}backupFile{'}'}&#96;);</div>
                    <div></div>
                    <div>// Get file size</div>
                    <div>let fileSize = 0;</div>
                    <div>try {'{'}</div>
                    <div>  fileSize = fs.statSync(backupFile).size;</div>
                    <div>{'}'} catch (e) {'{'}</div>
                    <div>  // File doesn't exist</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>// Single ping with file size in payload</div>
                    <div>// In DeadManPing panel: set validation rule "size" &gt; 0 (or &gt;= 1024 for minimum size)</div>
                    <div>// Panel will automatically detect if size is 0 or too small</div>
                    <div>https.request(&#96;https://deadmanping.com/api/ping/backup-daily?size=${'{'}fileSize{'}'}&#96;, {'{'} method: 'POST' {'}'}).end();</div>
                  </code>
                </div>
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
          </div>
        </article>
      </main>
    </div>
  )
}
