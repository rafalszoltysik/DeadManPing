import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'
import { createArticleSchema, createBreadcrumbSchema } from '@/lib/seo-helpers'
import { RelatedArticles } from '@/components/RelatedArticles'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Verify Backup File Size - Catch Empty and Undersized Backups",
  description: "Verify backup file sizes are within expected ranges. Catch empty and undersized backups before you need to restore. Bash, Python, Node.js examples.",
  keywords: "verify backup file size, check backup file size, backup file size validation, verify backup file not empty, check backup file size cron, backup file size check",
  openGraph: {
    title: "Verify Backup File Size - Catch Empty and Undersized Backups",
    description: "How to verify backup file sizes are within expected ranges.",
    type: "article",
    url: `${cleanBaseUrl}/blog/verify-backup-file-size`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify Backup File Size - Catch Empty and Undersized Backups",
    description: "How to verify backup file sizes are within expected ranges.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/verify-backup-file-size`,
  },
}

export default function VerifyBackupFileSizePage() {
  const structuredData = createArticleSchema({
    slug: "verify-backup-file-size",
    headline: "Verify Backup File Size: Ensure Backups Are Complete",
    description: "Complete guide on verifying backup file sizes are within expected ranges and detecting when backups are too small or too large.",
    keywords: "verify backup file size, check backup file size, backup file size validation, verify backup file not empty, check backup file size cron, backup file size check",
    articleSection: "Backup Monitoring Guides"
  })

  const breadcrumbSchema = createBreadcrumbSchema({
    slug: "verify-backup-file-size",
    title: "Verify Backup File Size"
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
              Verify Backup File Size: Ensure Backups Are Complete
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your backup completes, but is the file size reasonable? Learn how to verify backup file sizes and detect when backups are too small or suspiciously large.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why File Size Matters
                </h2>
                <p className="text-muted-foreground mb-4">
                  Backup file sizes can indicate problems:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Too small</strong> - Backup might be empty or incomplete</li>
                  <li><strong>Too large</strong> - Backup might include unnecessary data or be corrupted</li>
                  <li><strong>Unexpected change</strong> - Sudden size changes might indicate data loss or corruption</li>
                  <li><strong>Zero bytes</strong> - Backup definitely failed</li>
                  <li><strong>Much smaller than previous</strong> - Data might be missing</li>
                </ul>
                <p className="text-muted-foreground">
                  Checking file size helps catch backup failures that exit codes miss.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Verify File Size
                </h2>
                <p className="text-muted-foreground mb-4">
                  Check file size after backup creation. Compare against minimum expected size, maximum expected size, or previous backup sizes. The check must be inside your backup script, not in the cron line.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Check Minimum and Maximum Size
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql.gz"</div>
                    <div>MIN_SIZE=1048576  # 1MB minimum</div>
                    <div>MAX_SIZE=10737418240  # 10GB maximum</div>
                    <div></div>
                    <div>pg_dump mydb | gzip &gt; "$BACKUP_FILE"</div>
                    <div></div>
                    <div># Get file size</div>
                    <div>FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2&gt;/dev/null || stat -c%s "$BACKUP_FILE")</div>
                    <div></div>
                    <div># Single ping with file size in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "size" &gt;= 1048576 (1MB minimum)</div>
                    <div>#   - "size" &lt;= 10737418240 (10GB maximum)</div>
                    <div># Panel will automatically detect if size is outside range</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?size=$FILE_SIZE"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Compare with Previous Backup
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import os</div>
                    <div>import glob</div>
                    <div>import subprocess</div>
                    <div>import requests</div>
                    <div></div>
                    <div>backup_file = "/backups/db-backup.sql.gz"</div>
                    <div>subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file.replace('.gz', ''), "w"))</div>
                    <div>subprocess.run(["gzip", backup_file.replace('.gz', '')])</div>
                    <div></div>
                    <div># Get current file size</div>
                    <div>current_size = os.path.getsize(backup_file)</div>
                    <div></div>
                    <div># Find previous backup</div>
                    <div>previous_backups = sorted(glob.glob("/backups/db-*.sql.gz"), reverse=True)</div>
                    <div>if len(previous_backups) &gt; 1:</div>
                    <div>  previous_size = os.path.getsize(previous_backups[1])</div>
                    <div>  </div>
                    <div># Single ping with file size in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "size" &gt;= 1048576 (1MB minimum)</div>
                    <div>#   - "size" &lt;= 10737418240 (10GB maximum)</div>
                    <div># Panel will automatically detect if size is outside range</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/backup-daily?size={'{'}current_size{'}'}")</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Size Range Validation
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>const fs = require('fs');</div>
                    <div>const {'{'} execSync {'}'} = require(&apos;child_process&apos;);</div>
                    <div>const https = require('https');</div>
                    <div></div>
                    <div>const backupFile = '/backups/db-backup.sql.gz';</div>
                    <div>const MIN_SIZE = 1024 * 1024;  // 1MB</div>
                    <div>const MAX_SIZE = 10 * 1024 * 1024 * 1024;  // 10GB</div>
                    <div></div>
                    <div>execSync(&#96;pg_dump mydb | gzip &gt; ${'{'}backupFile{'}'}&#96;);</div>
                    <div></div>
                    <div>// Get file size</div>
                    <div>const stats = fs.statSync(backupFile);</div>
                    <div></div>
                    <div>// Single ping with file size in payload</div>
                    <div>// In DeadManPing panel: set validation rules:</div>
                    <div>//   - "size" &gt;= 1048576 (1MB minimum)</div>
                    <div>//   - "size" &lt;= 10737418240 (10GB maximum)</div>
                    <div>// Panel will automatically detect if size is outside range</div>
                    <div>https.request(&#96;https://deadmanping.com/api/ping/backup-daily?size=${'{'}stats.size{'}'}&#96;, {'{'} method: &apos;POST&apos; {'}'}).end();</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Monitoring Backup File Sizes
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding file size checks to your backup script, use a dead man switch to monitor whether the check completed successfully. If your script detects an invalid file size and exits with error code, the ping never arrives, and you get an alert.
                </p>
                <p className="text-muted-foreground mb-4">
                  Include file sizes in your ping payload so you can track backup sizes over time and detect gradual changes that might indicate problems.
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
                    Start Verifying Backup File Sizes
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your backup file size verification completes. Set up monitoring in 2 minutes, get alerts when backups are wrong size.
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

            <RelatedArticles slug="verify-backup-file-size" />
          </div>
        </article>
      </main>
    </div>
  )
}
