import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Monitor Cron Jobs Without Migration | DeadManPing",
  description: "Keep your cron. Keep your scripts. Monitor cron jobs with one curl line. No migration required.",
  keywords: "monitor cron jobs without migration, cron monitoring, how to monitor cron jobs, detect cron job failure, cron job monitoring, scheduled task monitoring, cron job alerts, monitor cron jobs linux, cron job not running, cron notification if is not working, cron notification not working, cron job notification, cron notification alert, cron job notification service, monitor cron notification, cron notification system, cron job notification if failed, cron notification when job fails, cron notification if job fails",
  openGraph: {
    title: "Monitor Cron Jobs Without Migration | DeadManPing",
    description: "Keep your cron. Keep your scripts. Monitor cron jobs with one curl line. No migration required.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monitor Cron Jobs Without Migration | DeadManPing",
    description: "Keep your cron. Keep your scripts. Monitor cron jobs with one curl line. No migration required.",
  },
  alternates: {
    canonical: "/monitor-cron-jobs",
  },
}

export default function MonitorCronJobsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to Monitor Cron Jobs and Detect Failures",
    "description": "Complete guide on monitoring cron jobs and detecting when they fail or stop running.",
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
              Monitor Cron Jobs Without Changing Your Setup
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Keep your cron. Keep your scripts. Add one curl line. Get instant alerts when jobs fail or return wrong results.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: Silent Cron Job Failures
                </h2>
              <p className="text-muted-foreground mb-4">
                Cron jobs fail silently. If your backup script crashes, your database sync stops, or your cleanup job 
                never runs, you won't know until it's too late. Common failure scenarios:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>Script crashes due to unhandled exceptions</li>
                <li>Disk space runs out, causing writes to fail</li>
                <li>Network timeouts when connecting to external services</li>
                <li>Permission errors after system updates</li>
                <li>Cron daemon stops or gets disabled</li>
              </ul>
              <p className="text-muted-foreground">
                Traditional monitoring tools (Nagios, Zabbix) require complex setup and don't understand cron semantics. 
                You need a dead man switch: if your job doesn't ping within the expected interval, you get an alert.
              </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Dead Man Switch Monitoring
                </h2>
              <p className="text-muted-foreground mb-4">
                <strong>DeadManPing doesn't run your jobs. Your cron does. DeadManPing only observes.</strong>
              </p>
              <p className="text-muted-foreground mb-4">
                A dead man switch works like this: your cron job pings a monitoring service after each successful run. 
                If the ping doesn't arrive within the expected time window, you get an alert. It's simple, reliable, and 
                works with any language or environment.
              </p>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Add One Line to Your Existing Script
              </h3>
              <p className="text-muted-foreground mb-4">
                <strong>Important:</strong> The curl command must be <strong>inside your script</strong>, not in the cron line, because only in the script do you have access to variables from execution results.
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div>#!/bin/bash</div>
                  <div># Your existing backup script here</div>
                  <div>./backup.sh</div>
                  <div></div>
                  <div># Add this one line at the end</div>
                  <div>curl -X POST "https://deadmanping.com/ping/backup-daily" \</div>
                  <div>  -H "Content-Type: application/json" \</div>
                  <div>  -d {"'"}{'{'}`"success": true{'}'}{"'"}</div>
                </code>
              </div>
              <p className="text-muted-foreground mb-4">
                In crontab: <code className="bg-muted px-1.5 py-0.5 rounded text-sm">0 3 * * * /path/to/backup.sh</code>
              </p>
              <p className="text-muted-foreground mb-4">
                Your cron runs your script. Your script executes logic. At the end of your script — one curl line with data from execution.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Reporting Failures with Data from Execution
              </h3>
              <p className="text-muted-foreground mb-4">
                You can report failures explicitly and include data from execution:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div>#!/bin/bash</div>
                  <div>if ./backup.sh; then</div>
                  <div>  BACKUP_SIZE=$(du -sh /backups/latest | cut -f1)</div>
                  <div>  curl -X POST "https://deadmanping.com/ping/backup-daily" \</div>
                  <div>    -H "Content-Type: application/json" \</div>
                  <div>    -d "{'{'}\"success\": true, \"backup_size\": \"$BACKUP_SIZE\"{'}'}"</div>
                  <div>else</div>
                  <div>  ERROR_MSG=$(./backup.sh 2{'>'}&1 | tail -1)</div>
                  <div>  curl -X POST "https://deadmanping.com/ping/backup-daily" \</div>
                  <div>    -H "Content-Type: application/json" \</div>
                  <div>    -d "{'{'}\"success\": false, \"error\": \"$ERROR_MSG\"{'}'}"</div>
                  <div>fi</div>
                </code>
              </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Language-Specific Examples
                </h2>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Python
              </h3>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div>import requests</div>
                  <div>import sys</div>
                  <div></div>
                  <div># Your backup logic here</div>
                  <div>run_backup()</div>
                  <div></div>
                  <div># Single ping at end - if job fails, ping won't arrive and DeadManPing will alert</div>
                  <div>requests.post("https://deadmanping.com/api/ping/backup-daily")</div>
                </code>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Node.js
              </h3>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div>const https = require('https');</div>
                  <div></div>
                  <div>async function runBackup() {'{'}</div>
                  <div>  await performBackup();</div>
                  <div>  </div>
                  <div>  // Single ping at end - if job fails, ping won't arrive and DeadManPing will alert</div>
                  <div>  https.request('https://deadmanping.com/api/ping/backup-daily', {'{'} method: 'POST' {'}'}).end();</div>
                  <div>{'}'}</div>
                  <div></div>
                  <div>runBackup().catch((err) =&gt; {'{'}</div>
                  <div>  // If job fails, ping won't arrive - DeadManPing will detect missing ping</div>
                  <div>  process.exit(1);</div>
                  <div>{'}'});</div>
                </code>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Docker Containers
              </h3>
              <p className="text-muted-foreground mb-4">
                For containerized cron jobs, use the same approach. The container just needs network access:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div>0 3 * * * docker run --rm your-backup-image && \</div>
                  <div>  curl -X POST "https://deadmanping.com/api/ping/backup-daily"</div>
                </code>
              </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  What to Monitor
                </h2>
              <p className="text-muted-foreground mb-4">
                Prioritize monitoring jobs that have business impact:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Database backups</strong> - Missing backups can mean data loss</li>
                <li><strong>Data sync jobs</strong> - Broken syncs cause inconsistent state</li>
                <li><strong>Report generation</strong> - Missing reports affect business operations</li>
                <li><strong>Cleanup jobs</strong> - Disk space issues can cascade</li>
                <li><strong>Health checks</strong> - Automated system health verification</li>
              </ul>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Cron Notification System: Get Alerts When Jobs Fail
                </h2>
              <p className="text-muted-foreground mb-4">
                A reliable cron notification system is essential for detecting when your scheduled tasks stop working. 
                If your cron job is not working, you need immediate notifications. Our cron job notification service 
                sends alerts via email, Slack, or Discord when your cron job fails or doesn't run as expected.
              </p>
              <p className="text-muted-foreground mb-4">
                The cron notification alert works by monitoring whether your job pings the service within the expected 
                time window. If the cron notification is not working (meaning your job didn't ping), you'll receive 
                an alert. This cron notification when job fails ensures you're always aware of issues before they 
                become critical problems.
              </p>
              <p className="text-muted-foreground mb-4">
                Setting up cron notification if job fails is simple: just add a curl command to your cron job. 
                The cron notification if is not working will automatically trigger if your job doesn't complete 
                successfully. This proactive approach to monitor cron notification helps you catch failures 
                immediately, not days later.
              </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Get Started in 2 Minutes
                </h2>
                <p className="text-muted-foreground mb-4">
                  DeadManPing provides dead man switch monitoring for cron jobs. No complex setup, no agents to install. 
                  Just add a curl command to your cron job.
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
