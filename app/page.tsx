import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { Logo } from '@/components/Logo'
import { DiscordIcon, SlackIcon, EmailIcon, MonitorIcon } from '@/components/Icons'
import { DashboardPreview } from '@/components/DashboardPreview'
import { PricingSection } from '@/components/PricingSection'
import { CTAButton } from '@/components/CTAButton'
import { ErrorHandlerWrapper } from '@/components/ErrorHandlerWrapper'
import { AnimatedSection, AnimatedItem, StaggerContainer } from '@/components/AnimatedSection'
import { SiPython, SiNodedotjs, SiRuby, SiGo, SiPhp } from 'react-icons/si'
import { FaTerminal } from 'react-icons/fa'

export const metadata: Metadata = {
  title: "Cron Monitoring Without Changing Your Setup | DeadManPing",
  description: "Keep your cron. Keep your scripts. DeadManPing monitors your cron jobs without touching how they run. One curl line. Zero execution changes.",
  keywords: "cron monitoring, outcome-based cron monitoring, cron monitoring without migration, cron job monitoring, job result monitoring, scheduled task monitoring, backup monitoring, cron job alerts, detect cron job failure, monitor cron jobs, job monitoring service, result-aware monitoring, declarative rules, job outcome verifier",
  openGraph: {
    title: "Cron Monitoring Without Changing Your Setup | DeadManPing",
    description: "Keep your cron. Keep your scripts. DeadManPing monitors your cron jobs without touching how they run. One curl line. Zero execution changes.",
    type: "website",
    images: [
      {
        url: "https://deadmanping.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "DeadManPing - Monitor Your Cron Jobs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Monitoring Without Changing Your Setup | DeadManPing",
    description: "Keep your cron. Keep your scripts. DeadManPing monitors your cron jobs without touching how they run. One curl line. Zero execution changes.",
    images: ["https://deadmanping.com/og-image.png"],
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
      <ErrorHandlerWrapper />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Navigation */}
      <PageNav />

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="pt-12 sm:pt-20 pb-12 sm:pb-16 text-center">
          <AnimatedSection className="max-w-4xl mx-auto" delay={0} direction="fade" duration={1000}>
            <AnimatedItem delay={100} direction="up" duration={800}>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-tight animate-gradient">
                Keep your cron.<br className="hidden sm:block" />We verify results.
              </h1>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={800}>
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2">
                One curl line. Zero execution changes. Stop writing alert connectors.
              </p>
            </AnimatedItem>
            <AnimatedItem delay={300} direction="up" duration={800}>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
                <CTAButton className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-smooth hover-lift-smooth shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover-scale">
                  Start monitoring in 2 minutes
                </CTAButton>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={400} direction="up" duration={800}>
              <p className="text-sm text-muted-foreground">
                14-day free trial · No credit card required
              </p>
            </AnimatedItem>
          </AnimatedSection>
        </section>

        {/* Dashboard Preview */}
        <AnimatedSection className="py-8 sm:py-12 lg:py-16" delay={0} direction="up" duration={900}>
          <DashboardPreview />
        </AnimatedSection>

        {/* The uncomfortable truth */}
        <AnimatedSection className="py-12 sm:py-16 lg:py-20" delay={0} direction="up" duration={800}>
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">The uncomfortable truth</h2>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={700}>
              <p className="text-xl sm:text-2xl text-center mb-8 sm:mb-12 text-muted-foreground">
                Most cron jobs don't fail loudly.<br />
                They succeed… incorrectly.
              </p>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6" staggerDelay={80}>
              <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[80px] card-hover hover-lift-smooth">
                <p className="text-sm text-muted-foreground">zero rows processed</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[80px] card-hover hover-lift-smooth">
                <p className="text-sm text-muted-foreground">partial data</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[80px] card-hover hover-lift-smooth">
                <p className="text-sm text-muted-foreground">wrong counts</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[80px] card-hover hover-lift-smooth">
                <p className="text-sm text-muted-foreground">outdated results</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center flex items-center justify-center min-h-[80px] card-hover hover-lift-smooth">
                <p className="text-sm text-muted-foreground">skipped logic paths</p>
              </div>
            </StaggerContainer>
            <AnimatedItem delay={600} direction="up" duration={700}>
              <p className="text-center mt-8 text-lg text-muted-foreground">
                And no alert fires.
              </p>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* Why Other Tools Fail */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20" aria-label="Why other tools fail" delay={0} direction="up" duration={800}>
          <div className="max-w-5xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Why existing monitoring tools fail here</h2>
            </AnimatedItem>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" staggerDelay={100}>
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover h-full">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Plain webhooks (Discord / Slack)
                  </h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• You must write your own connectors</li>
                  <li>• No "job didn't run" detection</li>
                </ul>
                <p className="text-sm font-medium">
                  DeadManPing = Stop writing connectors. One curl line. Rest in the dashboard.
                </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover h-full">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Error monitoring tools
                  </h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• Alerts only on exceptions</li>
                  <li>• No concept of "wrong result"</li>
                </ul>
                <p className="text-sm font-medium">
                  If your job returns count = 3 instead of 100, error trackers are silent.
                </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover h-full">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Binary ping monitors
                  </h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• Binary signal: ping or no ping</li>
                  <li>• Zero awareness of results</li>
                </ul>
                <p className="text-sm font-medium">
                  "The cron ran" is not the same as "The cron did its job."
                </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 card-hover h-full">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Job schedulers
                  </h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• Require migration from cron</li>
                  <li>• Complex setup and maintenance</li>
                </ul>
                <p className="text-sm font-medium">
                  DeadManPing works with your existing cron. No migration needed.
                </p>
                </div>
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* What DeadManPing is NOT */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="What DeadManPing is NOT" delay={0} direction="up" duration={800}>
            <div className="max-w-4xl mx-auto px-4">
              <AnimatedItem delay={100} direction="up" duration={700}>
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
                  What <span className="text-foreground">DeadMan</span><span className="text-primary">Ping</span> is NOT
                </h2>
              </AnimatedItem>
              <AnimatedItem delay={200} direction="up" duration={700}>
                <div className="bg-background border border-border rounded-lg p-6 sm:p-8 mb-6 card-hover hover-lift-smooth">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                    <div className="flex items-center justify-center gap-3 transition-all duration-300 hover:translate-x-1 hover:text-foreground">
                      <span className="text-muted-foreground/60 text-lg flex-shrink-0 transition-transform duration-300 hover:scale-125">•</span>
                      <span className="text-base sm:text-lg">Not a job scheduler</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 transition-all duration-300 hover:translate-x-1 hover:text-foreground" style={{ transitionDelay: '50ms' }}>
                      <span className="text-muted-foreground/60 text-lg flex-shrink-0 transition-transform duration-300 hover:scale-125">•</span>
                      <span className="text-base sm:text-lg">Does not run your jobs</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 transition-all duration-300 hover:translate-x-1 hover:text-foreground" style={{ transitionDelay: '100ms' }}>
                      <span className="text-muted-foreground/60 text-lg flex-shrink-0 transition-transform duration-300 hover:scale-125">•</span>
                      <span className="text-base sm:text-lg">Does not replace cron</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 transition-all duration-300 hover:translate-x-1 hover:text-foreground" style={{ transitionDelay: '150ms' }}>
                      <span className="text-muted-foreground/60 text-lg flex-shrink-0 transition-transform duration-300 hover:scale-125">•</span>
                      <span className="text-base sm:text-lg">Does not touch execution</span>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
              <AnimatedItem delay={300} direction="up" duration={700}>
                <div className="bg-background border border-border rounded-lg p-6 sm:p-8 card-hover hover-lift-smooth">
                  <div className="flex items-center justify-center gap-4">
                    <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:bg-primary/20 hover:scale-110 hover:rotate-12">
                      <span className="text-primary text-lg sm:text-xl font-bold transition-transform duration-300 hover:scale-125">✓</span>
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-xl font-semibold mb-2 transition-colors duration-300 hover:text-primary">
                        We only observe the effects of execution
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground transition-colors duration-300 hover:text-foreground">
                        Your cron runs your scripts. We verify the results.
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            </div>
          </AnimatedSection>

        {/* What You DON'T Need to Build */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="What you don't need to build" delay={0} direction="up" duration={800}>
          <div className="max-w-5xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">What You DON'T Need to Build</h2>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8" staggerDelay={80}>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth">
                  <p className="text-muted-foreground mb-2">
                    Connectors to Slack/Discord/Email
                  </p>
                  <p className="text-sm text-muted-foreground">Everything is in the dashboard</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth">
                  <p className="text-muted-foreground mb-2">
                    Logic to check if job executed
                  </p>
                  <p className="text-sm text-muted-foreground">DeadManPing does this automatically</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth">
                  <p className="text-muted-foreground mb-2">
                    State management
                  </p>
                  <p className="text-sm text-muted-foreground">DeadManPing tracks state changes</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth">
                  <p className="text-muted-foreground mb-2">
                    Recovery logic
                  </p>
                  <p className="text-sm text-muted-foreground">Alerts only on state change, no spam</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth">
                  <p className="text-muted-foreground mb-2">
                    Monitoring dashboard
                  </p>
                  <p className="text-sm text-muted-foreground">Everything in one place</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth">
                  <p className="text-muted-foreground mb-2">
                    Payload validation logic
                  </p>
                  <p className="text-sm text-muted-foreground">Rules in UI, not in code</p>
                </div>
            </StaggerContainer>
            <AnimatedItem delay={600} direction="up" duration={700}>
              <p className="text-center text-lg sm:text-xl font-semibold">
                Stop writing alert connectors. One curl line. Rest in the dashboard.
              </p>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* How It Works */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20" aria-label="How DeadManPing works" delay={0} direction="up" duration={800}>
          <AnimatedItem delay={100} direction="up" duration={700}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 px-4">How It Works</h2>
          </AnimatedItem>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 lg:space-y-12">
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 card-hover animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-smooth group-hover:bg-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <span className="text-lg sm:text-xl font-mono font-bold text-primary">1</span>
                  </div>
                <div className="flex-grow min-w-0 w-full sm:w-auto">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 animate-fade-in" style={{ animationDelay: '150ms' }}>Add one line at the end of your existing script</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    Cron runs your script. Your script executes logic and collects data. At the end of your script — one curl line with data from execution.
                  </p>
                  
                  <div className="bg-primary/10 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
                    <p className="text-sm sm:text-base text-muted-foreground font-medium">
                      <span className="text-primary font-semibold">Important:</span> Curl must be <span className="font-semibold">INSIDE</span> the script, not in the cron line, because only in the script do you have access to variables from execution results.
                    </p>
                  </div>

                  <div className="bg-background border border-border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 overflow-hidden shadow-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-mono">sync_users.sh</p>
                    </div>
                    <pre className="bg-background rounded-lg p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm">
                      <code className="break-words text-foreground">{`#!/bin/bash
users_synced=$(./sync_users_logic.sh)
if [ $? -eq 0 ]; then
  curl https://deadmanping.com/ping/abc123 \\
    -H "Content-Type: application/json" \\
    -d "{\\"success\\": true, \\"count\\": $users_synced}"
else
  curl https://deadmanping.com/ping/abc123 \\
    -H "Content-Type: application/json" \\
    -d '{"success": false}'
fi`}</code>
                    </pre>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                        <span className="text-muted-foreground/60"># In crontab:</span> <span className="text-foreground">*/5 * * * * /path/to/sync_users.sh</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg transition-all duration-200 hover:border-primary/30 hover:shadow-sm animate-fade-in" style={{ animationDelay: '350ms' }}>
                      <span className="text-success text-lg">✓</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">No SDKs</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg transition-all duration-200 hover:border-primary/30 hover:shadow-sm animate-fade-in" style={{ animationDelay: '400ms' }}>
                      <span className="text-success text-lg">✓</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">No branching logic</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg transition-all duration-200 hover:border-primary/30 hover:shadow-sm animate-fade-in" style={{ animationDelay: '450ms' }}>
                      <span className="text-success text-lg">✓</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">No alert decisions in code</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg transition-all duration-200 hover:border-primary/30 hover:shadow-sm animate-fade-in" style={{ animationDelay: '500ms' }}>
                      <span className="text-success text-lg">✓</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">Data from execution</span>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 card-hover animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-smooth group-hover:bg-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <span className="text-lg sm:text-xl font-mono font-bold text-primary">2</span>
                  </div>
                <div className="flex-grow min-w-0 w-full sm:w-auto">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 animate-fade-in" style={{ animationDelay: '150ms' }}>Define rules in the dashboard</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    Configure rules visually. Change anytime. No redeploys.
                  </p>
                  <div className="bg-background border border-border rounded-lg p-4 sm:p-6 space-y-3 opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
                    <div className="flex items-center gap-3 p-3 bg-card rounded border border-border transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Condition</div>
                        <code className="text-sm font-mono transition-colors duration-200">success == true</code>
                      </div>
                      <div className="w-16 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Status</div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-success/20 text-success transition-transform duration-200 hover:scale-110">OK</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded border border-border transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 opacity-0 animate-fade-in" style={{ animationDelay: '550ms' }}>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Condition</div>
                        <code className="text-sm font-mono transition-colors duration-200">count {'>='} 100</code>
                      </div>
                      <div className="w-16 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Status</div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-success/20 text-success transition-transform duration-200 hover:scale-110">OK</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded border border-border transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 opacity-0 animate-fade-in" style={{ animationDelay: '700ms' }}>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Condition</div>
                        <code className="text-sm font-mono transition-colors duration-200">count {'<'} 100</code>
                      </div>
                      <div className="w-16 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Status</div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 transition-transform duration-200 hover:scale-110">WARN</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded border border-border transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 opacity-0 animate-fade-in" style={{ animationDelay: '850ms' }}>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Condition</div>
                        <code className="text-sm font-mono transition-colors duration-200">no ping for 15 min</code>
                      </div>
                      <div className="w-16 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Status</div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-error/20 text-error transition-transform duration-200 hover:scale-110">FAIL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 card-hover animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-smooth group-hover:bg-primary/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <span className="text-lg sm:text-xl font-mono font-bold text-primary">3</span>
                  </div>
                <div className="flex-grow min-w-0 w-full sm:w-auto">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 animate-fade-in" style={{ animationDelay: '150ms' }}>Get state-aware alerts</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    Alerts fire on state transitions. No spam. No silence.
                  </p>
                  <div className="bg-background border border-border rounded-lg p-4 sm:p-6 space-y-3 opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
                    <div className="flex items-center gap-3 p-3 bg-card rounded border-l-4 border-error transition-all duration-300 hover:shadow-md hover:-translate-x-1 opacity-0 animate-fade-in group" style={{ animationDelay: '400ms' }}>
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-error animate-pulse group-hover:scale-150 transition-transform duration-300"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1 transition-colors duration-200 group-hover:text-foreground">Monitor: User Sync</div>
                        <div className="text-xs text-muted-foreground">OK → FAIL • 2 minutes ago</div>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-error/20 text-error transition-transform duration-200 group-hover:scale-110">FAIL</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded border-l-4 border-success transition-all duration-300 hover:shadow-md hover:-translate-x-1 opacity-0 animate-fade-in group" style={{ animationDelay: '550ms' }}>
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-success animate-pulse group-hover:scale-150 transition-transform duration-300"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1 transition-colors duration-200 group-hover:text-foreground">Monitor: Backup Job</div>
                        <div className="text-xs text-muted-foreground">FAIL → OK • 5 minutes ago</div>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-success/20 text-success transition-transform duration-200 group-hover:scale-110">OK</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded border-l-4 border-error transition-all duration-300 hover:shadow-md hover:-translate-x-1 opacity-0 animate-fade-in group" style={{ animationDelay: '700ms' }}>
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-error animate-pulse group-hover:scale-150 transition-transform duration-300"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1 transition-colors duration-200 group-hover:text-foreground">Monitor: Data Export</div>
                        <div className="text-xs text-muted-foreground">Job didn't run • 15 minutes ago</div>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-error/20 text-error transition-transform duration-200 group-hover:scale-110">FAIL</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded border-l-4 border-yellow-500 transition-all duration-300 hover:shadow-md hover:-translate-x-1 opacity-0 animate-fade-in group" style={{ animationDelay: '850ms' }}>
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-500 animate-pulse group-hover:scale-150 transition-transform duration-300"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1 transition-colors duration-200 group-hover:text-foreground">Monitor: Report Generator</div>
                        <div className="text-xs text-muted-foreground">Result degraded • 1 hour ago</div>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 transition-transform duration-200 group-hover:scale-110">WARN</span>
                    </div>
                  </div>
                </div>
              </div>
              </div>
          </div>
        </AnimatedSection>

        {/* Real-World Examples */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Real-world examples" delay={0} direction="up" duration={800}>
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Real-World Examples</h2>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={700}>
              <p className="text-center text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12">
                Different types of verification that DeadManPing can monitor:
              </p>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" staggerDelay={80}>
                <div className="bg-background border border-border rounded-lg p-5 sm:p-6 card-hover h-full flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#3776ab]/20 flex items-center justify-center flex-shrink-0 border border-[#3776ab]/30">
                      <SiPython className="w-5 h-5 text-[#3776ab]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold">File Verification</h3>
                      <span className="text-xs text-muted-foreground">Python</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">Check if backup file exists and size</p>
                  <div className="bg-card border border-border rounded p-3 flex-grow flex flex-col min-h-0">
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                      <pre className="text-xs">
                        <code className="text-foreground">{`import os
import subprocess

if os.path.exists(backup_file):
    size_gb = subprocess.check_output(
        ['du', '-h', backup_file]).decode()
    subprocess.run(['curl', '...', '-d',
        f'{{"file_exists": true, "size_gb": "{size_gb}"}}'])`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-5 sm:p-6 card-hover h-full flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#339933]/20 flex items-center justify-center flex-shrink-0 border border-[#339933]/30">
                      <SiNodedotjs className="w-5 h-5 text-[#339933]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold">Status Verification</h3>
                      <span className="text-xs text-muted-foreground">Node.js</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">Success/failure with context</p>
                  <div className="bg-card border border-border rounded p-3 flex-grow flex flex-col min-h-0">
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                      <pre className="text-xs">
                        <code className="text-foreground">{`const { execSync } = require('child_process');

try {
  execSync('./backup.sh');
  execSync('curl ... -d ' + 
    JSON.stringify({success: true, backup_size: size}));
} catch (error) {
  execSync('curl ... -d ' + 
    JSON.stringify({success: false}));
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-5 sm:p-6 card-hover h-full flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4eaa25]/20 flex items-center justify-center flex-shrink-0 border border-[#4eaa25]/30">
                      <FaTerminal className="w-5 h-5 text-[#4eaa25]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold">Duration Verification</h3>
                      <span className="text-xs text-muted-foreground">Bash</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">How long script execution took</p>
                  <div className="bg-card border border-border rounded p-3 flex-grow flex flex-col min-h-0">
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                      <pre className="text-xs">
                        <code className="text-foreground">{`START_TIME=$(date +%s)
./generate_report.sh
END_TIME=$(date +%s)
curl ... -d "{\\"duration_seconds\\": $((END_TIME - START_TIME))}"`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-5 sm:p-6 card-hover h-full flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#cc342d]/20 flex items-center justify-center flex-shrink-0 border border-[#cc342d]/30">
                      <SiRuby className="w-5 h-5 text-[#cc342d]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold">Threshold Verification</h3>
                      <span className="text-xs text-muted-foreground">Ruby</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">Numeric values (more/less than X)</p>
                  <div className="bg-card border border-border rounded p-3 flex-grow flex flex-col min-h-0">
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                      <pre className="text-xs">
                        <code className="text-foreground">{`files_deleted = \`./cleanup.sh\`.lines.count
system("curl ... -d '{\\"files_deleted\\": #{files_deleted}}'")
# Dashboard: >= 10 → OK, < 10 → WARN`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-5 sm:p-6 card-hover h-full flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#00add8]/20 flex items-center justify-center flex-shrink-0 border border-[#00add8]/30">
                      <SiGo className="w-5 h-5 text-[#00add8]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold">Count Verification</h3>
                      <span className="text-xs text-muted-foreground">Go</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">How many records/items processed</p>
                  <div className="bg-card border border-border rounded p-3 flex-grow flex flex-col min-h-0">
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                      <pre className="text-xs">
                        <code className="text-foreground">{`import (
  "os/exec"
  "strings"
  "fmt"
)

out, _ := exec.Command("./sync.sh").Output()
count := len(strings.Split(string(out), "synced"))
exec.Command("curl", "...", "-d",
  fmt.Sprintf("{\\"count\\": %d}", count)).Run()`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-5 sm:p-6 card-hover h-full flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#777bb4]/20 flex items-center justify-center flex-shrink-0 border border-[#777bb4]/30">
                      <SiPhp className="w-5 h-5 text-[#777bb4]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold">Output Verification</h3>
                      <span className="text-xs text-muted-foreground">PHP</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">Check script output content</p>
                  <div className="bg-card border border-border rounded p-3 flex-grow flex flex-col min-h-0">
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                      <pre className="text-xs">
                        <code className="text-foreground">{`$output = shell_exec('./process.sh');
if (strpos($output, 'success') !== false) {
  $data = json_encode([
    'status' => 'ok',
    'output' => $output
  ]);
  shell_exec("curl ... -d '$data'");
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
            </StaggerContainer>
            <AnimatedItem delay={600} direction="up" duration={700}>
              <p className="text-center text-sm sm:text-base text-muted-foreground mt-8 sm:mt-12">
                And more... Works with any language that can execute curl.
              </p>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* Pricing */}
        <AnimatedSection delay={0} direction="up" duration={900}>
          <PricingSection />
        </AnimatedSection>

        {/* What DeadManPing Does */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20" aria-label="What DeadManPing does" delay={0} direction="up" duration={800}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">What <span className="text-foreground">DeadMan</span><span className="text-primary">Ping</span> does differently</h2>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={700}>
              <p className="text-xl sm:text-2xl mb-4 sm:mb-6 text-muted-foreground">
                We separate execution from evaluation.
              </p>
            </AnimatedItem>
            <AnimatedItem delay={300} direction="up" duration={700}>
              <p className="text-lg sm:text-xl mb-8 sm:mb-12">
                Your cron runs your scripts.<br />
                Your scripts send facts.<br />
                We verify if that's OK.
              </p>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* Key Differentiators */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Key differentiators" delay={0} direction="up" duration={800}>
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Key Differentiators</h2>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" staggerDelay={80}>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth h-full">
                  <h3 className="text-lg font-semibold mb-3">Result-aware monitoring</h3>
                  <p className="text-muted-foreground">We monitor outcomes, not just execution.</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth h-full">
                  <h3 className="text-lg font-semibold mb-3">Declarative rules</h3>
                  <p className="text-muted-foreground">Rules live in the UI, not inside scripts.</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth h-full">
                  <h3 className="text-lg font-semibold mb-3">Built-in recovery logic</h3>
                  <p className="text-muted-foreground">Alerts fire on state change, not every run.</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth h-full">
                  <h3 className="text-lg font-semibold mb-3">Missing-run detection</h3>
                  <p className="text-muted-foreground">If your cron never executes — you still get alerted.</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth h-full">
                  <h3 className="text-lg font-semibold mb-3">Zero custom logic per customer</h3>
                  <p className="text-muted-foreground">Same payload schema. Same evaluation engine. No support burden.</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 card-hover hover-lift-smooth h-full">
                  <h3 className="text-lg font-semibold mb-3">No-code configuration</h3>
                  <p className="text-muted-foreground">Set up monitoring rules without writing any code or deploying changes.</p>
                </div>
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* Feature Comparison Table */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20" aria-label="Feature comparison" delay={0} direction="up" duration={800}>
          <div className="max-w-5xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">What You Get</h2>
            </AnimatedItem>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold"><span className="text-foreground">DeadMan</span><span className="text-primary">Ping</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="animate-fade-in transition-all duration-200 hover:bg-background/30" style={{ animationDelay: '0ms' }}>
                      <td className="p-4 text-muted-foreground">Detect job didn't run</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl transition-transform duration-200 hover:scale-125 inline-block">✓</span>
                      </td>
                    </tr>
                    <tr className="bg-background/50 animate-fade-in transition-all duration-200 hover:bg-background/40" style={{ animationDelay: '100ms' }}>
                      <td className="p-4 text-muted-foreground">Inspect job results</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl transition-transform duration-200 hover:scale-125 inline-block">✓</span>
                      </td>
                    </tr>
                    <tr className="animate-fade-in transition-all duration-200 hover:bg-background/30" style={{ animationDelay: '200ms' }}>
                      <td className="p-4 text-muted-foreground">Payload-based rules</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl transition-transform duration-200 hover:scale-125 inline-block">✓</span>
                      </td>
                    </tr>
                    <tr className="bg-background/50 animate-fade-in transition-all duration-200 hover:bg-background/40" style={{ animationDelay: '300ms' }}>
                      <td className="p-4 text-muted-foreground">Thresholds in UI</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl transition-transform duration-200 hover:scale-125 inline-block">✓</span>
                      </td>
                    </tr>
                    <tr className="animate-fade-in transition-all duration-200 hover:bg-background/30" style={{ animationDelay: '400ms' }}>
                      <td className="p-4 text-muted-foreground">OK → FAIL tracking</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl transition-transform duration-200 hover:scale-125 inline-block">✓</span>
                      </td>
                    </tr>
                    <tr className="bg-background/50 animate-fade-in transition-all duration-200 hover:bg-background/40" style={{ animationDelay: '500ms' }}>
                      <td className="p-4 text-muted-foreground">Requires SDK</td>
                      <td className="p-4 text-center">
                        <span className="text-destructive text-xl transition-transform duration-200 hover:scale-125 inline-block">✗</span>
                      </td>
                    </tr>
                    <tr className="animate-fade-in transition-all duration-200 hover:bg-background/30" style={{ animationDelay: '600ms' }}>
                      <td className="p-4 text-muted-foreground">Requires code logic</td>
                      <td className="p-4 text-center">
                        <span className="text-destructive text-xl transition-transform duration-200 hover:scale-125 inline-block">✗</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Integrations Section */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Integrations" delay={0} direction="up" duration={800}>
          <div className="max-w-4xl mx-auto text-center px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Integrate with Your Workflow</h2>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={700}>
              <p className="text-muted-foreground mb-8 sm:mb-12 text-base sm:text-lg">
                Get alerts where your team already works
              </p>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6" staggerDelay={100}>
                <div className="bg-background border border-border rounded-lg p-6 hover-lift transition-smooth group card-hover">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-[#5865F2]/10 p-4 rounded-lg group-hover:bg-[#5865F2]/20 transition-smooth group-hover:scale-110">
                      <DiscordIcon className="w-8 h-8 text-[#5865F2]" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Discord</h3>
                  <p className="text-sm text-muted-foreground">Real-time alerts in your Discord channels</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 hover-lift transition-smooth group card-hover">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-[#4A154B]/10 p-4 rounded-lg group-hover:bg-[#4A154B]/20 transition-smooth group-hover:scale-110 flex items-center justify-center">
                      <SlackIcon className="w-8 h-8 text-[#4A154B] flex-shrink-0" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 text-center">Slack</h3>
                  <p className="text-sm text-muted-foreground text-center">Notifications directly in your Slack workspace</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-6 hover-lift transition-smooth group card-hover">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-primary/10 p-4 rounded-lg group-hover:bg-primary/20 transition-smooth group-hover:scale-110">
                      <EmailIcon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-sm text-muted-foreground">Instant email notifications for critical alerts</p>
                </div>
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* Who This Is For */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Who this is for" delay={0} direction="up" duration={800}>
          <div className="max-w-5xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Who This Is For</h2>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12" staggerDelay={150}>
                <div className="bg-background border border-success/30 rounded-lg p-6 sm:p-8 h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-success/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-success text-xl">✓</span>
                    </div>
                    <h3 className="text-xl font-semibold">Built for:</h3>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-success text-sm mt-1">•</span>
                      <span>Backend developers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success text-sm mt-1">•</span>
                      <span>Solo founders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success text-sm mt-1">•</span>
                      <span>Infra & ops</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success text-sm mt-1">•</span>
                      <span>Data pipelines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success text-sm mt-1">•</span>
                      <span>Maintenance & batch jobs</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-background border border-error/30 rounded-lg p-6 sm:p-8 h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-error/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-error text-xl">✗</span>
                    </div>
                    <h3 className="text-xl font-semibold">Not for:</h3>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-error text-sm mt-1">•</span>
                      <span>Realtime apps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error text-sm mt-1">•</span>
                      <span>Error debugging</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error text-sm mt-1">•</span>
                      <span>APM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error text-sm mt-1">•</span>
                      <span>Log aggregation</span>
                    </li>
                  </ul>
                </div>
            </StaggerContainer>
              <AnimatedItem delay={400} direction="up" duration={700}>
                <div className="bg-background border-2 border-primary/30 rounded-lg p-6 sm:p-8 text-center hover-lift-smooth">
                  <p className="text-lg sm:text-xl font-semibold mb-2">
                    It's not an error tracker.
                  </p>
                  <p className="text-lg sm:text-xl font-semibold text-primary">
                    It's a job outcome verifier.
                  </p>
                </div>
              </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* Positioning One-liner */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Positioning" delay={0} direction="up" duration={800}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-relaxed">
                Error trackers tell you when your job crashed.<br />
                <span className="text-foreground">DeadMan</span><span className="text-primary">Ping</span> tells you when it succeeded… incorrectly.
              </p>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
          <AnimatedSection className="py-12 sm:py-16 lg:py-20 bg-card border-2 border-primary/20 rounded-xl sm:rounded-2xl my-12 sm:my-16 lg:my-20 text-center px-4 relative overflow-hidden" aria-label="Get started" delay={0} direction="up" duration={900}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
          <div className="relative z-10">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                Stop trusting green checkmarks.
              </h2>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={700}>
              <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
                Monitor results, not assumptions.
              </p>
            </AnimatedItem>
            <AnimatedItem delay={300} direction="up" duration={700}>
              <CTAButton className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium inline-block transition-smooth hover-lift-smooth hover-scale shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
                Get started in 2 minutes
              </CTAButton>
            </AnimatedItem>
          </div>
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
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-smooth">
                    FAQ
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
                <li>
                  <Link href="/legal/opt-out" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Analytics Opt-Out
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
