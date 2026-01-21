import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Detect Empty Backup File | DeadManPing",
  description: "How to detect when backup files are empty or zero bytes. Examples for verifying backup file size in bash, Python, Node.js.",
  keywords: "detect empty backup file, empty backup file detection, verify backup file not empty, backup file zero bytes, check backup file size, detect zero byte backup",
  openGraph: {
    title: "Detect Empty Backup File | DeadManPing",
    description: "How to detect when backup files are empty or zero bytes.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect Empty Backup File | DeadManPing",
    description: "How to detect when backup files are empty or zero bytes.",
  },
  alternates: {
    canonical: "/detect-empty-backup-file",
  },
}

export default function DetectEmptyBackupFilePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Detect Empty Backup File: Verify Backup Files Aren't Zero Bytes",
    "description": "Complete guide on detecting when backup files are empty or zero bytes and how to monitor this automatically.",
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
              Detect Empty Backup File: Verify Files Aren't Zero Bytes
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your backup script completes successfully, but the backup file is empty. Here's how to detect zero-byte backup files automatically.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why Backup Files Can Be Empty
                </h2>
                <p className="text-muted-foreground mb-4">
                  Backup files can be created but remain empty for several reasons:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Database connection fails but script doesn't check before writing</li>
                  <li>Disk space runs out during backup, leaving empty file</li>
                  <li>File permissions prevent writes, but script doesn't verify</li>
                  <li>Backup process is killed mid-operation</li>
                  <li>Source data is empty but backup script doesn't validate</li>
                  <li>Compression fails silently, leaving empty archive</li>
                </ul>
                <p className="text-muted-foreground">
                  Without checking file size, you might think backups are working when they're actually empty.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Detect Empty Backup Files
                </h2>
                <p className="text-muted-foreground mb-4">
                  Check file size immediately after backup creation. Use file size checks, not just file existence. The check must be inside your backup script, not in the cron line.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Check File Size
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql.gz"</div>
                    <div>pg_dump mydb | gzip &gt; "$BACKUP_FILE"</div>
                    <div></div>
                    <div># Check if file exists</div>
                    <div>if [ ! -f "$BACKUP_FILE" ]; then</div>
                    <div>  echo "Error: Backup file not created"</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/backup-daily?s=fail&m=file+not+created"</div>
                    <div>  exit 1</div>
                    <div>fi</div>
                    <div></div>
                    <div># Check if file is empty (zero bytes)</div>
                    <div>if [ ! -s "$BACKUP_FILE" ]; then</div>
                    <div>  echo "Error: Backup file is empty"</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/backup-daily?s=fail&m=empty+file"</div>
                    <div>  exit 1</div>
                    <div>fi</div>
                    <div></div>
                    <div># Get file size and verify minimum size</div>
                    <div>FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2&gt;/dev/null || stat -c%s "$BACKUP_FILE")</div>
                    <div>if [ "$FILE_SIZE" -lt 1024 ]; then</div>
                    <div>  echo "Error: Backup file too small: $FILE_SIZE bytes"</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/backup-daily?s=fail&m=file+too+small+$FILE_SIZE"</div>
                    <div>  exit 1</div>
                    <div>fi</div>
                    <div></div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?s=ok&size=$FILE_SIZE"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Verify File Size
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import os</div>
                    <div>import subprocess</div>
                    <div>import requests</div>
                    <div></div>
                    <div>backup_file = "/backups/db-backup.sql.gz"</div>
                    <div>subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file.replace('.gz', ''), "w"))</div>
                    <div>subprocess.run(["gzip", backup_file.replace('.gz', '')])</div>
                    <div></div>
                    <div># Check file exists</div>
                    <div>if not os.path.exists(backup_file):</div>
                    <div>  requests.post("https://deadmanping.com/api/ping/backup-daily?s=fail&m=file+not+created")</div>
                    <div>  exit(1)</div>
                    <div></div>
                    <div># Check file size</div>
                    <div>file_size = os.path.getsize(backup_file)</div>
                    <div>if file_size == 0:</div>
                    <div>  requests.post("https://deadmanping.com/api/ping/backup-daily?s=fail&m=empty+file")</div>
                    <div>  exit(1)</div>
                    <div></div>
                    <div># Verify minimum size (e.g., 1KB)</div>
                    <div>if file_size &lt; 1024:</div>
                    <div>  requests.post(f"https://deadmanping.com/api/ping/backup-daily?s=fail&m=file+too+small+{'{'}file_size{'}'}")</div>
                    <div>  exit(1)</div>
                    <div></div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/backup-daily?s=ok&size={'{'}file_size{'}'}")</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Check File Statistics
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>const fs = require('fs');</div>
                    <div>const { execSync } = require('child_process');</div>
                    <div>const https = require('https');</div>
                    <div></div>
                    <div>const backupFile = '/backups/db-backup.sql.gz';</div>
                    <div>execSync(`pg_dump mydb | gzip &gt; ${'{'}backupFile{'}'}`);</div>
                    <div></div>
                    <div>// Check file exists</div>
                    <div>if (!fs.existsSync(backupFile)) {'{'}</div>
                    <div>  https.request('https://deadmanping.com/api/ping/backup-daily?s=fail&m=file+not+created', {'{'} method: 'POST' {'}'}).end();</div>
                    <div>  process.exit(1);</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>// Check file size</div>
                    <div>const stats = fs.statSync(backupFile);</div>
                    <div>if (stats.size === 0) {'{'}</div>
                    <div>  https.request('https://deadmanping.com/api/ping/backup-daily?s=fail&m=empty+file', {'{'} method: 'POST' {'}'}).end();</div>
                    <div>  process.exit(1);</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>// Verify minimum size</div>
                    <div>if (stats.size &lt; 1024) {'{'}</div>
                    <div>  https.request(`https://deadmanping.com/api/ping/backup-daily?s=fail&m=file+too+small+${'{'}stats.size{'}'}`, {'{'} method: 'POST' {'}'}).end();</div>
                    <div>  process.exit(1);</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>https.request(`https://deadmanping.com/api/ping/backup-daily?s=ok&size=${'{'}stats.size{'}'}`, {'{'} method: 'POST' {'}'}).end();</div>
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
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Start Detecting Empty Backup Files
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your backup file verification completes. Set up monitoring in 2 minutes, get alerts when backups are empty or too small.
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
