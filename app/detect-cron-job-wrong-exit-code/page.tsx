import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Detect Cron Job Wrong Exit Code | DeadManPing",
  description: "How to detect when cron jobs return wrong exit codes—success when they should fail, or failure when they should succeed.",
  keywords: "detect cron job wrong exit code, cron job wrong exit code, verify cron job exit code, check cron job exit code, cron job exit code validation",
  openGraph: {
    title: "Detect Cron Job Wrong Exit Code | DeadManPing",
    description: "How to detect when cron jobs return wrong exit codes.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect Cron Job Wrong Exit Code | DeadManPing",
    description: "How to detect when cron jobs return wrong exit codes.",
  },
  alternates: {
    canonical: "/detect-cron-job-wrong-exit-code",
  },
}

export default function DetectCronJobWrongExitCodePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Detect Cron Job Wrong Exit Code: Validate Exit Codes",
    "description": "Complete guide on detecting when cron jobs return wrong exit codes and how to validate them.",
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
              Detect Cron Job Wrong Exit Code: Validate Exit Codes
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job returns exit code 0 (success) when it should fail, or non-zero when it should succeed. Here's how to detect and handle wrong exit codes.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why Exit Codes Can Be Wrong
                </h2>
                <p className="text-muted-foreground mb-4">
                  Scripts can return wrong exit codes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Script catches all exceptions and exits with 0</li>
                  <li>Command succeeds but produces wrong results</li>
                  <li>Script doesn't check command exit codes</li>
                  <li>Error handling sets wrong exit codes</li>
                  <li>Pipes mask exit codes</li>
                </ul>
                <p className="text-muted-foreground">
                  Don't trust exit codes alone—verify that work was actually completed.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Validate Results, Not Just Exit Codes
                </h2>
                <p className="text-muted-foreground mb-4">
                  After running commands, verify that expected results exist. Check file sizes, validate output content, confirm data was written. The validation must be inside your script.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Verify Results
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>BACKUP_FILE="/backups/db.sql"</div>
                    <div></div>
                    <div># Run backup</div>
                    <div>pg_dump mydb &gt; "$BACKUP_FILE"</div>
                    <div>EXIT_CODE=$?</div>
                    <div></div>
                    <div># Check exit code</div>
                    <div>if [ $EXIT_CODE -ne 0 ]; then</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/backup?s=fail&code=$EXIT_CODE"</div>
                    <div>  exit $EXIT_CODE</div>
                    <div>fi</div>
                    <div></div>
                    <div># Verify backup file exists and has content</div>
                    <div>if [ ! -f "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then</div>
                    <div>  # Exit code was 0 but backup failed</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/backup?s=fail&m=wrong+exit+code"</div>
                    <div>  exit 1</div>
                    <div>fi</div>
                    <div></div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup?s=ok"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Validate After Execution
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import subprocess</div>
                    <div>import os</div>
                    <div>import requests</div>
                    <div>import sys</div>
                    <div></div>
                    <div>backup_file = "/backups/db.sql"</div>
                    <div></div>
                    <div># Run backup</div>
                    <div>result = subprocess.run(['pg_dump', 'mydb'], stdout=open(backup_file, 'w'))</div>
                    <div></div>
                    <div># Check exit code</div>
                    <div>if result.returncode != 0:</div>
                    <div>  requests.post(f"https://deadmanping.com/api/ping/backup?s=fail&code={'{'}result.returncode{'}'}")</div>
                    <div>  sys.exit(result.returncode)</div>
                    <div></div>
                    <div># Verify backup file</div>
                    <div>if not os.path.exists(backup_file) or os.path.getsize(backup_file) == 0:</div>
                    <div>  # Exit code was 0 but backup failed</div>
                    <div>  requests.post("https://deadmanping.com/api/ping/backup?s=fail&m=wrong+exit+code")</div>
                    <div>  sys.exit(1)</div>
                    <div></div>
                    <div>requests.post("https://deadmanping.com/api/ping/backup?s=ok")</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Monitoring Wrong Exit Codes
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding result validation to your scripts, use a dead man switch to monitor whether validation completed successfully. If your script detects wrong exit codes and exits with error, the ping never arrives, and you get an alert.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Start Detecting Wrong Exit Codes
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your exit code validation completes. Set up monitoring in 2 minutes, get alerts when jobs return wrong exit codes.
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
