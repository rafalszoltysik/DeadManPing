import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'
import { createArticleSchema, createBreadcrumbSchema } from '@/lib/seo-helpers'
import { RelatedArticles } from '@/components/RelatedArticles'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Detect Backup File Missing | DeadManPing",
  description: "How to detect when backup files are missing after backup jobs complete. Examples for verifying backup file existence.",
  keywords: "detect backup file missing, backup file missing detection, verify backup file exists, check backup file missing, detect missing backup file",
  openGraph: {
    title: "Detect Backup File Missing | DeadManPing",
    description: "How to detect when backup files are missing after backup jobs complete.",
    type: "article",
    url: `${cleanBaseUrl}/blog/detect-backup-file-missing`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect Backup File Missing | DeadManPing",
    description: "How to detect when backup files are missing after backup jobs complete.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/detect-backup-file-missing`,
  },
}

export default function DetectBackupFileMissingPage() {
  const structuredData = createArticleSchema({
    slug: "detect-backup-file-missing",
    headline: "Detect Backup File Missing: Verify Backup Files Exist",
    description: "Complete guide on detecting when backup files are missing after backup jobs complete.",
    keywords: "detect backup file missing, backup file missing detection, verify backup file exists, check backup file missing, detect missing backup file",
    articleSection: "Backup Monitoring Guides"
  })

  const breadcrumbSchema = createBreadcrumbSchema({
    slug: "detect-backup-file-missing",
    title: "Detect Backup File Missing"
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
              Detect Backup File Missing: Verify Backup Files Exist
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your backup job completes successfully, but the backup file is missing. Learn how to detect missing backup files automatically.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why Backup Files Can Be Missing
                </h2>
                <p className="text-muted-foreground mb-4">
                  Backup files can be missing even when jobs complete:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Backup script fails before creating file</li>
                  <li>File permissions prevent file creation</li>
                  <li>Disk space runs out during backup</li>
                  <li>Backup script writes to wrong location</li>
                  <li>File gets deleted immediately after creation</li>
                  <li>Network issues prevent remote file creation</li>
                </ul>
                <p className="text-muted-foreground">
                  Without checking file existence, you might think backups are working when files don't exist.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Detect Missing Files
                </h2>
                <p className="text-muted-foreground mb-4">
                  Always verify backup file exists after backup creation. Check file existence immediately after the backup command completes. The check must be inside your backup script.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Verify File Exists
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql.gz"</div>
                    <div></div>
                    <div>pg_dump mydb | gzip &gt; "$BACKUP_FILE"</div>
                    <div></div>
                    <div># Get file data</div>
                    <div>FILE_EXISTS=0</div>
                    <div>FILE_SIZE=0</div>
                    <div>if [ -f "$BACKUP_FILE" ]; then</div>
                    <div>  FILE_EXISTS=1</div>
                    <div>  FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2&gt;/dev/null || stat -c%s "$BACKUP_FILE")</div>
                    <div>fi</div>
                    <div></div>
                    <div># Single ping with file data in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "file_exists" == 1</div>
                    <div>#   - "size" &gt; 0</div>
                    <div># Panel will automatically detect if file is missing or empty</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?file_exists=$FILE_EXISTS&size=$FILE_SIZE"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Check File Existence
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import os</div>
                    <div>import subprocess</div>
                    <div>import requests</div>
                    <div></div>
                    <div>backup_file = "/backups/db-backup.sql.gz"</div>
                    <div></div>
                    <div>subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file.replace('.gz', ''), "w"))</div>
                    <div>subprocess.run(["gzip", backup_file.replace('.gz', '')])</div>
                    <div></div>
                    <div># Get file data</div>
                    <div>file_exists = os.path.exists(backup_file)</div>
                    <div>file_size = os.path.getsize(backup_file) if file_exists else 0</div>
                    <div></div>
                    <div># Single ping with file data in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "file_exists" == True</div>
                    <div>#   - "size" &gt; 0</div>
                    <div># Panel will automatically detect if file is missing or empty</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/backup-daily?file_exists={'{'}file_exists{'}'}&size={'{'}file_size{'}'}")</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Monitoring Missing Backup Files
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding file existence checks to your backup script, use a dead man switch to monitor whether the check completed successfully. If your script detects a missing file and exits with error code, the ping never arrives, and you get an alert.
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
                    Start Detecting Missing Backup Files
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your backup file verification completes. Set up monitoring in 2 minutes, get alerts when backup files are missing.
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

            <RelatedArticles slug="detect-backup-file-missing" />
          </div>
        </article>
      </main>
    </div>
  )
}
