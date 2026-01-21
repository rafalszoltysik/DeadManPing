import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Detect Cron Job Skipped | DeadManPing",
  description: "How to detect when cron jobs are skipped—not executed when they should be. Examples for detecting skipped jobs.",
  keywords: "detect cron job skipped, cron job skipped detection, verify cron job not skipped, detect skipped cron job, cron job skip detection",
  openGraph: {
    title: "Detect Cron Job Skipped | DeadManPing",
    description: "How to detect when cron jobs are skipped—not executed when they should be.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect Cron Job Skipped | DeadManPing",
    description: "How to detect when cron jobs are skipped—not executed when they should be.",
  },
  alternates: {
    canonical: "/detect-cron-job-skipped",
  },
}

export default function DetectCronJobSkippedPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Detect Cron Job Skipped: Catch Jobs That Don't Run",
    "description": "Complete guide on detecting when cron jobs are skipped and not executed when they should be.",
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
              Detect Cron Job Skipped: Catch Jobs That Don't Run
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job should run, but it's being skipped. Learn how to detect when jobs are skipped and verify execution.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why Jobs Get Skipped
                </h2>
                <p className="text-muted-foreground mb-4">
                  Cron jobs can be skipped:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Previous job still running</li>
                  <li>System overload prevents execution</li>
                  <li>Cron daemon skips due to resource limits</li>
                  <li>Job disabled temporarily</li>
                  <li>System time changes cause schedule confusion</li>
                </ul>
                <p className="text-muted-foreground">
                  Without explicit execution confirmation, you can't tell if the job was skipped.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Detect Skipped Jobs
                </h2>
                <p className="text-muted-foreground mb-4">
                  Send an explicit ping when your job executes. If the ping doesn't arrive at the expected time, you know the job was skipped. The ping must be inside your script.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Ping on Execution
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>set -e</div>
                    <div></div>
                    <div># Ping immediately to confirm job started</div>
                    <div># Your work</div>
                    <div>./backup.sh</div>
                    <div></div>
                    <div># Single ping at end - if job fails, ping won't arrive and DeadManPing will alert</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Execution Confirmation
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import requests</div>
                    <div></div>
                    <div># Your work</div>
                    <div>perform_backup()</div>
                    <div></div>
                    <div># Single ping at end - if job fails, ping won't arrive and DeadManPing will alert</div>
                    <div>requests.post("https://deadmanping.com/api/ping/backup-daily")</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Detecting Skipped Jobs with Dead Man Switch
                </h2>
                <p className="text-muted-foreground mb-4">
                  A dead man switch detects skipped jobs by monitoring whether your explicit ping arrives at the expected time. If the ping doesn't arrive, you know the job was skipped.
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
                  href="https://github.com/BlackPearl02/deadmanping-examples"
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
                    Start Detecting Skipped Jobs
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your execution pings arrive. Set up monitoring in 2 minutes, get alerts when jobs are skipped.
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
