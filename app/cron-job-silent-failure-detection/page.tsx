import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Cron Job Silent Failure Detection | DeadManPing",
  description: "How to detect silent cron job failures that don't produce error logs. Examples for catching failures that exit without notification.",
  keywords: "cron job silent failure detection, detect silent cron failure, silent cron job failure, cron fails silently, detect cron job silent failure",
  openGraph: {
    title: "Cron Job Silent Failure Detection | DeadManPing",
    description: "How to detect silent cron job failures that don't produce error logs.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Job Silent Failure Detection | DeadManPing",
    description: "How to detect silent cron job failures that don't produce error logs.",
  },
  alternates: {
    canonical: "/cron-job-silent-failure-detection",
  },
}

export default function CronJobSilentFailureDetectionPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cron Job Silent Failure Detection: Catch Failures Without Logs",
    "description": "Complete guide on detecting cron jobs that fail silently without producing error logs or exit codes.",
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
              Cron Job Silent Failure Detection: Catch Failures Without Logs
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job fails silently—no error logs, no exit codes, no notifications. Here's how to detect these silent failures automatically.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  What Are Silent Failures
                </h2>
                <p className="text-muted-foreground mb-4">
                  Silent failures occur when cron jobs fail but don't produce any indication:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Script exits with code 0 but doesn't perform work</li>
                  <li>Errors are caught but not logged</li>
                  <li>Cron daemon stops, so jobs never execute</li>
                  <li>Script hangs without producing output</li>
                  <li>Permission errors prevent execution silently</li>
                  <li>Environment issues cause silent failures</li>
                </ul>
                <p className="text-muted-foreground">
                  Traditional monitoring relies on logs and exit codes, which silent failures don't provide.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Detection Method: Explicit Success Confirmation
                </h2>
                <p className="text-muted-foreground mb-4">
                  The only reliable way to detect silent failures is explicit success confirmation. Your script must send a ping when it completes successfully. If the ping doesn't arrive, you know the job failed silently.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Always Ping on Success
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>set -e</div>
                    <div>set -o pipefail</div>
                    <div></div>
                    <div># Trap to catch unexpected exits</div>
                    <div>trap 'curl -X POST "https://deadmanping.com/api/ping/job-daily?s=fail&m=unexpected+exit"' EXIT</div>
                    <div></div>
                    <div># Your work</div>
                    <div>./process.sh</div>
                    <div></div>
                    <div># Explicit success ping</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/job-daily?s=ok"</div>
                    <div>trap - EXIT</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Try-Finally Pattern
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import requests</div>
                    <div>import sys</div>
                    <div></div>
                    <div>success = False</div>
                    <div>try:</div>
                    <div>  perform_work()</div>
                    <div>  success = True</div>
                    <div>finally:</div>
                    <div>  if success:</div>
                    <div>    requests.post("https://deadmanping.com/api/ping/job-daily?s=ok")</div>
                    <div>  else:</div>
                    <div>    requests.post("https://deadmanping.com/api/ping/job-daily?s=fail")</div>
                    <div>    sys.exit(1)</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Dead Man Switch Detection
                </h2>
                <p className="text-muted-foreground mb-4">
                  A dead man switch detects silent failures by monitoring whether your explicit success ping arrives. If the ping doesn't arrive within the expected interval, you know the job failed silently—regardless of logs or exit codes.
                </p>
                <p className="text-muted-foreground mb-4">
                  This works for all types of silent failures: script crashes, cron daemon stops, permission errors, missing environment variables, and more.
                </p>
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
