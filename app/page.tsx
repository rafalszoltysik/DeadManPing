import Link from 'next/link'
import type { Metadata } from 'next'
import dynamicImport from 'next/dynamic'
import { Suspense } from 'react'
import { PageNav } from '@/components/PageNav'
import { DiscordIcon, SlackIcon, EmailIcon, MonitorIcon, WarningIcon } from '@/components/Icons'
import { MonitorStatusIcon, MonitorStatus } from '@/components/MonitorStatus'
import { CTAButton } from '@/components/CTAButton'
import { ErrorHandlerWrapper } from '@/components/ErrorHandlerWrapper'
import { AnimatedSection, AnimatedItem, StaggerContainer } from '@/components/AnimatedSection'
import { Footer } from '@/components/Footer'
import { FaLock, FaBolt, FaDollarSign, FaBell } from 'react-icons/fa'
import PricingSectionClient from '@/components/PricingSectionClient'
import { HowItWorksSection } from '@/components/HowItWorksSection'
import { CodeBlock } from '@/components/CodeBlock'

// Lazy load heavy components below the fold
const DashboardPreview = dynamicImport(() => import('@/components/DashboardPreview').then(mod => ({ default: mod.DashboardPreview })), {
  loading: () => (
    <div className="max-w-5xl mx-auto px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Monitor Everything in One Place</h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Real-time status updates and instant alerts for all your cron jobs
        </p>
      </div>
      <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-xl animate-pulse h-96"></div>
    </div>
  ),
  ssr: true,
})

export const metadata: Metadata = {
  title: "Never Miss a Cron Job Again | DeadManPing",
  description: "Never miss a cron job again. DeadManPing monitors your cron jobs without changing your setup. Monitor outcomes, not just execution. One curl line. Your job logic stays the same. Result-aware monitoring that verifies job outcomes. Detect silent failures, wrong results, and missing runs. Free tier available with 20 monitors. Multi-currency pricing in USD and EUR.",
  keywords: "cron monitoring, outcome-based cron monitoring, cron monitoring without migration, cron job monitoring, job result monitoring, scheduled task monitoring, backup monitoring, cron job alerts, detect cron job failure, monitor cron jobs, job monitoring service, result-aware monitoring, declarative rules, job outcome verifier, silent failure detection, payload validation, threshold verification, multi-currency pricing, USD pricing, EUR pricing, euro pricing",
  authors: [{ name: "DeadManPing" }],
  creator: "DeadManPing",
  publisher: "DeadManPing",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Never Miss a Cron Job Again | DeadManPing",
    description: "Never miss a cron job again. Monitor outcomes, not just execution. DeadManPing monitors your cron jobs without changing your setup. One curl line. Your job logic stays the same. Result-aware monitoring that verifies job outcomes. Multi-currency pricing in USD and EUR.",
    type: "website",
    url: "https://deadmanping.com",
    siteName: "DeadManPing",
    images: [
      {
        url: "https://deadmanping.com/icon.png",
        width: 1200,
        height: 1200,
        alt: "DeadManPing - Cron Job Monitoring",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Never Miss a Cron Job Again | DeadManPing",
    description: "Never miss a cron job again. Monitor outcomes, not just execution. One curl line. Your job logic stays the same.",
    images: ["https://deadmanping.com/icon.png"],
  },
  alternates: {
    canonical: "/",
  },
  category: "Software",
  classification: "Developer Tools, Monitoring Software",
}

// Force static generation for better performance
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

// Move structured data outside component to reduce bundle size and webpack warnings
const STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DeadManPing",
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "Monitoring Software",
    "operatingSystem": "Any",
    "url": "https://deadmanping.com",
    "description": "Dead man switch monitoring service for cron jobs and scheduled tasks. Monitor your backups, reports, and sync jobs without changing your existing setup. One curl line. Your job logic stays the same. Get instant alerts when your jobs don't run or produce incorrect results.",
    "screenshot": "https://deadmanping.com/icon.svg",
    "softwareVersion": "1.0",
    "releaseNotes": "Result-aware monitoring for cron jobs. Verify job outcomes, not just execution. Payload validation rules. State-aware alerts.",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Tier",
        "price": "0",
        "priceCurrency": "USD",
        "description": "20 monitors, 5-minute minimum intervals, email alerts"
      },
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": "7",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "description": "30 monitors, 5-minute intervals, email + Slack/Discord alerts"
      },
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": "7",
        "priceCurrency": "EUR",
        "priceValidUntil": "2025-12-31",
        "description": "30 monitors, 5-minute intervals, email + Slack/Discord alerts"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "24",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "description": "150 monitors, 1-minute intervals, up to 3 team members"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "24",
        "priceCurrency": "EUR",
        "priceValidUntil": "2025-12-31",
        "description": "150 monitors, 1-minute intervals, up to 3 team members"
      },
      {
        "@type": "Offer",
        "name": "Team Plan",
        "price": "79",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "description": "1000 monitors, 1-minute intervals, up to 10 team members, custom webhooks"
      },
      {
        "@type": "Offer",
        "name": "Team Plan",
        "price": "79",
        "priceCurrency": "EUR",
        "priceValidUntil": "2025-12-31",
        "description": "1000 monitors, 1-minute intervals, up to 10 team members, custom webhooks"
      }
    ],
    "featureList": [
      "Cron job monitoring without migration",
      "Dead man switch detection",
      "Result-aware monitoring (verify outcomes, not just execution)",
      "Payload validation rules",
      "State-aware alerts (no spam)",
      "Email alerts",
      "Slack integration",
      "Discord integration",
      "Custom webhooks (Team plan)",
      "Missing-run detection",
      "Threshold verification",
      "File size verification",
      "Count verification",
      "Duration verification",
      "Status verification",
      "No SDK required",
      "Works with any language",
      "Dashboard with real-time status"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "50",
      "bestRating": "5",
      "worstRating": "1"
    },
    "creator": {
      "@type": "Organization",
      "name": "DeadManPing"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing"
    },
    "keywords": "cron monitoring, dead man switch, job monitoring, scheduled tasks, backup monitoring, cron job alerts, payload validation, result-aware monitoring, job outcome verification, devops monitoring, multi-currency pricing, USD pricing, EUR pricing",
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "freeTierAvailable": true
} as const

