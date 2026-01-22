import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Cron Job Not Executing | DeadManPing",
  description: "How to detect when cron jobs are not executing. Examples for verifying job execution and detecting when jobs don't run.",
  keywords: "cron job not executing, detect cron job not running, verify cron job executed, cron job not running detection, detect cron job not executing",
  openGraph: {
    title: "Cron Job Not Executing | DeadManPing",
    description: "How to detect when cron jobs are not executing.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Job Not Executing | DeadManPing",
    description: "How to detect when cron jobs are not executing.",
  },
  alternates: {
    canonical: "/blog/cron-job-not-executing",
  },
}

export default function CronJobNotExecutingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cron Job Not Executing: Detect When Jobs Don't Run",
    "description": "Complete guide on detecting when cron jobs are not executing and how to verify job execution.",
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
              Cron Job Not Executing: Detect When Jobs Don't Run
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job is scheduled, but it's not executing. Learn how to detect when jobs don't run and verify execution.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why Jobs Don't Execute
                </h2>
                <p className="text-muted-foreground mb-4">
                  Cron jobs can be scheduled but not execute:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Cron daemon stops running</li>
                  <li>System time changes</li>
                  <li>Job disabled in crontab</li>
                  <li>User account locked</li>
                  <li>System powered off</li>
                  <li>Resource limits prevent execution</li>
                  <li>Syntax errors in crontab</li>
                </ul>
                <p className="text-muted-foreground">
                  Without explicit confirmation, you have no way to know if the job actually ran.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Detect Non-Execution
                </h2>
                <p className="text-muted-foreground mb-4">
                  Send an explicit ping at the start and end of your job. If the ping doesn't arrive, you know the job didn't execute. The ping must be inside your script.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Ping on Execution
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>set -e</div>
                    <div></div>
                    <div># Ping at start to confirm job began</div>
                    <div></div>
                    <div># Your actual work</div>
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
                    <div>import datetime</div>
                    <div></div>
                    <div># Your actual work</div>
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
                  Detecting Non-Execution with Dead Man Switch
                </h2>
                <p className="text-muted-foreground mb-4">
                  A dead man switch detects non-execution by monitoring whether your explicit ping arrives. If the ping doesn't arrive within the expected interval, you know the job didn't execute.
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
                    Start Detecting Non-Execution
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your execution pings arrive. Set up monitoring in 2 minutes, get alerts when jobs don't execute.
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
