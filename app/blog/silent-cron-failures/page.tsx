import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Silent Cron Failures: How to Detect Them | DeadManPing",
  description: "How to detect silent cron job failures that don't log errors. Examples for catching failures that exit without notification.",
  keywords: "silent cron failures, detect silent cron failure, cron job silent failure detection, cron fails silently, detect cron job not running, silent cron job failure",
  openGraph: {
    title: "Silent Cron Failures: How to Detect Them | DeadManPing",
    description: "How to detect silent cron job failures that don't log errors.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Silent Cron Failures: How to Detect Them | DeadManPing",
    description: "How to detect silent cron job failures that don't log errors.",
  },
  alternates: {
    canonical: "/blog/silent-cron-failures",
  },
}

export default function SilentCronFailuresPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Silent Cron Failures: How to Detect Jobs That Fail Without Logging",
    "description": "Complete guide on detecting cron jobs that fail silently without producing error logs or exit codes.",
    "url": `${baseUrl}/silent-cron-failures`,
    "datePublished": "2024-12-01",
    "dateModified": "2024-12-01",
    "author": {
      "@type": "Organization",
      "name": "DeadManPing",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icon.svg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/silent-cron-failures`
    },
    "articleSection": "Cron Monitoring Guides",
    "keywords": "silent cron failures, detect silent cron failure, cron job silent failure detection, cron fails silently, detect cron job not running, silent cron job failure",
    "inLanguage": "en-US"
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Silent Cron Failures",
        "item": `${baseUrl}/silent-cron-failures`
      }
    ]
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Silent Cron Failures: Detect Jobs That Fail Without Logging
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job stops working, but there are no error logs, no exit codes, and no notifications. Learn how to detect these silent failures.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: Silent Failures
                </h2>
                <p className="text-muted-foreground mb-4">
                  Cron jobs can fail silently in several ways:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Script exits with code 0 but doesn't perform its intended work</li>
                  <li>Script crashes but error output isn't captured or logged</li>
                  <li>Cron daemon stops running, so jobs never execute</li>
                  <li>Script runs but hangs indefinitely without producing output</li>
                  <li>Permissions change, script fails but cron doesn't report it</li>
                  <li>Environment variables missing, script fails silently</li>
                  <li>Network timeouts cause silent failures in remote operations</li>
                </ul>
                <p className="text-muted-foreground">
                  Without explicit success confirmation, you have no way to know if the job actually completed its work.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Explicit Success Confirmation
                </h2>
                <p className="text-muted-foreground mb-4">
                  Always send an explicit success ping at the end of your script. If the ping doesn't arrive, you know the job failed silently. The ping must be inside your script, not in the cron line, because only the script knows if it completed successfully.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Trap Errors and Always Ping
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>set -e  # Exit on error</div>
                    <div>set -o pipefail  # Catch pipe failures</div>
                    <div></div>
                    <div># Your actual work</div>
                    <div>./backup.sh</div>
                    <div>./sync.sh</div>
                    <div></div>
                    <div># Single ping at end - if job fails, ping won't arrive and DeadManPing will alert</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Try-Finally for Guaranteed Ping
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import requests</div>
                    <div>import sys</div>
                    <div></div>
                    <div># Your actual work</div>
                    <div>perform_backup()</div>
                    <div>sync_data()</div>
                    <div></div>
                    <div># Single ping at end - if job fails, ping won't arrive and DeadManPing will alert</div>
                    <div>requests.post("https://deadmanping.com/api/ping/backup-daily")</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Process Exit Handlers
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>const https = require('https');</div>
                    <div></div>
                    <div>// Your actual work</div>
                    <div>async function run() {'{'}</div>
                    <div>  await performBackup();</div>
                    <div>  await syncData();</div>
                    <div>  </div>
                    <div>  // Single ping at end - if job fails, ping won't arrive and DeadManPing will alert</div>
                    <div>  https.request('https://deadmanping.com/api/ping/backup-daily', {'{'} method: 'POST' {'}'}).end();</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>run().catch((err) =&gt; {'{'}</div>
                    <div>  // If job fails, ping won't arrive - DeadManPing will detect missing ping</div>
                    <div>  process.exit(1);</div>
                    <div>{'}'});</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Verify Cron Daemon is Running
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div># Check if cron is running before relying on it</div>
                    <div># Check if cron is running</div>
                    <div>CRON_RUNNING=0</div>
                    <div>if pgrep -x cron &gt; /dev/null || pgrep -x crond &gt; /dev/null; then</div>
                    <div>  CRON_RUNNING=1</div>
                    <div>fi</div>
                    <div></div>
                    <div># Single ping with cron status in payload</div>
                    <div># In DeadManPing panel: set validation rule "cron_running" == 1</div>
                    <div># Panel will automatically detect if cron daemon is not running</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/cron-daemon-check?cron_running=$CRON_RUNNING"</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Detecting Silent Failures with Dead Man Switch
                </h2>
                <p className="text-muted-foreground mb-4">
                  A dead man switch detects silent failures by monitoring whether your explicit success ping arrives. If the ping doesn't arrive within the expected interval, you know the job failed silently—even if there are no error logs.
                </p>
                <p className="text-muted-foreground mb-4">
                  This works for all types of silent failures: script crashes, cron daemon stops, permission errors, missing environment variables, and more. As long as your script sends a ping on success, missing pings indicate failures.
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
                    Start Detecting Silent Failures
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your explicit success pings arrive. Set up monitoring in 2 minutes, get alerts when jobs fail silently.
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
