import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Detect Cron Job Partial Failure | DeadManPing",
  description: "How to detect when cron jobs partially fail—some steps succeed but others fail. Examples for validating multi-step job completion.",
  keywords: "detect cron job partial failure, cron job partial failure detection, verify cron job complete, detect incomplete cron job, cron job partial success",
  openGraph: {
    title: "Detect Cron Job Partial Failure | DeadManPing",
    description: "How to detect when cron jobs partially fail—some steps succeed but others fail.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect Cron Job Partial Failure | DeadManPing",
    description: "How to detect when cron jobs partially fail—some steps succeed but others fail.",
  },
  alternates: {
    canonical: "/blog/detect-cron-job-partial-failure",
  },
}

export default function DetectCronJobPartialFailurePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Detect Cron Job Partial Failure: Verify All Steps Complete",
    "description": "Complete guide on detecting when cron jobs partially fail—some steps succeed but others fail.",
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
    <div className="min-h-screen bg-transparent text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Detect Cron Job Partial Failure: Verify All Steps Complete
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job runs multiple steps, but some succeed while others fail. Learn how to detect partial failures and ensure all steps complete.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: Partial Failures
                </h2>
                <p className="text-muted-foreground mb-4">
                  Multi-step cron jobs can partially fail:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>First step succeeds, second step fails, but script continues</li>
                  <li>Some files process successfully, others fail silently</li>
                  <li>Database backup succeeds, but file sync fails</li>
                  <li>API calls succeed but data validation fails</li>
                  <li>Script exits with code 0 even when steps fail</li>
                </ul>
                <p className="text-muted-foreground">
                  Without checking each step, you might think the job succeeded when it actually partially failed.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Verify Each Step
                </h2>
                <p className="text-muted-foreground mb-4">
                  Check the result of each step explicitly. Don't rely on exit codes alone—verify that each step produced expected results.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Check Each Step
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>set -e</div>
                    <div>FAILED_STEPS=()</div>
                    <div></div>
                    <div># Step 1: Backup database</div>
                    <div>if ! pg_dump mydb &gt; /backups/db.sql; then</div>
                    <div>  FAILED_STEPS+=("database_backup")</div>
                    <div>fi</div>
                    <div></div>
                    <div># Step 2: Sync files</div>
                    <div>if ! rsync -avz /data/ user@server:/backup/; then</div>
                    <div>  FAILED_STEPS+=("file_sync")</div>
                    <div>fi</div>
                    <div></div>
                    <div># Step 3: Send report</div>
                    <div>if ! ./send-report.sh; then</div>
                    <div>  FAILED_STEPS+=("send_report")</div>
                    <div>fi</div>
                    <div></div>
                    <div># Single ping with step completion data in payload</div>
                    <div># In DeadManPing panel: set validation rule "failed_steps_count" == 0</div>
                    <div># Panel will automatically detect if any steps failed</div>
                    <div>FAILED_STEPS_COUNT=${'{'}#FAILED_STEPS[@]{'}'}</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/multi-step?failed_steps_count=$FAILED_STEPS_COUNT"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Track Step Results
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import subprocess</div>
                    <div>import requests</div>
                    <div>import sys</div>
                    <div></div>
                    <div>failed_steps = []</div>
                    <div></div>
                    <div># Step 1</div>
                    <div>if subprocess.run(['pg_dump', 'mydb'], stdout=open('/backups/db.sql', 'w')).returncode != 0:</div>
                    <div>  failed_steps.append('database_backup')</div>
                    <div></div>
                    <div># Step 2</div>
                    <div>if subprocess.run(['rsync', '-avz', '/data/', 'user@server:/backup/']).returncode != 0:</div>
                    <div>  failed_steps.append('file_sync')</div>
                    <div></div>
                    <div># Step 3</div>
                    <div>if subprocess.run(['./send-report.sh']).returncode != 0:</div>
                    <div>  failed_steps.append('send_report')</div>
                    <div></div>
                    <div># Single ping with step completion data in payload</div>
                    <div># In DeadManPing panel: set validation rule "failed_steps_count" == 0</div>
                    <div># Panel will automatically detect if any steps failed</div>
                    <div>failed_steps_count = len(failed_steps)</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/multi-step?failed_steps_count={'{'}failed_steps_count{'}'}")</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Monitoring Partial Failures
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding step verification to your scripts, use a dead man switch to monitor whether all steps completed successfully. If any step fails and your script exits with error code, the ping never arrives, and you get an alert.
                </p>
                <p className="text-muted-foreground mb-4">
                  Include failed step names in your ping payload so you can identify which steps fail most often.
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
                    Start Detecting Partial Failures
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether all steps complete successfully. Set up monitoring in 2 minutes, get alerts when jobs partially fail.
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
