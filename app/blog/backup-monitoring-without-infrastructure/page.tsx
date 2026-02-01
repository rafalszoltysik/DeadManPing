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
  title: "Backup Monitoring Without Infrastructure | DeadManPing",
  description: "How to monitor backups without Kubernetes, Prometheus, or complex infrastructure. Dead man switch monitoring for VPS, bare metal, and legacy servers.",
  keywords: "backup monitoring without infrastructure, backup monitoring without kubernetes, backup monitoring without prometheus, backup monitoring vps, backup monitoring bare metal, dead man switch backup, simple backup monitoring",
  openGraph: {
    title: "Backup Monitoring Without Infrastructure | DeadManPing",
    description: "How to monitor backups without Kubernetes, Prometheus, or complex infrastructure. Dead man switch monitoring for VPS, bare metal, and legacy servers.",
    type: "article",
    url: `${cleanBaseUrl}/blog/backup-monitoring-without-infrastructure`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Backup Monitoring Without Infrastructure | DeadManPing",
    description: "How to monitor backups without Kubernetes, Prometheus, or complex infrastructure. Dead man switch monitoring for VPS, bare metal, and legacy servers.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/backup-monitoring-without-infrastructure`,
  },
}

export default function BackupMonitoringWithoutInfrastructurePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "url": `${cleanBaseUrl}/blog/backup-monitoring-without-infrastructure`,
    "headline": "Backup Monitoring Without Infrastructure: Simple Solution for VPS and Legacy Servers",
    "description": "Complete guide on monitoring backups without Kubernetes, Prometheus, or complex infrastructure. Perfect for VPS, bare metal, and legacy servers.",
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
      "@id": `${cleanBaseUrl}/blog/backup-monitoring-without-infrastructure`
    },
    "articleSection": "Backup Monitoring Guides",
    "keywords": "backup monitoring without infrastructure, backup monitoring without kubernetes, backup monitoring without prometheus, backup monitoring vps, backup monitoring bare metal, dead man switch backup, simple backup monitoring",
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
        "name": "Backup Monitoring Without Infrastructure",
        "item": `${cleanBaseUrl}/blog/backup-monitoring-without-infrastructure`
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
              Backup Monitoring Without Infrastructure: Simple Solution for VPS and Legacy Servers
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4">
              Jak monitorować backupy bez Kubernetesa/Prometheusa?
            </p>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Dead man switch monitoring works without complex infrastructure. Perfect for VPS, bare metal, and legacy servers.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: Complex Infrastructure Requirements
                </h2>
                <p className="text-muted-foreground mb-4">
                  Most backup monitoring solutions require complex infrastructure:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Kubernetes + Prometheus</strong> - Requires container orchestration and metrics collection</li>
                  <li><strong>ELK Stack</strong> - Requires Elasticsearch, Logstash, and Kibana setup</li>
                  <li><strong>Datadog/New Relic</strong> - Requires agents and complex configuration</li>
                  <li><strong>Custom monitoring scripts</strong> - Requires maintaining your own infrastructure</li>
                </ul>
                <p className="text-muted-foreground">
                  If you're running backups on VPS, bare metal, or legacy servers, you don't have Kubernetes or Prometheus. 
                  You need a simple solution that works with just cron and curl.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Dead Man Switch Without Infrastructure
                </h2>
                <p className="text-muted-foreground mb-4">
                  Dead man switch monitoring works without any infrastructure. Just add one curl line to your backup script. 
                  No agents, no Kubernetes, no Prometheus. It works with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>VPS servers</strong> - DigitalOcean, Linode, Vultr, etc.</li>
                  <li><strong>Bare metal servers</strong> - Physical servers without containerization</li>
                  <li><strong>Legacy servers</strong> - Older systems without modern monitoring tools</li>
                  <li><strong>Shared hosting</strong> - Limited access, but cron and curl work</li>
                  <li><strong>MSP environments</strong> - Multiple client servers without unified infrastructure</li>
                </ul>
                <p className="text-muted-foreground">
                  <strong>DeadManPing doesn't run your backups. Your cron does. DeadManPing only observes if the ping arrived.</strong>
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How It Works: One Curl Line
                </h2>
                <p className="text-muted-foreground mb-4">
                  After each successful backup, your script pings a monitoring service. If the ping doesn't arrive within 
                  the expected interval, you get an alert. No infrastructure required.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Simple Backup Example
                </h3>
                <CodeBlock
                  code={`#!/bin/bash
set -e

# Run backup (rsync, tar, database dump, etc.)
rsync -avz /data/ user@backup-server:/backups/

# One curl line - no infrastructure required
curl -X POST "https://deadmanping.com/api/ping/backup-daily"`}
                  language="bash"
                />
                <p className="text-muted-foreground mb-4">
                  That's it. No agents, no Kubernetes, no Prometheus. Just one curl line.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  With Payload Validation
                </h3>
                <CodeBlock
                  code={`#!/bin/bash
set -e

# Run backup
BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql"
pg_dump mydb > "$BACKUP_FILE"

# Get file size
FILE_SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || echo 0)

# Ping with file size - DeadManPing validates size > 0
curl -X POST "https://deadmanping.com/api/ping/backup-db?size=$FILE_SIZE"`}
                  language="bash"
                />
                <p className="text-muted-foreground">
                  You can include backup data (file size, status, etc.) in the ping payload. DeadManPing validates this 
                  data and alerts if backups are empty or incorrect.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Use Cases: When Infrastructure-Free Monitoring Makes Sense
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>MSP (Managed Service Providers)</strong> - Monitor backups across 50+ client servers without unified infrastructure</li>
                  <li><strong>Small businesses</strong> - VPS hosting without DevOps team or Kubernetes expertise</li>
                  <li><strong>Legacy systems</strong> - Older servers that can't run modern monitoring tools</li>
                  <li><strong>Cost-sensitive environments</strong> - Avoid expensive monitoring infrastructure</li>
                  <li><strong>Quick setup</strong> - Need backup monitoring in minutes, not days</li>
                </ul>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Start Monitoring Backups Without Infrastructure
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing provides backup monitoring without infrastructure requirements. Set up monitoring in 2 minutes, 
                    works with any backup method, and sends alerts via email, Slack, or Discord. Learn more about 
                    <Link href="/backup-dead-man-switch" className="text-primary hover:underline font-medium"> backup dead man switch</Link>.
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
                  </div>
                </div>
              </section>
            </AnimatedSection>

            <RelatedArticles slug="backup-monitoring-without-infrastructure" />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

