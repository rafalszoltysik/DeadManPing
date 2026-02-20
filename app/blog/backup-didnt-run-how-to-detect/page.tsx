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
  title: "Backup Didn't Run? How to Detect Missing Backup Jobs Instantly",
  description: "Detect when backup jobs don't run. Dead man switch monitoring catches missing backups and sends instant alerts. Bash, Python, Node.js examples.",
  keywords: "backup didn't run, detect backup didn't run, backup not running, how to detect backup didn't run, backup failure detection, dead man switch backup, backup monitoring",
  openGraph: {
    title: "Backup Didn't Run? How to Detect Missing Backup Jobs Instantly",
    description: "Detect when backup jobs don't run. Dead man switch monitoring catches missing backups and sends instant alerts.",
    type: "article",
    url: `${cleanBaseUrl}/blog/backup-didnt-run-how-to-detect`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Backup Didn't Run? How to Detect Missing Backup Jobs",
    description: "Detect when backup jobs don't run. Dead man switch catches missing backups and sends instant alerts.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/backup-didnt-run-how-to-detect`,
  },
}

export default function BackupDidntRunHowToDetectPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "url": `${cleanBaseUrl}/blog/backup-didnt-run-how-to-detect`,
    "headline": "Backup Didn't Run - How to Detect Missing Backups",
    "description": "Complete guide on detecting when backup jobs don't run using dead man switch monitoring.",
    "datePublished": "2026-01-30",
    "dateModified": "2026-01-30",
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
      "@id": `${cleanBaseUrl}/blog/backup-didnt-run-how-to-detect`
    },
    "articleSection": "Backup Monitoring Guides",
    "keywords": "backup didn't run, detect backup didn't run, backup not running, how to detect backup didn't run, backup failure detection, dead man switch backup, backup monitoring",
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
        "name": "Backup Didn't Run",
        "item": `${cleanBaseUrl}/blog/backup-didnt-run-how-to-detect`
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
              Backup Didn't Run - How to Detect Missing Backups
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4">
              Backup nie zadziałał — jak się dowiedzieć?
            </p>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Dead man switch monitoring detects when backup jobs don't run and sends alerts immediately.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: Backup Didn't Run
                </h2>
                <p className="text-muted-foreground mb-4">
                  Your backup job is scheduled to run daily, but it didn't execute. How do you know? Common reasons backups don't run:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Cron job gets disabled or removed</li>
                  <li>Cron daemon stops or crashes</li>
                  <li>System reboot without cron restart</li>
                  <li>Permission errors prevent script execution</li>
                  <li>Script path changes after system update</li>
                  <li>Disk space exhaustion prevents script from starting</li>
                </ul>
                <p className="text-muted-foreground">
                  Without monitoring, you might discover your backups haven't been running for weeks when you need them most. 
                  Traditional file-based monitoring (checking if backup files exist) doesn't tell you if the backup ran today or last month.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Dead Man Switch Detects Missing Backups
                </h2>
                <p className="text-muted-foreground mb-4">
                  A dead man switch works by monitoring whether your backup script sends a ping after each successful run. 
                  If the ping doesn't arrive within the expected interval (e.g., daily backups should ping every 24 hours), 
                  you get an alert. It's independent of your backup infrastructure, so it detects failures even if your 
                  monitoring system is down.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>DeadManPing doesn't run your backups. Your cron does. DeadManPing only observes if the ping arrived.</strong>
                </p>
                <p className="text-muted-foreground">
                  <strong>Important:</strong> The curl command must be <strong>inside your backup script</strong>, not in the cron line, 
                  because only in the script do you have access to variables from execution results. If the script fails before 
                  reaching the ping, the ping never arrives, and DeadManPing alerts you.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Detect Backup Didn't Run
                </h2>
                <p className="text-muted-foreground mb-4">
                  Add a dead man switch to your backup script. If the backup doesn't run, the ping never arrives, and you get an alert.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example
                </h3>
                <CodeBlock
                  code={`#!/bin/bash
set -e

# Run backup
rsync -avz /data/ user@backup-server:/backups/

# Single ping at end - if backup doesn't run, ping won't arrive
# DeadManPing will alert if ping doesn't arrive within expected interval
curl -X POST "https://deadmanping.com/api/ping/backup-daily"`}
                  language="bash"
                />
                <p className="text-muted-foreground mb-4">
                  The <code className="bg-muted px-1.5 py-0.5 rounded text-sm">set -e</code> ensures the script exits on any error, 
                  so the ping only happens if rsync succeeds. If the script fails or doesn't run, the ping never arrives.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example
                </h3>
                <CodeBlock
                  code={`#!/usr/bin/env python3
import subprocess
import requests
import sys

try:
    # Run backup
    subprocess.run(['rsync', '-avz', '/data/', 'user@backup-server:/backups/'], check=True)
    
    # Single ping at end - if backup doesn't run, ping won't arrive
    requests.post('https://deadmanping.com/api/ping/backup-daily')
except Exception as e:
    # If backup fails, script exits and ping never arrives
    sys.exit(1)`}
                  language="python"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example
                </h3>
                <CodeBlock
                  code={`#!/usr/bin/env node
const { execSync } = require('child_process');
const https = require('https');

try {
  // Run backup
  execSync('rsync -avz /data/ user@backup-server:/backups/', { stdio: 'inherit' });
  
  // Single ping at end - if backup doesn't run, ping won't arrive
  https.request('https://deadmanping.com/api/ping/backup-daily', { method: 'POST' }).end();
} catch (error) {
  // If backup fails, script exits and ping never arrives
  process.exit(1);
}`}
                  language="javascript"
                />
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Setting Up Monitoring Intervals
                </h2>
                <p className="text-muted-foreground mb-4">
                  Match your monitoring interval to your backup frequency, with a grace period:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Daily backups</strong> - Expect ping every 24 hours, alert if missing for 25+ hours</li>
                  <li><strong>Hourly backups</strong> - Expect ping every hour, alert if missing for 65+ minutes</li>
                  <li><strong>Weekly backups</strong> - Expect ping every 7 days, alert if missing for 8+ days</li>
                </ul>
                <p className="text-muted-foreground">
                  The grace period accounts for slight timing variations and gives you time to respond before it's critical.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Start Detecting Missing Backups
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing provides dead man switch monitoring for backup jobs. Set up monitoring in 2 minutes, 
                    get alerts when backups don't run. Learn more about <Link href="/backup-dead-man-switch" className="text-primary hover:underline font-medium">backup dead man switch</Link>.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/auth/signup"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Start Monitoring Free
                    </Link>
                    <Link
                      href="/backup-dead-man-switch"
                      className="border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Learn About Backup Dead Man Switch
                    </Link>
                    <Link
                      href="/blog/dead-man-switch"
                      className="border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Dead Man Switch Guide
                    </Link>
                  </div>
                </div>
              </section>
            </AnimatedSection>

            <RelatedArticles slug="backup-didnt-run-how-to-detect" />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

