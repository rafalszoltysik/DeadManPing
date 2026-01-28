import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { Footer } from '@/components/Footer'
import { CodeBlock } from '@/components/CodeBlock'
import { RelatedArticles } from '@/components/RelatedArticles'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Monitor Cron Jobs Without Migration | DeadManPing",
  description: "Keep your cron. Keep your scripts. Monitor cron jobs with one curl line. No migration required.",
  keywords: "monitor cron jobs without migration, cron monitoring, how to monitor cron jobs, detect cron job failure, cron job monitoring, scheduled task monitoring, cron job alerts, monitor cron jobs linux, cron job not running, cron notification if is not working, cron notification not working, cron job notification, cron notification alert, cron job notification service, monitor cron notification, cron notification system, cron job notification if failed, cron notification when job fails, cron notification if job fails",
  openGraph: {
    title: "Monitor Cron Jobs Without Migration | DeadManPing",
    description: "Keep your cron. Keep your scripts. Monitor cron jobs with one curl line. No migration required.",
    type: "article",
    url: `${cleanBaseUrl}/blog/monitor-cron-jobs`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Monitor Cron Jobs Without Migration | DeadManPing",
    description: "Keep your cron. Keep your scripts. Monitor cron jobs with one curl line. No migration required.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/monitor-cron-jobs`,
  },
}

export default function MonitorCronJobsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "url": `${cleanBaseUrl}/blog/monitor-cron-jobs`,
    "headline": "How to Monitor Cron Jobs and Detect Failures",
    "description": "Complete guide on monitoring cron jobs and detecting when they fail or stop running.",
    "datePublished": "2024-12-01",
    "dateModified": "2024-12-01",
    "author": {
      "@type": "Organization",
      "name": "DeadManPing",
      "url": cleanBaseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing",
      "logo": {
        "@type": "ImageObject",
        "url": `${cleanBaseUrl}/icon.png`,
        "width": 1200,
        "height": 1200
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${cleanBaseUrl}/blog/monitor-cron-jobs`
    },
    "articleSection": "Cron Monitoring Guides",
    "keywords": "monitor cron jobs without migration, cron monitoring, how to monitor cron jobs, detect cron job failure, cron job monitoring, scheduled task monitoring, cron job alerts",
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
        "item": cleanBaseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Monitor Cron Jobs",
        "item": `${cleanBaseUrl}/blog/monitor-cron-jobs`
      }
    ]
  }

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
                Traditional monitoring solutions require complex setup and don't understand cron semantics. 
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
              <CodeBlock
                code={`#!/bin/bash
# Your existing backup script here
./backup.sh

# Add this one line at the end
curl -X POST "https://deadmanping.com/api/ping/backup-daily"`}
                language="bash"
              />
              <p className="text-muted-foreground mb-4">
                In crontab: <code className="bg-muted px-1.5 py-0.5 rounded text-sm">0 3 * * * /path/to/backup.sh</code>
              </p>
              <p className="text-muted-foreground mb-4">
                Your cron runs your script. Your script executes logic. At the end of your script — one curl line with data from execution.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Including Data from Execution
              </h3>
              <p className="text-muted-foreground mb-4">
                You can include data from execution using query parameters. Set validation rules in the DeadManPing panel to check these values:
              </p>
              <CodeBlock
                code={`#!/bin/bash
./backup.sh
EXIT_CODE=$?
BACKUP_SIZE=$(du -sh /backups/latest | cut -f1)

# Single ping with data from execution
# In DeadManPing panel: set validation rules:
#   - "exit_code" == 0
#   - "backup_size" contains expected pattern
curl -X POST "https://deadmanping.com/api/ping/backup-daily?exit_code=$EXIT_CODE&backup_size=$BACKUP_SIZE"`}
                language="bash"
              />
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
              <CodeBlock
                code={`import requests
import sys

# Your backup logic here
run_backup()

# Single ping at end - if job fails, ping won't arrive and DeadManPing will alert
requests.post("https://deadmanping.com/api/ping/backup-daily")`}
                language="python"
              />

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Node.js
              </h3>
              <CodeBlock
                code={`const https = require('https');

async function runBackup() {
  await performBackup();
  
  // Single ping at end - if job fails, ping won't arrive and DeadManPing will alert
  https.request('https://deadmanping.com/api/ping/backup-daily', { method: 'POST' }).end();
}

runBackup().catch((err) => {
  // If job fails, ping won't arrive - DeadManPing will detect missing ping
  process.exit(1);
});`}
                language="javascript"
              />

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                Docker Containers
              </h3>
              <p className="text-muted-foreground mb-4">
                For containerized cron jobs, use the same approach. The container just needs network access:
              </p>
              <CodeBlock
                code={`0 3 * * * docker run --rm your-backup-image && \\
  curl -X POST "https://deadmanping.com/api/ping/backup-daily"`}
                language="bash"
              />
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth/signup"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                  >
                    Start Monitoring Free
                  </Link>
                  <Link
                    href="/faq"
                    className="border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                  >
                    View FAQ
                  </Link>
                </div>
              </div>
              </section>
            </AnimatedSection>

            <RelatedArticles slug="monitor-cron-jobs" />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
