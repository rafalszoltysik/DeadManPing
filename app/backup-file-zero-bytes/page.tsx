import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Backup File Zero Bytes | DeadManPing",
  description: "How to detect when backup files are zero bytes. Examples for verifying backup file size and detecting empty backups.",
  keywords: "backup file zero bytes, detect zero byte backup, empty backup file detection, backup file zero bytes detection, verify backup file not zero bytes",
  openGraph: {
    title: "Backup File Zero Bytes | DeadManPing",
    description: "How to detect when backup files are zero bytes.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Backup File Zero Bytes | DeadManPing",
    description: "How to detect when backup files are zero bytes.",
  },
  alternates: {
    canonical: "/backup-file-zero-bytes",
  },
}

export default function BackupFileZeroBytesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Backup File Zero Bytes: Detect Empty Backup Files",
    "description": "Complete guide on detecting when backup files are zero bytes and how to prevent empty backups.",
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
              Backup File Zero Bytes: Detect Empty Backup Files
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your backup job completes, but the backup file is zero bytes. Here's how to detect and prevent zero-byte backup files.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why Backup Files Are Zero Bytes
                </h2>
                <p className="text-muted-foreground mb-4">
                  Backup files can be zero bytes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Backup command fails but creates empty file</li>
                  <li>Disk space runs out during backup</li>
                  <li>File permissions prevent writes</li>
                  <li>Backup process is killed</li>
                  <li>Source data is empty</li>
                </ul>
                <p className="text-muted-foreground">
                  Without checking file size, you might think backups are working when they're actually zero bytes.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Detect Zero-Byte Files
                </h2>
                <p className="text-muted-foreground mb-4">
                  Always check file size after backup creation. Verify the file is not zero bytes. The check must be inside your backup script.
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
                    <div># Check if file is zero bytes</div>
                    <div>if [ ! -s "$BACKUP_FILE" ]; then</div>
                    <div>  echo "Error: Backup file is zero bytes"</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/backup-daily?s=fail&m=zero+bytes"</div>
                    <div>  exit 1</div>
                    <div>fi</div>
                    <div></div>
                    <div>FILE_SIZE=$(stat -c%s "$BACKUP_FILE")</div>
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
                    <div># Check if file is zero bytes</div>
                    <div>if os.path.getsize(backup_file) == 0:</div>
                    <div>  requests.post("https://deadmanping.com/api/ping/backup-daily?s=fail&m=zero+bytes")</div>
                    <div>  exit(1)</div>
                    <div></div>
                    <div>file_size = os.path.getsize(backup_file)</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/backup-daily?s=ok&size={'{'}file_size{'}'}")</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Monitoring Zero-Byte Backup Files
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding zero-byte checks to your backup script, use a dead man switch to monitor whether the check completed successfully. If your script detects a zero-byte file and exits with error code, the ping never arrives, and you get an alert.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Start Detecting Zero-Byte Backups
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your backup file verification completes. Set up monitoring in 2 minutes, get alerts when backups are zero bytes.
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
