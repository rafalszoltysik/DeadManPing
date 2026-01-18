import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { Logo } from '@/components/Logo'
import { DiscordIcon, SlackIcon, EmailIcon, MonitorIcon } from '@/components/Icons'
import { DashboardPreview } from '@/components/DashboardPreview'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { PricingSection } from '@/components/PricingSection'
import { CTAButton } from '@/components/CTAButton'

export const metadata: Metadata = {
  title: "Cron Monitoring Without Changing Your Setup | DeadManPing",
  description: "Keep your cron. Keep your scripts. DeadManPing monitors your cron jobs without touching how they run. One curl line. Zero execution changes.",
  keywords: "cron monitoring, outcome-based cron monitoring, cron monitoring without migration, cron job monitoring, job result monitoring, scheduled task monitoring, backup monitoring, cron job alerts, detect cron job failure, monitor cron jobs, job monitoring service, result-aware monitoring, declarative rules, job outcome verifier",
  openGraph: {
    title: "Cron Monitoring Without Changing Your Setup | DeadManPing",
    description: "Keep your cron. Keep your scripts. DeadManPing monitors your cron jobs without touching how they run. One curl line. Zero execution changes.",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DeadManPing",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "9",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31"
      },
    "description": "Dead man switch monitoring for cron jobs and scheduled tasks. Get instant alerts when your backups, reports, or sync jobs don't run.",
    "featureList": [
      "Cron job monitoring",
      "Dead man switch",
      "Email alerts",
      "Slack/Discord integrations",
      "Scheduled task monitoring"
    ]
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Navigation */}
      <PageNav />

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="pt-12 sm:pt-20 pb-12 sm:pb-16 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
              Keep your cron.<br className="hidden sm:block" />We verify results.
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2">
              One curl line. Zero execution changes. Stop writing alert connectors.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
              <CTAButton className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-smooth hover-lift shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                Start monitoring in 2 minutes
              </CTAButton>
            </div>
            <p className="text-sm text-muted-foreground">
              14-day free trial · No credit card required
            </p>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="py-8 sm:py-12 lg:py-16">
          <DashboardPreview />
        </section>

        {/* Problem Section */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="The problem">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">The uncomfortable truth</h2>
              <p className="text-xl sm:text-2xl text-center mb-8 sm:mb-12 text-muted-foreground">
                Most cron jobs don't fail loudly.<br />
                They succeed… incorrectly.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
                <AnimatedItem delay={0}>
                  <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[80px] card-hover">
                    <p className="text-sm text-muted-foreground">zero rows processed</p>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={100}>
                  <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[80px] card-hover">
                    <p className="text-sm text-muted-foreground">partial data</p>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={200}>
                  <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[80px] card-hover">
                    <p className="text-sm text-muted-foreground">wrong counts</p>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={300}>
                  <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[80px] card-hover">
                    <p className="text-sm text-muted-foreground">outdated results</p>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={400}>
                  <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[80px] card-hover">
                    <p className="text-sm text-muted-foreground">skipped logic paths</p>
                  </div>
                </AnimatedItem>
              </div>
              <p className="text-center mt-8 text-lg text-muted-foreground">
                And no alert fires.
              </p>
            </div>
          </section>
        </AnimatedSection>

        {/* Why Other Tools Fail */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20" aria-label="Why other tools fail">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Why existing monitoring tools fail here</h2>
            
            <div className="space-y-8 sm:space-y-12">
              <AnimatedItem delay={0}>
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Plain webhooks (Discord / Slack)
                  </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• You must write your own connectors</li>
                  <li>• Logic buried in scripts</li>
                  <li>• No shared state</li>
                  <li>• No recovery</li>
                  <li>• No "job didn't run" detection</li>
                  <li>• Every script behaves differently</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground italic">
                  After 10 jobs: "I don't remember which script checks what."
                </p>
                <p className="mt-4 text-sm font-medium">
                  DeadManPing = Stop writing connectors. One curl line. Rest in the dashboard.
                </p>
                </div>
              </AnimatedItem>

              <AnimatedItem delay={150}>
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Error monitoring tools
                  </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• alerts only on exceptions</li>
                  <li>• requires code-level decisions</li>
                  <li>• thresholds = deploys</li>
                  <li>• no concept of "wrong result"</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground italic">
                  If your job returns count = 3 instead of 100, error trackers are silent.
                </p>
                </div>
              </AnimatedItem>

              <AnimatedItem delay={300}>
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Binary ping monitors
                  </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• binary signal: ping or no ping</li>
                  <li>• job ran ≠ job succeeded</li>
                  <li>• zero awareness of results</li>
                </ul>
                <p className="mt-4 text-sm font-medium">
                  "The cron ran" is not the same as "The cron did its job."
                </p>
                </div>
              </AnimatedItem>

              <AnimatedItem delay={450}>
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Job schedulers (Jenkins, Airflow)
                  </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Require migration from cron</li>
                  <li>• GUI-based configuration</li>
                  <li>• Vendor lock-in</li>
                  <li>• Complex setup and maintenance</li>
                </ul>
                <p className="mt-4 text-sm font-medium">
                  DeadManPing works with your existing cron. No migration needed.
                </p>
                </div>
              </AnimatedItem>
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* What DeadManPing is NOT */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="What DeadManPing is NOT">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
                What DeadManPing is <span className="text-error">NOT</span>
              </h2>
              <div className="space-y-4">
                <AnimatedItem delay={0}>
                  <div className="bg-background border border-border rounded-lg p-6 card-hover">
                <p className="text-lg text-muted-foreground mb-4">
                  DeadManPing is <span className="text-error font-semibold">not</span> a job scheduler
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  DeadManPing does <span className="text-error font-semibold">not</span> run your jobs
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  DeadManPing does <span className="text-error font-semibold">not</span> replace cron
                </p>
                <p className="text-lg text-muted-foreground mb-4">
                  DeadManPing does <span className="text-error font-semibold">not</span> touch execution
                </p>
                <p className="text-lg text-success font-semibold mt-6">
                  DeadManPing only observes the effects of execution
                </p>
                </div>
              </AnimatedItem>
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* What DeadManPing Does */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20" aria-label="What DeadManPing does">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">What DeadManPing does differently</h2>
            <p className="text-xl sm:text-2xl mb-4 sm:mb-6 text-muted-foreground">
              DeadManPing separates execution from evaluation.
            </p>
            <p className="text-lg sm:text-xl mb-8 sm:mb-12">
              Your cron runs your scripts.<br />
              Your scripts send facts.<br />
              DeadManPing decides if that's OK.
            </p>
          </div>
        </section>
        </AnimatedSection>

        {/* What You DON'T Need to Build */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="What you don't need to build">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">What You DON'T Need to Build</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
              <AnimatedItem delay={0}>
                <div className="bg-background border border-border rounded-lg p-6 card-hover">
                  <p className="text-muted-foreground mb-2">
                    Connectors to Slack/Discord/Email
                  </p>
                  <p className="text-sm text-muted-foreground">Everything is in the dashboard</p>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={100}>
                <div className="bg-background border border-border rounded-lg p-6 card-hover">
                  <p className="text-muted-foreground mb-2">
                    Logic to check if job executed
                  </p>
                  <p className="text-sm text-muted-foreground">DeadManPing does this automatically</p>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={200}>
                <div className="bg-background border border-border rounded-lg p-6 card-hover">
                  <p className="text-muted-foreground mb-2">
                    State management
                  </p>
                  <p className="text-sm text-muted-foreground">DeadManPing tracks state changes</p>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={300}>
                <div className="bg-background border border-border rounded-lg p-6 card-hover">
                  <p className="text-muted-foreground mb-2">
                    Recovery logic
                  </p>
                  <p className="text-sm text-muted-foreground">Alerts only on state change, no spam</p>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={400}>
                <div className="bg-background border border-border rounded-lg p-6 card-hover">
                  <p className="text-muted-foreground mb-2">
                    Monitoring dashboard
                  </p>
                  <p className="text-sm text-muted-foreground">Everything in one place</p>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={500}>
                <div className="bg-background border border-border rounded-lg p-6 card-hover">
                  <p className="text-muted-foreground mb-2">
                    Payload validation logic
                  </p>
                  <p className="text-sm text-muted-foreground">Rules in UI, not in code</p>
                </div>
              </AnimatedItem>
            </div>
            <p className="text-center text-lg sm:text-xl font-semibold">
              Stop writing alert connectors. One curl line. Rest in the dashboard.
            </p>
          </div>
        </section>
        </AnimatedSection>

        {/* How It Works */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20" aria-label="How DeadManPing works">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 px-4">How It Works</h2>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 lg:space-y-12">
            <AnimatedItem delay={0}>
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 card-hover">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-smooth group-hover:bg-primary/20">
                    <span className="text-lg sm:text-xl font-mono font-bold text-primary">1</span>
                  </div>
                <div className="flex-grow min-w-0 w-full sm:w-auto">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Add one line at the end of your existing script</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    Cron runs your script. Your script executes logic and collects data. At the end of your script — one curl line with data from execution.
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 font-medium">
                    Important: Curl must be INSIDE the script, not in the cron line, because only in the script do you have access to variables from execution results.
                  </p>
                  <div className="bg-background border border-border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 overflow-hidden">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-mono break-words"># sync_users.sh</p>
                    <pre className="bg-background border border-border rounded-lg p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm">
                      <code className="break-words">{`#!/bin/bash
users_synced=$(./sync_users_logic.sh)
if [ $? -eq 0 ]; then
  curl https://deadmanping.com/ping/abc123 -H "Content-Type: application/json" -d "{\\"success\\": true, \\"count\\": $users_synced}"
else
  curl https://deadmanping.com/ping/abc123 -H "Content-Type: application/json" -d '{"success": false}'
fi`}</code>
                    </pre>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-mono break-words"># In crontab: */5 * * * * /path/to/sync_users.sh</p>
                  </div>
                  <ul className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 text-muted-foreground text-xs sm:text-sm">
                    <li>• No SDKs.</li>
                    <li>• No branching logic.</li>
                    <li>• No alert decisions in code.</li>
                    <li>• Data comes from execution, not hardcoded.</li>
                  </ul>
                </div>
              </div>
              </div>
            </AnimatedItem>

            <AnimatedItem delay={200}>
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 card-hover">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-smooth group-hover:bg-primary/20">
                    <span className="text-lg sm:text-xl font-mono font-bold text-primary">2</span>
                  </div>
                <div className="flex-grow min-w-0 w-full sm:w-auto">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Define rules in the dashboard</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Example rules:</p>
                  <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                    <li>• <code className="bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm break-words">success == true</code></li>
                    <li>• <code className="bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm break-words">count {'>='} 100 → OK</code></li>
                    <li>• <code className="bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm break-words">count {'<'} 100 → WARN</code></li>
                    <li>• <code className="bg-background px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm break-words">no ping for 15 min → FAIL</code></li>
                  </ul>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Change rules anytime. No redeploys.
                  </p>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem delay={400}>
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 card-hover">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-smooth group-hover:bg-primary/20">
                    <span className="text-lg sm:text-xl font-mono font-bold text-primary">3</span>
                  </div>
                <div className="flex-grow min-w-0 w-full sm:w-auto">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Get state-aware alerts</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">DeadManPing tracks transitions:</p>
                  <ul className="space-y-1 sm:space-y-2 text-muted-foreground text-xs sm:text-sm">
                    <li>• OK → FAIL</li>
                    <li>• FAIL → OK</li>
                    <li>• job didn't run</li>
                    <li>• result degraded but not broken</li>
                  </ul>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
                    No spam. No silence.
                  </p>
                </div>
              </div>
            </AnimatedItem>
          </div>
        </section>
        </AnimatedSection>

        {/* Real-World Examples */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Real-world examples">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Real-World Examples</h2>
            <p className="text-center text-lg text-muted-foreground mb-8 sm:mb-12">
              Different types of verification that DeadManPing can monitor:
            </p>
            <div className="space-y-6 sm:space-y-8">
              {/* First row: File Verification and Status Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <AnimatedItem delay={0}>
                  <div className="bg-background border border-border rounded-lg p-6 card-hover h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-3">File Verification</h3>
                    <p className="text-sm text-muted-foreground mb-3">Check if backup file exists and size (GB)</p>
                    <pre className="bg-background border border-border rounded p-3 overflow-x-hidden text-xs break-words whitespace-pre-wrap flex-grow">
                      <code className="break-words">{`if [ -f "$BACKUP_FILE" ]; then
  FILE_SIZE_GB=$(du -h "$BACKUP_FILE" | ...)
  curl ... -d "{\\"file_exists\\": true, 
    \\"size_gb\\": $FILE_SIZE_GB}"
fi`}</code>
                    </pre>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={100}>
                  <div className="bg-background border border-border rounded-lg p-6 card-hover h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-3">Status Verification</h3>
                    <p className="text-sm text-muted-foreground mb-3">Success/failure with context</p>
                    <pre className="bg-background border border-border rounded p-3 overflow-x-hidden text-xs break-words whitespace-pre-wrap flex-grow">
                      <code className="break-words">{`if ./backup.sh; then
  curl ... -d "{\\"success\\": true, 
    \\"backup_size\\": \\"$SIZE\\"}"
else
  curl ... -d "{\\"success\\": false, 
    \\"error\\": \\"$ERROR\\"}"
fi`}</code>
                    </pre>
                  </div>
                </AnimatedItem>
              </div>
              
              {/* Second row: Duration Verification and Threshold Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <AnimatedItem delay={200}>
                  <div className="bg-background border border-border rounded-lg p-6 card-hover h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-3">Duration Verification</h3>
                    <p className="text-sm text-muted-foreground mb-3">How long script execution took</p>
                    <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs flex-grow">
                      <code>{`START_TIME=$(date +%s)
./generate_report.sh
DURATION=$((END_TIME - START_TIME))
curl ... -d "{\\"duration_seconds\\": $DURATION}"`}</code>
                    </pre>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={300}>
                  <div className="bg-background border border-border rounded-lg p-6 card-hover h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-3">Threshold Verification</h3>
                    <p className="text-sm text-muted-foreground mb-3">Numeric values (more/less than X)</p>
                    <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs flex-grow">
                      <code>{`FILES_DELETED=$(./cleanup.sh | wc -l)
curl ... -d "{\\"files_deleted\\": $FILES_DELETED}"
# In dashboard: files_deleted >= 10 → OK, < 10 → WARN`}</code>
                    </pre>
                  </div>
                </AnimatedItem>
              </div>
              
              {/* Third row: Count Verification centered */}
              <div className="flex justify-center px-4 sm:px-0">
                <AnimatedItem delay={400}>
                  <div className="bg-background border border-border rounded-lg p-4 sm:p-6 card-hover w-full max-w-md flex flex-col">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Count Verification</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">How many records/items were processed</p>
                    <pre className="bg-background border border-border rounded p-2 sm:p-3 overflow-x-auto text-xs flex-grow">
                      <code className="break-words whitespace-pre-wrap">{`RECORDS_PROCESSED=$(./sync.sh | grep -c "synced")
curl ... -d "{\\"count\\": $RECORDS_PROCESSED}"`}</code>
                    </pre>
                  </div>
                </AnimatedItem>
              </div>
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* Key Differentiators */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Key differentiators">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Key Differentiators</h2>
            <div className="space-y-6 sm:space-y-8">
              {/* First 4 items in 2x2 grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <AnimatedItem delay={0}>
                  <div className="bg-background border border-border rounded-lg p-6 card-hover h-full">
                    <h3 className="text-lg font-semibold mb-3">Result-aware monitoring</h3>
                    <p className="text-muted-foreground">We monitor outcomes, not just execution.</p>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={100}>
                  <div className="bg-background border border-border rounded-lg p-6 card-hover h-full">
                    <h3 className="text-lg font-semibold mb-3">Declarative rules</h3>
                    <p className="text-muted-foreground">Rules live in the UI, not inside scripts.</p>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={200}>
                  <div className="bg-background border border-border rounded-lg p-6 card-hover h-full">
                    <h3 className="text-lg font-semibold mb-3">Built-in recovery logic</h3>
                    <p className="text-muted-foreground">Alerts fire on state change, not every run.</p>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={300}>
                  <div className="bg-background border border-border rounded-lg p-6 card-hover h-full">
                    <h3 className="text-lg font-semibold mb-3">Missing-run detection</h3>
                    <p className="text-muted-foreground">If your cron never executes — you still get alerted.</p>
                  </div>
                </AnimatedItem>
              </div>
              
              {/* Last item centered */}
              <div className="flex justify-center">
                <AnimatedItem delay={400}>
                  <div className="bg-background border border-border rounded-lg p-6 card-hover w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-3">Zero custom logic per customer</h3>
                    <p className="text-muted-foreground">Same payload schema. Same evaluation engine. No support burden.</p>
                  </div>
                </AnimatedItem>
              </div>
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* Feature Comparison Table */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20" aria-label="Feature comparison">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">What You Get</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold">DeadManPing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-4 text-muted-foreground">Detect job didn't run</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl">✓</span>
                      </td>
                    </tr>
                    <tr className="bg-background/50">
                      <td className="p-4 text-muted-foreground">Inspect job results</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl">✓</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-muted-foreground">Payload-based rules</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl">✓</span>
                      </td>
                    </tr>
                    <tr className="bg-background/50">
                      <td className="p-4 text-muted-foreground">Thresholds in UI</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl">✓</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-muted-foreground">OK → FAIL tracking</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl">✓</span>
                      </td>
                    </tr>
                    <tr className="bg-background/50">
                      <td className="p-4 text-muted-foreground">Requires SDK</td>
                      <td className="p-4 text-center">
                        <span className="text-destructive text-xl">✗</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 text-muted-foreground">Requires code logic</td>
                      <td className="p-4 text-center">
                        <span className="text-destructive text-xl">✗</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* Integrations Section */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Integrations">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Integrate with Your Workflow</h2>
            <p className="text-muted-foreground mb-8 sm:mb-12 text-base sm:text-lg">
              Get alerts where your team already works
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <AnimatedItem delay={0}>
                <div className="bg-background border border-border rounded-lg p-6 hover-lift transition-smooth group card-hover">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-[#5865F2]/10 p-4 rounded-lg group-hover:bg-[#5865F2]/20 transition-smooth group-hover:scale-110">
                      <DiscordIcon className="w-8 h-8 text-[#5865F2]" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Discord</h3>
                  <p className="text-sm text-muted-foreground">Real-time alerts in your Discord channels</p>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={150}>
                <div className="bg-background border border-border rounded-lg p-6 hover-lift transition-smooth group card-hover">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-[#4A154B]/10 p-4 rounded-lg group-hover:bg-[#4A154B]/20 transition-smooth group-hover:scale-110 flex items-center justify-center">
                      <SlackIcon className="w-8 h-8 text-[#4A154B] flex-shrink-0" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 text-center">Slack</h3>
                  <p className="text-sm text-muted-foreground text-center">Notifications directly in your Slack workspace</p>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={300}>
                <div className="bg-background border border-border rounded-lg p-6 hover-lift transition-smooth group card-hover">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-primary/10 p-4 rounded-lg group-hover:bg-primary/20 transition-smooth group-hover:scale-110">
                      <EmailIcon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-sm text-muted-foreground">Instant email notifications for critical alerts</p>
                </div>
              </AnimatedItem>
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* Pricing */}
        <PricingSection />

        {/* Who This Is For */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Who this is for">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Who This Is For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-success">Built for:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• backend developers</li>
                  <li>• solo founders</li>
                  <li>• infra & ops</li>
                  <li>• data pipelines</li>
                  <li>• maintenance & batch jobs</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-red-500">Not for:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• realtime apps</li>
                  <li>• error debugging</li>
                  <li>• APM</li>
                  <li>• log aggregation</li>
                </ul>
              </div>
            </div>
            <p className="text-center mt-8 text-lg font-medium">
              DeadManPing is not an error tracker.<br />
              It's a job outcome verifier.
            </p>
          </div>
        </section>
        </AnimatedSection>

        {/* Positioning One-liner */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Positioning">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-relaxed">
              Error trackers tell you when your job crashed.<br />
              DeadManPing tells you when it succeeded… incorrectly.
            </p>
          </div>
        </section>
        </AnimatedSection>

        {/* CTA Section */}
        <AnimatedSection>
          <section className="py-12 sm:py-16 lg:py-20 bg-card border-2 border-primary/20 rounded-xl sm:rounded-2xl my-12 sm:my-16 lg:my-20 text-center px-4 relative overflow-hidden" aria-label="Get started">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Stop trusting green checkmarks.
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
              Monitor results, not assumptions.
            </p>
            <CTAButton className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium inline-block transition-smooth hover-lift shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
              Get started in 2 minutes
            </CTAButton>
          </div>
        </section>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                <Logo showText={true} variant="with-text" className="text-lg" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Simple monitoring for your cron jobs and scheduled tasks.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/monitor-cron-jobs" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Monitor Cron Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/dead-man-switch" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Dead Man Switch
                  </Link>
                </li>
                <li>
                  <Link href="/backup-monitoring" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Backup Monitoring
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/cookies" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DeadManPing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
