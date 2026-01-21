import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Verify Cron Job Actually Ran | DeadManPing",
  description: "How to verify that cron jobs actually executed. Examples for confirming job execution with timestamps and pings.",
  keywords: "verify cron job actually ran, confirm cron job executed, detect cron job not running, verify cron job completed, check cron job ran, cron job execution verification",
  openGraph: {
    title: "Verify Cron Job Actually Ran | DeadManPing",
    description: "How to verify that cron jobs actually executed.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify Cron Job Actually Ran | DeadManPing",
    description: "How to verify that cron jobs actually executed.",
  },
  alternates: {
    canonical: "/verify-cron-job-actually-ran",
  },
}

export default function VerifyCronJobActuallyRanPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Verify Cron Job Actually Ran: Confirm Job Execution",
    "description": "Complete guide on verifying that cron jobs actually executed and detecting when they don't run.",
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
              Verify Cron Job Actually Ran: Confirm Execution
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job is scheduled, but how do you know it actually ran? Here's how to verify job execution and detect when jobs don't execute.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why Jobs Might Not Execute
                </h2>
                <p className="text-muted-foreground mb-4">
                  Cron jobs can be scheduled but not execute for several reasons:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Cron daemon stops running or crashes</li>
                  <li>System time changes, causing schedule confusion</li>
                  <li>Job is disabled or commented out in crontab</li>
                  <li>User account is locked or disabled</li>
                  <li>System is powered off during scheduled time</li>
                  <li>Resource limits prevent job from starting</li>
                  <li>Syntax errors in crontab prevent execution</li>
                </ul>
                <p className="text-muted-foreground">
                  Without explicit confirmation, you have no way to know if the job actually ran.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Verify Job Execution
                </h2>
                <p className="text-muted-foreground mb-4">
                  Send an explicit ping at the start and end of your job. If the ping doesn't arrive, you know the job didn't execute. The ping must be inside your script, not in the cron line.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Ping on Start and End
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>set -e</div>
                    <div></div>
                    <div># Ping at start to confirm job began</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?s=start"</div>
                    <div></div>
                    <div># Your actual work</div>
                    <div>./backup.sh</div>
                    <div>./sync.sh</div>
                    <div></div>
                    <div># Ping at end to confirm job completed</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?s=ok"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Timestamp Verification
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import requests</div>
                    <div>import datetime</div>
                    <div></div>
                    <div># Ping at start with timestamp</div>
                    <div>start_time = datetime.datetime.now().isoformat()</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/backup-daily?s=start&t={'{'}start_time{'}'}")</div>
                    <div></div>
                    <div># Your actual work</div>
                    <div>perform_backup()</div>
                    <div></div>
                    <div># Ping at end with duration</div>
                    <div>end_time = datetime.datetime.now()</div>
                    <div>duration = (end_time - datetime.datetime.fromisoformat(start_time)).total_seconds()</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/backup-daily?s=ok&duration={'{'}duration{'}'}")</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Execution Confirmation
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>const https = require('https');</div>
                    <div></div>
                    <div>// Ping at start</div>
                    <div>const startTime = Date.now();</div>
                    <div>https.request('https://deadmanping.com/api/ping/backup-daily?s=start', {'{'} method: 'POST' {'}'}).end();</div>
                    <div></div>
                    <div>// Your actual work</div>
                    <div>async function run() {'{'}</div>
                    <div>  await performBackup();</div>
                    <div>  </div>
                    <div>  // Ping at end with duration</div>
                    <div>  const duration = Math.round((Date.now() - startTime) / 1000);</div>
                    <div>  https.request(`https://deadmanping.com/api/ping/backup-daily?s=ok&duration=${'{'}duration{'}'}`, {'{'} method: 'POST' {'}'}).end();</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>run().catch((err) =&gt; {'{'}</div>
                    <div>  https.request(`https://deadmanping.com/api/ping/backup-daily?s=fail&m=${'{'}encodeURIComponent(err.message){'}'}`, {'{'} method: 'POST' {'}'}).end();</div>
                    <div>  process.exit(1);</div>
                    <div>{'}'});</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Check Last Execution Time
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div># Create timestamp file to track last execution</div>
                    <div>LAST_RUN_FILE="/tmp/last-backup-run"</div>
                    <div></div>
                    <div># Check if job ran recently (within last 25 hours for daily job)</div>
                    <div>if [ -f "$LAST_RUN_FILE" ]; then</div>
                    <div>  LAST_RUN=$(cat "$LAST_RUN_FILE")</div>
                    <div>  NOW=$(date +%s)</div>
                    <div>  HOURS_SINCE=$(( (NOW - LAST_RUN) / 3600 ))</div>
                    <div>  </div>
                    <div>  if [ $HOURS_SINCE -gt 25 ]; then</div>
                    <div>    curl -X POST "https://deadmanping.com/api/ping/backup-daily?s=fail&m=not+run+in+$HOURS_SINCE+h"</div>
                    <div>    exit 1</div>
                    <div>  fi</div>
                    <div>fi</div>
                    <div></div>
                    <div># Update timestamp</div>
                    <div>date +%s &gt; "$LAST_RUN_FILE"</div>
                    <div></div>
                    <div># Your actual work</div>
                    <div>./backup.sh</div>
                    <div></div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?s=ok"</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Verifying Execution with Dead Man Switch
                </h2>
                <p className="text-muted-foreground mb-4">
                  A dead man switch verifies job execution by monitoring whether your explicit ping arrives. If the ping doesn't arrive within the expected interval, you know the job didn't execute—even if cron thinks it ran.
                </p>
                <p className="text-muted-foreground mb-4">
                  This works for all cases: cron daemon stops, system powered off, job disabled, syntax errors, and more. As long as your script sends a ping when it runs, missing pings indicate the job didn't execute.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Start Verifying Job Execution
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
