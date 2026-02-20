/**
 * Backup dead man switch marketing page.
 * 
 * Landing page specifically for backup monitoring use case. Includes feature
 * highlights, code examples, and call-to-action. SEO optimized with structured
 * data. Static generation with hourly revalidation.
 * 
 * Does not require authentication - public marketing page.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { Footer } from '@/components/Footer'
import { CodeBlock } from '@/components/CodeBlock'
import { AnimatedSection, AnimatedItem, StaggerContainer } from '@/components/AnimatedSection'
import { CTAButton } from '@/components/CTAButton'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Backup Dead Man Switch - Detect Failed & Empty Backups Instantly",
  description: "Monitor backup jobs with a dead man switch. One curl line detects empty files, missed runs, stale backups. No agent install. Free tier, 2-min setup.",
  keywords: "backup dead man switch, dead man switch backup, backup monitoring, detect empty backup file, backup failure detection, backup monitoring without infrastructure, empty backup file detection, backup file zero bytes, dead man switch for backups, monitor backup jobs",
  openGraph: {
    title: "Backup Dead Man Switch - Detect Failed & Empty Backups Instantly",
    description: "Monitor backup jobs with a dead man switch. One curl line detects empty files, missed runs, stale backups. No agent install. Free tier, 2-min setup.",
    type: "website",
    url: `${cleanBaseUrl}/backup-dead-man-switch`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Backup Dead Man Switch - Detect Failed & Empty Backups",
    description: "Monitor backup jobs with a dead man switch. One curl line detects empty files, missed runs, stale backups. No agent. Free tier.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/backup-dead-man-switch`,
  },
}

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Backup Dead Man Switch - Detect Failed & Empty Backups Instantly",
  "description": "Monitor backup jobs with a dead man switch. One curl line detects empty files, missed runs, stale backups. No agent install. Free tier, 2-min setup.",
  "url": `${cleanBaseUrl}/backup-dead-man-switch`,
  "inLanguage": "en-US",
  "isPartOf": {
    "@type": "WebSite",
    "name": "DeadManPing",
    "url": cleanBaseUrl
  }
}

export default function BackupDeadManSwitchPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        suppressHydrationWarning
      />
      <PageNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="pt-12 sm:pt-20 pb-12 sm:pb-16 text-center">
          <AnimatedSection className="max-w-4xl mx-auto" delay={0} direction="fade" duration={1000}>
            <AnimatedItem delay={100} direction="up" duration={800}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-relaxed animate-gradient pb-2 overflow-visible">
                Backup Dead Man Switch: Never Miss a Failed Backup
              </h1>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={800}>
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2">
                Backup failed at 3 AM — how do you know?<br className="hidden sm:block" />Dead man switch. One curl line. Your backup logic stays the same.
              </p>
            </AnimatedItem>
            <AnimatedItem delay={300} direction="up" duration={800}>
              <div className="flex flex-col items-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
                <CTAButton className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-smooth hover-lift-smooth shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover-scale">
                  Start monitoring backups in 2 minutes
                </CTAButton>
                <p className="text-sm text-muted-foreground">
                  14-day free trial · No credit card required
                </p>
              </div>
            </AnimatedItem>
          </AnimatedSection>
        </section>

        {/* Problem Section */}
        <AnimatedSection className="pt-0 sm:pt-0 lg:pt-0 pb-12 sm:pb-16 lg:pb-20" delay={100} direction="up" duration={800}>
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">The Problem: Backup Failures Go Undetected</h2>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={700}>
              <p className="text-xl sm:text-2xl text-center mb-8 sm:mb-12 text-muted-foreground">
                Most backups don't fail loudly.<br />
                They succeed… incorrectly.
              </p>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6" staggerDelay={80}>
              <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[100px] card-hover hover-lift-smooth">
                <p className="text-sm text-muted-foreground">empty backup file</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[100px] card-hover hover-lift-smooth">
                <p className="text-sm text-muted-foreground">zero bytes</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[100px] card-hover hover-lift-smooth">
                <p className="text-sm text-muted-foreground">outdated backup</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[100px] card-hover hover-lift-smooth">
                <p className="text-sm text-muted-foreground">backup didn't run</p>
              </div>
            </StaggerContainer>
            <AnimatedItem delay={450} direction="up" duration={700}>
              <p className="text-center mt-8 text-lg text-muted-foreground">
                And no alert fires. Until it's too late.
              </p>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* Solution Section */}
        <AnimatedSection className="pt-0 sm:pt-0 lg:pt-0 pb-12 sm:pb-16 lg:pb-20" delay={200} direction="up" duration={800}>
          <div className="max-w-5xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Solution: Dead Man Switch for Backups</h2>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={700}>
              <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover">
                <p className="text-muted-foreground mb-4">
                  <strong>DeadManPing doesn't run your backups. Your cron does. DeadManPing only observes if the ping arrived.</strong>
                </p>
                <p className="text-muted-foreground mb-4">
                  After each successful backup, your script pings a monitoring service. If the ping doesn't arrive within the expected interval, you get an alert. It's independent of your backup infrastructure, so it works with any backup method.
                </p>
                <p className="text-muted-foreground">
                  <strong>Important:</strong> The curl command must be <strong>inside your backup script</strong>, not in the cron line, because only in the script do you have access to variables from execution results (e.g., backup file size, success status).
                </p>
              </div>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* Use Cases Section */}
        <AnimatedSection className="pt-0 sm:pt-0 lg:pt-0 pb-12 sm:pb-16 lg:pb-20" delay={300} direction="up" duration={800}>
          <div className="max-w-5xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">What Dead Man Switch Detects</h2>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" staggerDelay={100}>
              <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover h-full">
                <h3 className="text-xl font-semibold mb-4">Empty Backup File (0 bytes)</h3>
                <p className="text-muted-foreground mb-4">
                  Backup script runs, but the backup file is empty. Dead man switch detects this by validating file size in payload.
                </p>
                <CodeBlock
                  code={`#!/bin/bash
BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql"
pg_dump mydb > "$BACKUP_FILE"

# Get file size
FILE_SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || echo 0)

# Ping with file size - DeadManPing validates size > 0
curl -X POST "https://deadmanping.com/api/ping/backup-db?size=$FILE_SIZE"`}
                  language="bash"
                />
              </div>

              <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover h-full">
                <h3 className="text-xl font-semibold mb-4">Backup Didn't Run</h3>
                <p className="text-muted-foreground mb-4">
                  Cron job gets disabled or fails to execute. Dead man switch detects missing ping within expected interval.
                </p>
                <CodeBlock
                  code={`#!/bin/bash
set -e

# Run backup
rsync -avz /data/ user@backup-server:/backups/

# If backup fails, script exits and ping never arrives
curl -X POST "https://deadmanping.com/api/ping/backup-rsync"`}
                  language="bash"
                />
              </div>

              <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover h-full">
                <h3 className="text-xl font-semibold mb-4">Outdated Backup</h3>
                <p className="text-muted-foreground mb-4">
                  Backup runs but contains old data. Dead man switch validates backup age using payload validation.
                </p>
                <CodeBlock
                  code={`#!/bin/bash
BACKUP_FILE="/backups/backup-$(date +%Y%m%d).tar.gz"
tar -czf "$BACKUP_FILE" /data/

# Get backup age in hours
HOURS_SINCE=$(($(date +%s) - $(stat -c %Y "$BACKUP_FILE")) / 3600)

# Ping with age - DeadManPing validates age < 24 hours
curl -X POST "https://deadmanping.com/api/ping/backup-daily?hours_since=$HOURS_SINCE"`}
                  language="bash"
                />
              </div>

              <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover h-full">
                <h3 className="text-xl font-semibold mb-4">Partial Backup</h3>
                <p className="text-muted-foreground mb-4">
                  Multi-step backup partially fails. Dead man switch detects incomplete backups using step completion tracking.
                </p>
                <CodeBlock
                  code={`#!/bin/bash
FAILED_STEPS=0

# Step 1: Database backup
pg_dump mydb > /backups/db.sql || ((FAILED_STEPS++))

# Step 2: File sync
rsync -avz /data/ user@server:/backup/ || ((FAILED_STEPS++))

# Ping with failed steps count - DeadManPing validates == 0
curl -X POST "https://deadmanping.com/api/ping/backup-multi?failed_steps=$FAILED_STEPS"`}
                  language="bash"
                />
              </div>
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* How It Works Section */}
        <AnimatedSection className="pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20 bg-card/50 border-y border-border" delay={400} direction="up" duration={800}>
          <div className="max-w-5xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8" staggerDelay={100}>
              <div className="bg-background border border-border rounded-lg p-6 text-center card-hover hover-lift-smooth h-full flex flex-col">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary text-xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Your Backup Runs</h3>
                <p className="text-sm text-muted-foreground flex-grow">
                  Your cron job executes your backup script as usual. No changes to your backup logic.
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-6 text-center card-hover hover-lift-smooth h-full flex flex-col">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary text-xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">Script Sends Ping</h3>
                <p className="text-sm text-muted-foreground flex-grow">
                  At the end of your script, one curl line sends ping with backup data (file size, status, etc.).
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-6 text-center card-hover hover-lift-smooth h-full flex flex-col">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary text-xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">We Validate & Alert</h3>
                <p className="text-sm text-muted-foreground flex-grow">
                  DeadManPing validates backup data and alerts if backup fails or is missing.
                </p>
              </div>
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection className="pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20" delay={500} direction="up" duration={900}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-card border-2 border-primary/20 rounded-xl sm:rounded-2xl py-8 sm:py-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
              <div className="relative z-10">
                <AnimatedItem delay={100} direction="up" duration={700}>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                    Stop trusting that backups just work.
                  </h2>
                </AnimatedItem>
                <AnimatedItem delay={200} direction="up" duration={700}>
                  <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
                    Monitor backups, not assumptions.
                  </p>
                </AnimatedItem>
                <AnimatedItem delay={300} direction="up" duration={700}>
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <CTAButton className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium inline-block transition-smooth hover-lift-smooth hover-scale shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                      Get started in 2 minutes
                    </CTAButton>
                    <p className="text-sm text-muted-foreground">
                      14-day free trial · No credit card required
                    </p>
                  </div>
                </AnimatedItem>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Related Links */}
        <AnimatedSection className="pt-0 sm:pt-0 lg:pt-0 pb-12 sm:pb-16 lg:pb-20" delay={600} direction="up" duration={800}>
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Learn More</h2>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" staggerDelay={100}>
              <Link
                href="/blog/dead-man-switch"
                className="block bg-card border border-border rounded-lg p-6 card-hover hover-lift-smooth text-left h-full"
              >
                <h3 className="text-lg font-semibold mb-2">Dead Man Switch for Backups</h3>
                <p className="text-sm text-muted-foreground">
                  Complete guide on implementing dead man switch monitoring for backup jobs.
                </p>
              </Link>
              <Link
                href="/blog/detect-empty-backup-file"
                className="block bg-card border border-border rounded-lg p-6 card-hover hover-lift-smooth text-left h-full"
              >
                <h3 className="text-lg font-semibold mb-2">Detect Empty Backup File</h3>
                <p className="text-sm text-muted-foreground">
                  How to detect when backup files are empty or zero bytes using payload validation.
                </p>
              </Link>
            </StaggerContainer>
          </div>
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  )
}

