import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'
import { Footer } from '@/components/Footer'
import { CodeBlock } from '@/components/CodeBlock'
import { createArticleSchema, createBreadcrumbSchema } from '@/lib/seo-helpers'
import { RelatedArticles } from '@/components/RelatedArticles'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Detect Hanging Cron Jobs - Timeout & Execution Time Monitoring",
  description: "Your script can hang for hours unnoticed. Detect cron job timeouts and stuck scripts with start/stop tracking. Bash, Python, Node.js examples.",
  keywords: "detect hanging cron job, cron job timeout detection, cron job stuck, script execution time monitoring, detect cron job timeout, prevent hanging jobs, cron job execution time, stuck script detection",
  openGraph: {
    title: "Detect Hanging Cron Jobs - Timeout & Execution Time Monitoring",
    description: "Detect cron job timeouts and stuck scripts with start/stop execution time tracking. Bash, Python, Node.js examples.",
    type: "article",
    url: `${cleanBaseUrl}/blog/detect-hanging-cron-job`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect Hanging Cron Jobs - Timeout & Execution Time Monitoring",
    description: "Detect cron job timeouts and stuck scripts with start/stop execution time tracking.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/detect-hanging-cron-job`,
  },
}

export default function DetectHangingCronJobPage() {
  const structuredData = createArticleSchema({
    slug: "detect-hanging-cron-job",
    headline: "Detect Hanging Cron Job: Timeout & Execution Time Monitoring",
    description: "How to detect when cron jobs hang or run too long. Start/stop tracking and timeout detection with practical examples.",
    keywords: "detect hanging cron job, cron job timeout detection, script execution time monitoring, stuck script detection",
    articleSection: "Cron Monitoring Guides"
  })

  const breadcrumbSchema = createBreadcrumbSchema({
    slug: "detect-hanging-cron-job",
    title: "Detect Hanging Cron Job"
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
              Detect Hanging Cron Job: Timeout & Execution Time Monitoring
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Imagine your backup script starts at 3 AM and never finishes. No error, no log—just a process that blocks for hours. 
              Learn how to detect cron job timeouts and stuck scripts before they cause real damage.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: Scripts That Hang Without Failing
                </h2>
                <p className="text-muted-foreground mb-4">
                  A cron job can &quot;run&quot; but never complete. The process is alive, consuming resources, but stuck on a network call, 
                  a locked file, or a dead database connection. Exit code is never returned. No ping, no alert—until you notice something is wrong.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Script blocks on I/O (API timeout, DB lock, NFS hang)</li>
                  <li>Script runs 5 hours instead of 5 minutes and nobody notices</li>
                  <li>Next scheduled run is skipped because the previous one is still &quot;running&quot;</li>
                  <li>Resource exhaustion: too many stuck processes</li>
                </ul>
                <p className="text-muted-foreground">
                  A simple &quot;ping when done&quot; only tells you the job finished. It doesn&apos;t tell you it took 6 hours. You need to measure time between start and stop.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Start/Stop Tracking and Timeout Detection
                </h2>
                <p className="text-muted-foreground mb-4">
                  Send a <strong>start</strong> signal when the job begins and a <strong>stop</strong> signal (or payload ping) when it ends. 
                  The monitor measures elapsed time. If no stop arrives within your configured timeout, you get an alert—hanging job detected.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Alert if the job doesn&apos;t complete within expected duration (e.g. 30 minutes)</li>
                  <li>See actual execution time in the dashboard for every run</li>
                  <li>Detect gradual slowdown (job used to take 2 min, now 45 min)</li>
                </ul>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash: Start at Beginning, Ping at End
                </h3>
                <CodeBlock
                  code={`#!/bin/bash
# 1. Signal "job started" (get run_id from response if you need it)
curl -s -X POST "https://deadmanping.com/api/ping/backup-daily/start" -o /tmp/run.json

# 2. Do the actual work
/path/to/backup.sh

# 3. Signal "job finished" - optional: send run_id so monitor can match start/stop
curl -X POST "https://deadmanping.com/api/ping/backup-daily"
# If backup.sh hangs, step 3 never runs -> timeout alert`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python: Start/Stop with run_id
                </h3>
                <CodeBlock
                  code={`import requests
import subprocess

PING_SLUG = "data-sync-job"
BASE = "https://deadmanping.com/api/ping"

# Start tracking
r = requests.post(f"{BASE}/{PING_SLUG}/start")
run_id = r.json().get("run_id")  # optional, for linking start/stop

# Your long-running work
subprocess.run(["/path/to/sync.sh"], check=True)

# Stop: job completed (optionally pass run_id)
requests.post(f"{BASE}/{PING_SLUG}", json={"run_id": run_id})
# If sync hangs, this never runs -> you get a timeout alert`}
                  language="python"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js: Async Job with Start/Stop
                </h3>
                <CodeBlock
                  code={`const slug = 'report-generation';
const base = 'https://deadmanping.com/api/ping';

// Start
const startRes = await fetch(\`\${base}/\${slug}/start\`, { method: 'POST' });
const { run_id } = await startRes.json();

try {
  await runReportJob(); // your async work
  await fetch(\`\${base}/\${slug}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ run_id })
  });
} catch (e) {
  // Optionally ping with failure status so monitor knows it didn't hang, it failed
  await fetch(\`\${base}/\${slug}\`, {
    method: 'POST',
    body: JSON.stringify({ run_id, status: 'failure' })
  });
  throw e;
}`}
                  language="javascript"
                />
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Configure Timeout in DeadManPing
                </h2>
                <p className="text-muted-foreground mb-4">
                  When you use start/stop tracking, set an <strong>expected max duration</strong> (e.g. 30 minutes). 
                  If no completion ping arrives within that window, DeadManPing marks the run as timed out and sends an alert—so you know the job is stuck, not just late.
                </p>
                <p className="text-muted-foreground">
                  You keep your script and cron. Add two HTTP calls: one at start, one at end. No SDK, no agent—just curl or your language&apos;s HTTP client.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Catch Stuck Scripts Before They Cost You
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing start/stop tracking measures execution time and triggers timeout alerts when jobs hang. 
                    Set up in minutes—add a start ping and a completion ping to your existing cron job.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/auth/signup"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Start Monitoring Free
                    </Link>
                    <Link
                      href="/docs"
                      className="border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Start/Stop Docs
                    </Link>
                  </div>
                </div>
              </section>
            </AnimatedSection>

            <RelatedArticles slug="detect-hanging-cron-job" />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