// ItemList schema for features list
const FEATURES_ITEM_LIST_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "DeadManPing Features",
  "description": "Complete list of features available in DeadManPing monitoring service",
  "itemListElement": STRUCTURED_DATA.featureList.map((feature, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareFeature",
        "name": feature
    }
  }))
} as const

export default function Home() {
  // VideoObject schema placeholder - można użyć gdy dodasz filmy
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "DeadManPing - Quick Start Guide",
    "description": "Learn how to set up DeadManPing monitoring for your cron jobs in 2 minutes. One curl line. Your job logic stays the same.",
    "thumbnailUrl": "https://deadmanping.com/icon.svg",
    "uploadDate": "2024-12-01",
    "duration": "PT2M",
    "contentUrl": "", // Dodaj URL gdy masz film
    "embedUrl": "", // Dodaj embed URL gdy masz film
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing",
      "logo": {
        "@type": "ImageObject",
        "url": "https://deadmanping.com/icon.svg"
      }
    }
  }

  return (
    <div className="min-h-screen text-foreground relative bg-transparent">
      <ErrorHandlerWrapper />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FEATURES_ITEM_LIST_SCHEMA) }}
        suppressHydrationWarning
      />
      {/* VideoObject schema - zakomentuj jeśli nie masz filmów */}
      {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      /> */}
      
      {/* Navigation */}
      <PageNav />

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="pt-12 sm:pt-20 pb-12 sm:pb-16 text-center">
          <AnimatedSection className="max-w-4xl mx-auto" delay={0} direction="fade" duration={1000}>
            <AnimatedItem delay={100} direction="up" duration={800}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-relaxed animate-gradient pb-2 overflow-visible">
                Never Miss a Cron Job Again
              </h1>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={800}>
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2">
                Monitor outcomes, not just execution.<br className="hidden sm:block" />One curl line. Your job logic stays the same.
              </p>
            </AnimatedItem>
            <AnimatedItem delay={300} direction="up" duration={800}>
              <div className="flex flex-col items-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
                <CTAButton className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-smooth hover-lift-smooth shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover-scale">
                  Start monitoring in 2 minutes
                </CTAButton>
                <p className="text-sm text-muted-foreground">
                  14-day free trial · No credit card required
                </p>
              </div>
            </AnimatedItem>
          </AnimatedSection>
        </section>

        {/* Dashboard Preview */}
        <AnimatedSection className="pt-0 sm:pt-0 lg:pt-0 pb-8 sm:pb-12 lg:pb-16" delay={0} direction="up" duration={900}>
          <Suspense fallback={
            <div className="max-w-5xl mx-auto px-4">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Monitor Everything in One Place</h2>
                <p className="text-muted-foreground text-base sm:text-lg">
                  Real-time status updates and instant alerts for all your cron jobs
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-xl animate-pulse h-96"></div>
            </div>
          }>
            <DashboardPreview />
          </Suspense>
        </AnimatedSection>

        {/* Three Monitoring Modes */}
        <AnimatedSection className="pt-0 sm:pt-0 lg:pt-0 pb-12 sm:pb-16 lg:pb-20" delay={100} direction="up" duration={800}>
          <div className="max-w-5xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Three Ways to Monitor</h2>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={700}>
              <p className="text-center text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12">
                Choose the monitoring mode that fits your needs
              </p>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6" staggerDelay={100}>
              <div className="bg-card border border-border rounded-lg p-6 card-hover hover-lift-smooth h-full">
                <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-primary text-lg sm:text-xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-center">Simple Ping</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Just verify that your job executed. One curl line confirms completion.
                </p>
                <CodeBlock
                  code="curl https://deadmanping.com/api/ping/your-slug"
                  language="bash"
                />
              </div>

              <div className="bg-card border border-border rounded-lg p-6 card-hover hover-lift-smooth h-full">
                <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-primary text-lg sm:text-xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-center">Ping with Payload</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Verify correctness. Send data from execution and validate results in the dashboard.
                </p>
                <CodeBlock
                  code='curl -X POST "https://deadmanping.com/api/ping/your-slug?count=100"'
                  language="bash"
                />
              </div>

              <div className="bg-card border border-border rounded-lg p-6 card-hover hover-lift-smooth h-full">
                <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-primary text-lg sm:text-xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-center">Start/Stop Tracking</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Measure execution time. Track job duration and optionally include payload validation.
                </p>
                <CodeBlock
                  code="/api/ping/your-slug/start → ... → /api/ping/your-slug?run_id=..."
                  language="bash"
                />
              </div>
            </StaggerContainer>
            <AnimatedItem delay={500} direction="up" duration={700}>
              <p className="text-center text-sm text-muted-foreground mt-8">
                <Link href="/docs" className="text-primary hover:underline font-medium">
                  See detailed examples in documentation →
                </Link>
              </p>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* The uncomfortable truth */}
        <AnimatedSection className="pt-0 sm:pt-0 lg:pt-0 pb-12 sm:pb-16 lg:pb-20" delay={100} direction="up" duration={800}>
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
            <AnimatedItem delay={450} direction="up" duration={700}>
              <p className="text-center mt-8 text-lg text-muted-foreground">
                And no alert fires.
              </p>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* Why Other Tools Fail */}
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20" aria-label="Why other tools fail" delay={100} direction="up" duration={800}>
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
                  DeadManPing works with your existing cron. No migration needed. Just add one curl line.
                </p>
                </div>
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* What DeadManPing is NOT */}
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20 bg-card/50 border-y border-border" aria-label="What DeadManPing is NOT" delay={100} direction="up" duration={800}>
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
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20 bg-card/50 border-y border-border" aria-label="What you don't need to build" delay={100} direction="up" duration={800}>
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
            <AnimatedItem delay={500} direction="up" duration={700}>
              <p className="text-center text-lg sm:text-xl font-semibold">
                Stop writing alert connectors. One curl line. Rest in the dashboard.
              </p>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* How It Works */}
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20" aria-label="How DeadManPing works" delay={100} direction="up" duration={800}>
          <AnimatedItem delay={100} direction="up" duration={700}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 px-4">How It Works</h2>
          </AnimatedItem>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 lg:space-y-12">
            <HowItWorksSection />

              <AnimatedItem delay={100} direction="up" duration={600}>
                <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 card-hover">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-smooth group-hover:bg-primary/20">
                      <span className="text-lg sm:text-xl font-mono font-bold text-primary">3</span>
                    </div>
                    <div className="flex-grow min-w-0 w-full sm:w-auto">
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Get state-aware alerts</h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                        Alerts fire on state transitions. No spam. No silence.
                      </p>
                      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6" staggerDelay={100}>
                        {/* Recovered Email Preview */}
                        <div className="bg-card border border-border hover:border-success rounded-lg sm:rounded-xl overflow-hidden shadow-sm card-hover transition-smooth">
                      <div className="bg-success/15 border-b border-success/20 px-4 sm:px-5 py-3 sm:py-4 text-center">
                        <h4 className="m-0 text-base sm:text-lg font-semibold text-success">Monitor Recovered</h4>
                      </div>
                      <div className="p-4 sm:p-5">
                        <div className="bg-success/5 border-l-4 border-success/20 p-3 sm:p-4 rounded-md mb-4">
                          <p className="m-0 text-sm sm:text-base text-foreground leading-relaxed">
                            Monitor recovered successfully. All validation rules passed and monitor is working.
                          </p>
                        </div>
                        <div className="space-y-2.5 mb-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Monitor Name:</span>
                            <span className="font-semibold text-foreground">Backup Job</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-semibold text-success">Healthy</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Last Ping:</span>
                            <span className="font-mono text-xs text-foreground">5 minutes ago</span>
                          </div>
                        </div>
                        <CTAButton className="w-full bg-success/10 hover:bg-success/15 border border-success/20 hover:border-success text-success rounded-md py-2.5 px-4 transition-smooth">
                          View Monitor Details
                        </CTAButton>
                      </div>
                    </div>

                        {/* Error Email Preview */}
                        <div className="bg-card border border-border hover:border-error rounded-lg sm:rounded-xl overflow-hidden shadow-sm card-hover transition-smooth">
                      <div className="bg-error/15 border-b border-error/20 px-4 sm:px-5 py-3 sm:py-4 text-center">
                        <h4 className="m-0 text-base sm:text-lg font-semibold text-error">Monitor Reported Failure</h4>
                      </div>
                      <div className="p-4 sm:p-5">
                        <div className="bg-error/5 border-l-4 border-error/20 p-3 sm:p-4 rounded-md mb-4">
                          <p className="m-0 text-sm sm:text-base text-foreground leading-relaxed">
                            Your monitor reported a failure status. Please check your job logs and investigate the issue.
                          </p>
                        </div>
                        <div className="space-y-2.5 mb-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Monitor Name:</span>
                            <span className="font-semibold text-foreground">User Sync</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-semibold text-error">Failed</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Last Ping:</span>
                            <span className="font-mono text-xs text-foreground">2 minutes ago</span>
                          </div>
                        </div>
                        <CTAButton className="w-full bg-error/10 hover:bg-error/15 border border-error/20 hover:border-error text-error rounded-md py-2.5 px-4 transition-smooth">
                          View Monitor Details
                        </CTAButton>
                      </div>
                    </div>

                        {/* Warning Email Preview */}
                        <div className="bg-card border border-border hover:border-warning rounded-lg sm:rounded-xl overflow-hidden shadow-sm card-hover transition-smooth">
                      <div className="bg-warning/15 border-b border-warning/20 px-4 sm:px-5 py-3 sm:py-4 text-center">
                        <h4 className="m-0 text-base sm:text-lg font-semibold text-warning">Monitor Warning</h4>
                      </div>
                      <div className="p-4 sm:p-5">
                        <div className="bg-warning/5 border-l-4 border-warning/20 p-3 sm:p-4 rounded-md mb-4">
                          <p className="m-0 text-sm sm:text-base text-foreground leading-relaxed">
                            Payload validation warning detected. Monitor is still within grace period.
                          </p>
                        </div>
                        <div className="space-y-2.5 mb-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Monitor Name:</span>
                            <span className="font-semibold text-foreground">Report Generator</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-semibold text-warning">Warn</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Last Ping:</span>
                            <span className="font-mono text-xs text-foreground">1 hour ago</span>
                          </div>
                        </div>
                        <CTAButton className="w-full bg-warning/10 hover:bg-warning/15 border border-warning/20 hover:border-warning text-warning rounded-md py-2.5 px-4 transition-smooth">
                          View Monitor Details
                        </CTAButton>
                      </div>
                    </div>
                      </StaggerContainer>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* Pricing */}
        <AnimatedSection delay={100} direction="up" duration={900}>
          <Suspense fallback={
            <section className="py-12 sm:py-16 lg:py-20" aria-label="Pricing plans">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4 px-4">Simple, Transparent Pricing</h2>
              <p className="text-center text-muted-foreground mb-8 sm:mb-12 text-sm sm:text-base px-4">14-day free trial • No credit card required</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 items-stretch">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border-2 border-border rounded-lg p-6 sm:p-8 h-96 animate-pulse"></div>
                ))}
              </div>
            </section>
          }>
            <PricingSectionClient />
          </Suspense>
        </AnimatedSection>

        {/* What DeadManPing Does */}
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20" aria-label="What DeadManPing does" delay={100} direction="up" duration={800}>
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
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20 bg-card/50 border-y border-border" aria-label="Key differentiators" delay={100} direction="up" duration={800}>
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
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20" aria-label="Feature comparison" delay={100} direction="up" duration={800}>
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
                    <tr className="transition-all duration-200 hover:bg-background/30 animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <td className="p-4 text-muted-foreground">Detect job didn't run</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl transition-transform duration-200 hover:scale-125 inline-block">✓</span>
                      </td>
                    </tr>
                    <tr className="bg-background/50 transition-all duration-200 hover:bg-background/40 animate-fade-in" style={{ animationDelay: '250ms' }}>
                      <td className="p-4 text-muted-foreground">Inspect job results</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl transition-transform duration-200 hover:scale-125 inline-block">✓</span>
                      </td>
                    </tr>
                    <tr className="transition-all duration-200 hover:bg-background/30 animate-fade-in" style={{ animationDelay: '300ms' }}>
                      <td className="p-4 text-muted-foreground">Payload-based rules</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl transition-transform duration-200 hover:scale-125 inline-block">✓</span>
                      </td>
                    </tr>
                    <tr className="bg-background/50 transition-all duration-200 hover:bg-background/40 animate-fade-in" style={{ animationDelay: '350ms' }}>
                      <td className="p-4 text-muted-foreground">Thresholds in UI</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl transition-transform duration-200 hover:scale-125 inline-block">✓</span>
                      </td>
                    </tr>
                    <tr className="transition-all duration-200 hover:bg-background/30 animate-fade-in" style={{ animationDelay: '400ms' }}>
                      <td className="p-4 text-muted-foreground">OK → FAIL tracking</td>
                      <td className="p-4 text-center">
                        <span className="text-success text-xl transition-transform duration-200 hover:scale-125 inline-block">✓</span>
                      </td>
                    </tr>
                    <tr className="bg-background/50 transition-all duration-200 hover:bg-background/40 animate-fade-in" style={{ animationDelay: '450ms' }}>
                      <td className="p-4 text-muted-foreground">Requires SDK</td>
                      <td className="p-4 text-center">
                        <span className="text-destructive text-xl transition-transform duration-200 hover:scale-125 inline-block">✗</span>
                      </td>
                    </tr>
                    <tr className="transition-all duration-200 hover:bg-background/30 animate-fade-in" style={{ animationDelay: '500ms' }}>
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
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20 bg-card/50 border-y border-border" aria-label="Integrations" delay={100} direction="up" duration={800}>
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
            <AnimatedItem delay={400} direction="up" duration={700}>
              <div className="mt-8 sm:mt-12 text-center">
                <CTAButton className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-smooth hover-lift-smooth shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 inline-flex items-center gap-2 group">
                  <FaBell className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:animate-ring" />
                  <span>Start Notifications</span>
                </CTAButton>
              </div>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* Who This Is For */}
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20 bg-card/50 border-y border-border" aria-label="Who this is for" delay={100} direction="up" duration={800}>
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
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20 bg-card/50 border-y border-border" aria-label="Positioning" delay={100} direction="up" duration={800}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <AnimatedItem delay={300} direction="up" duration={700}>
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-relaxed">
                Error trackers tell you when your job crashed.<br />
                <span className="text-foreground">DeadMan</span><span className="text-primary">Ping</span> tells you when it succeeded… incorrectly.
              </p>
            </AnimatedItem>
          </div>
        </AnimatedSection>

        {/* Trust Indicators */}
        <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20 bg-card/50 border-y border-border" aria-label="Trust indicators" delay={100} direction="up" duration={800}>
          <div className="max-w-5xl mx-auto px-4">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Reliable & Secure</h2>
            </AnimatedItem>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8" staggerDelay={80}>
              <div className="bg-background border border-border rounded-lg p-6 text-center card-hover hover-lift-smooth">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FaLock className="text-primary text-xl" />
                </div>
                <h3 className="font-semibold mb-2">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">Your data is encrypted. We only store what you send. No access to your servers.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-6 text-center card-hover hover-lift-smooth">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FaBolt className="text-primary text-xl" />
                </div>
                <h3 className="font-semibold mb-2">99.9% Uptime</h3>
                <p className="text-sm text-muted-foreground">Reliable infrastructure. Your monitors are always checked, even when you're not.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-6 text-center card-hover hover-lift-smooth">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FaDollarSign className="text-primary text-xl" />
                </div>
                <h3 className="font-semibold mb-2">No Hidden Costs</h3>
                <p className="text-sm text-muted-foreground">Transparent pricing. Cancel anytime. Free tier available. No credit card required for trial.</p>
              </div>
            </StaggerContainer>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
          <AnimatedSection className="pt-2 sm:pt-4 lg:pt-6 pb-12 sm:pb-16 lg:pb-20 bg-card border-2 border-primary/20 rounded-xl sm:rounded-2xl my-12 sm:my-16 lg:my-20 text-center px-4 relative overflow-hidden" aria-label="Get started" delay={100} direction="up" duration={900}>
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
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  )
}
