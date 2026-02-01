import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'
import { createArticleSchema, createBreadcrumbSchema } from '@/lib/seo-helpers'
import { RelatedArticles } from '@/components/RelatedArticles'
import { CodeBlock } from '@/components/CodeBlock'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Detect Empty Backup File | DeadManPing",
  description: "How to detect when backup files are empty or zero bytes. Examples for verifying backup file size in bash, Python, Node.js.",
  keywords: "detect empty backup file, empty backup file detection, verify backup file not empty, backup file zero bytes, check backup file size, detect zero byte backup",
  openGraph: {
    title: "Detect Empty Backup File | DeadManPing",
    description: "How to detect when backup files are empty or zero bytes.",
    type: "article",
    url: `${cleanBaseUrl}/blog/detect-empty-backup-file`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect Empty Backup File | DeadManPing",
    description: "How to detect when backup files are empty or zero bytes.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/detect-empty-backup-file`,
  },
}

export default function DetectEmptyBackupFilePage() {
  const structuredData = createArticleSchema({
    slug: "detect-empty-backup-file",
    headline: "Detect Empty Backup File: Verify Backup Files Aren't Zero Bytes",
    description: "Complete guide on detecting when backup files are empty or zero bytes and how to monitor this automatically.",
    keywords: "detect empty backup file, empty backup file detection, verify backup file not empty, backup file zero bytes, check backup file size, detect zero byte backup",
    articleSection: "Backup Monitoring Guides"
  })

  const breadcrumbSchema = createBreadcrumbSchema({
    slug: "detect-empty-backup-file",
    title: "Detect Empty Backup File"
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
              Detect Empty Backup File: Verify Files Aren't Zero Bytes
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your backup script completes successfully, but the backup file is empty. Learn how to detect zero-byte backup files automatically.
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
                <CodeBlock
                  code={`#!/bin/bash
BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql.gz"
pg_dump mydb | gzip > "$BACKUP_FILE"

# Get file data
FILE_EXISTS=0
FILE_SIZE=0
if [ -f "$BACKUP_FILE" ]; then
  FILE_EXISTS=1
  FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
fi

# Single ping with file data in payload
# In DeadManPing panel: set validation rules:
#   - "file_exists" == 1
#   - "size" > 0
# Panel will automatically detect if file is missing or empty
curl -X POST "https://deadmanping.com/api/ping/backup-daily?file_exists=$FILE_EXISTS&size=$FILE_SIZE"`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Verify File Size
                </h3>
                <CodeBlock
                  code={`import os
import subprocess
import requests

backup_file = "/backups/db-backup.sql.gz"
subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file.replace('.gz', ''), "w"))
subprocess.run(["gzip", backup_file.replace('.gz', '')])

# Get file data
file_exists = os.path.exists(backup_file)
file_size = os.path.getsize(backup_file) if file_exists else 0

# Single ping with file data in payload
# In DeadManPing panel: set validation rules:
#   - "file_exists" == True
#   - "size" > 0
# Panel will automatically detect if file is missing or empty
requests.post(f"https://deadmanping.com/api/ping/backup-daily?file_exists={file_exists}&size={file_size}")`}
                  language="python"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Check File Statistics
                </h3>
                <CodeBlock
                  code={`const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

const backupFile = '/backups/db-backup.sql.gz';
execSync(\`pg_dump mydb | gzip > \${backupFile}\`);

// Get file data
let fileExists = fs.existsSync(backupFile);
let fileSize = 0;
if (fileExists) {
  fileSize = fs.statSync(backupFile).size;
}

// Single ping with file data in payload
// In DeadManPing panel: set validation rules:
//   - "file_exists" == true
//   - "size" > 0
// Panel will automatically detect if file is missing or empty
https.request(\`https://deadmanping.com/api/ping/backup-daily?file_exists=\${fileExists}&size=\${fileSize}\`, { method: 'POST' }).end();`}
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
                <p className="text-muted-foreground mb-6">
                  Include the file size in your ping payload so you can track backup sizes over time and detect gradual decreases that might indicate problems.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Monitor Empty Backup Files
                </h3>
                <CodeBlock
                  code={`#!/bin/bash
BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql.gz"
pg_dump mydb | gzip > "$BACKUP_FILE"

# Get file data
FILE_EXISTS=0
FILE_SIZE=0
if [ -f "$BACKUP_FILE" ]; then
  FILE_EXISTS=1
  FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
fi

# Validate file size - exit if empty
if [ "$FILE_SIZE" -eq 0 ]; then
  echo "Error: Backup file is empty!"
  exit 1
fi

# Single ping with file data in payload
# In DeadManPing panel: set validation rules:
#   - "file_exists" == 1
#   - "size" > 0
# Panel will automatically detect if file is missing or empty
curl -X POST "https://deadmanping.com/api/ping/backup-daily?file_exists=$FILE_EXISTS&size=$FILE_SIZE"`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Monitor Empty Backup Files
                </h3>
                <CodeBlock
                  code={`import os
import subprocess
import requests
import sys

backup_file = "/backups/db-backup.sql.gz"
subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file.replace('.gz', ''), "w"))
subprocess.run(["gzip", backup_file.replace('.gz', '')])

# Get file data
file_exists = os.path.exists(backup_file)
file_size = os.path.getsize(backup_file) if file_exists else 0

# Validate file size - exit if empty
if file_size == 0:
    print("Error: Backup file is empty!")
    sys.exit(1)

# Single ping with file data in payload
# In DeadManPing panel: set validation rules:
#   - "file_exists" == True
#   - "size" > 0
# Panel will automatically detect if file is missing or empty
requests.post(f"https://deadmanping.com/api/ping/backup-daily?file_exists={file_exists}&size={file_size}")`}
                  language="python"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Monitor Empty Backup Files
                </h3>
                <CodeBlock
                  code={`const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

const backupFile = '/backups/db-backup.sql.gz';
execSync(\`pg_dump mydb | gzip > \${backupFile}\`);

// Get file data
let fileExists = fs.existsSync(backupFile);
let fileSize = 0;
if (fileExists) {
  fileSize = fs.statSync(backupFile).size;
}

// Validate file size - exit if empty
if (fileSize === 0) {
  console.error('Error: Backup file is empty!');
  process.exit(1);
}

// Single ping with file data in payload
// In DeadManPing panel: set validation rules:
//   - "file_exists" == true
//   - "size" > 0
// Panel will automatically detect if file is missing or empty
https.request(\`https://deadmanping.com/api/ping/backup-daily?file_exists=\${fileExists}&size=\${fileSize}\`, { method: 'POST' }).end();`}
                  language="javascript"
                />
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
                    Start Detecting Empty Backup Files
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your backup file verification completes. Set up monitoring in 2 minutes, get alerts when backups are empty or too small. Use dead man switch to monitor empty backups automatically.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/auth/signup"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Start Monitoring Free
                    </Link>
                    <Link
                      href="/backup-dead-man-switch"
                      className="border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Learn About Backup Dead Man Switch
                    </Link>
                  </div>
                </div>
              </section>
            </AnimatedSection>

            <RelatedArticles slug="detect-empty-backup-file" />
          </div>
        </article>
      </main>
    </div>
  )
}
