import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Cron Job Exit Status Check | DeadManPing",
  description: "How to check cron job exit status and verify jobs completed successfully. Examples for validating exit codes.",
  keywords: "cron job exit status check, check cron job exit status, verify cron job exit status, cron job exit code check, validate cron job exit status",
  openGraph: {
    title: "Cron Job Exit Status Check | DeadManPing",
    description: "How to check cron job exit status and verify jobs completed successfully.",
    type: "article",
    url: `${cleanBaseUrl}/blog/cron-job-exit-status-check`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Job Exit Status Check | DeadManPing",
    description: "How to check cron job exit status and verify jobs completed successfully.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/cron-job-exit-status-check`,
  },
}

export default function CronJobExitStatusCheckPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "url": `${cleanBaseUrl}/blog/cron-job-exit-status-check`,
    "headline": "Cron Job Exit Status Check: Verify Job Completion",
    "description": "Complete guide on checking cron job exit status and verifying jobs completed successfully.",
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
              Cron Job Exit Status Check: Verify Job Completion
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job completes, but did it exit with the correct status? Learn how to check exit status and verify jobs completed successfully.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Understanding Exit Status
                </h2>
                <p className="text-muted-foreground mb-4">
                  Exit status indicates job completion:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Exit 0</strong> - Success</li>
                  <li><strong>Exit 1</strong> - General error</li>
                  <li><strong>Exit 2</strong> - Misuse of command</li>
                  <li><strong>Any non-zero</strong> - Failure</li>
                </ul>
                <p className="text-muted-foreground">
                  Always check exit status after running commands to verify they completed successfully.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Check Exit Status
                </h2>
                <p className="text-muted-foreground mb-4">
                  Check exit status after each command. The check must be inside your script, not in the cron line.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Check Exit Status
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>set -e  # Exit on error</div>
                    <div></div>
                    <div># Run command</div>
                    <div>./backup.sh</div>
                    <div>EXIT_STATUS=$?</div>
                    <div></div>
                    <div># Single ping with exit status in payload</div>
                    <div># In DeadManPing panel: set validation rule "exit_status" == 0</div>
                    <div># Panel will automatically detect if exit status is non-zero and alert</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?exit_status=$EXIT_STATUS"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Check Return Code
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import subprocess</div>
                    <div>import requests</div>
                    <div>import sys</div>
                    <div></div>
                    <div>result = subprocess.run(['./backup.sh'])</div>
                    <div></div>
                    <div># Single ping with exit status in payload</div>
                    <div># In DeadManPing panel: set validation rule "exit_status" == 0</div>
                    <div># Panel will automatically detect if exit status is non-zero and alert</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/backup-daily?exit_status={'{'}result.returncode{'}'}")</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Monitoring Exit Status
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding exit status checks to your scripts, use a dead man switch to monitor whether checks completed successfully. If your script detects a non-zero exit status and exits with error, the ping never arrives, and you get an alert.
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
                    Start Checking Exit Status
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your exit status checks complete. Set up monitoring in 2 minutes, get alerts when jobs exit with non-zero status.
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
