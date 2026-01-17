import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { DiscordIcon, SlackIcon, EmailIcon, MonitorIcon } from '@/components/Icons'
import { DashboardPreview } from '@/components/DashboardPreview'

export const metadata: Metadata = {
  title: "Dead Man Switch for Cron Jobs | Monitor Scheduled Tasks | DeadManPing",
  description: "Get instant alerts when your cron jobs fail or stop running. Simple dead-man switch monitoring for backups, reports, and scheduled tasks. Set up in 2 minutes with curl.",
  keywords: "cron job monitoring, dead man switch, scheduled task monitoring, backup monitoring, cron job alerts, detect cron job failure, monitor cron jobs, job monitoring service, cron notification if is not working, cron notification not working, cron job notification, cron notification alert, cron job notification service, monitor cron notification, cron notification system, cron job notification if failed, cron notification when job fails",
  openGraph: {
    title: "Dead Man Switch for Cron Jobs | DeadManPing",
    description: "Get instant alerts when your cron jobs fail or stop running. Simple monitoring for backups, reports, and scheduled tasks.",
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
              Dead Man's Switch<br className="hidden sm:block" />for your cron jobs
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2">
              Never miss a failed job again. Get instant alerts when your backups, reports, or scheduled tasks don't run.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
              <Link
                href="/auth/signup"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-smooth hover-lift shadow-lg"
              >
                Create Job
              </Link>
              <Link
                href="/docs"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-smooth border border-border"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="py-8 sm:py-12 lg:py-16">
          <DashboardPreview />
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-16 lg:py-20" aria-label="How DeadManPing works">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 px-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
            <div className="bg-card border border-border rounded-lg p-8 hover-lift transition-smooth">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-mono font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Create Monitor</h3>
              <p className="text-muted-foreground text-center">
                Name your monitor and set how often your job should run
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-8 hover-lift transition-smooth">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-mono font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Add to Cron</h3>
              <p className="text-muted-foreground text-center">
                Copy the curl command and add it to your cron job or script
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-8 hover-lift transition-smooth">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-mono font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Get Alerts</h3>
              <p className="text-muted-foreground text-center">
                Receive instant cron notification alerts via email, Slack, or Discord. Our cron job notification service 
                sends alerts when your cron job is not working, ensuring you're notified immediately if your cron notification 
                is not working or if the job fails.
              </p>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Integrations">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Integrate with Your Workflow</h2>
            <p className="text-muted-foreground mb-8 sm:mb-12 text-base sm:text-lg">
              Get alerts where your team already works
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-background border border-border rounded-lg p-6 hover-lift transition-smooth group">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-[#5865F2]/10 p-4 rounded-lg group-hover:bg-[#5865F2]/20 transition-smooth">
                    <DiscordIcon className="w-8 h-8 text-[#5865F2]" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Discord</h3>
                <p className="text-sm text-muted-foreground">Real-time alerts in your Discord channels</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-6 hover-lift transition-smooth group">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-[#4A154B]/10 p-4 rounded-lg group-hover:bg-[#4A154B]/20 transition-smooth">
                    <SlackIcon className="w-8 h-8 text-[#4A154B]" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Slack</h3>
                <p className="text-sm text-muted-foreground">Notifications directly in your Slack workspace</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-6 hover-lift transition-smooth group">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-lg group-hover:bg-primary/20 transition-smooth">
                    <EmailIcon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground">Instant email notifications for critical alerts</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-12 sm:py-16 lg:py-20" aria-label="Pricing plans">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4 px-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12 text-sm sm:text-base px-4">14-day free trial • No credit card required</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 items-stretch">
            <div className="bg-card border-2 border-border rounded-lg p-6 sm:p-8 hover-lift transition-smooth flex flex-col h-full">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Starter</h3>
              <p className="text-3xl sm:text-4xl font-bold mb-4">
                $9
                <span className="text-base sm:text-lg font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2 sm:space-y-3 mb-6 flex-grow">
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  25 monitors
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Min interval: 5 minutes
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Email alerts
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Slack/Discord integrations
                </li>
              </ul>
              <Link
                href="/auth/signup?plan=starter"
                className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 text-center px-4 py-3 rounded-md font-medium transition-smooth"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-card border-2 border-primary rounded-lg p-6 sm:p-8 hover-lift transition-smooth relative flex flex-col h-full">
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl sm:text-2xl font-bold">Pro</h3>
              </div>
              <p className="text-3xl sm:text-4xl font-bold mb-4">
                $29
                <span className="text-base sm:text-lg font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2 sm:space-y-3 mb-6 flex-grow">
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  100 monitors
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Min interval: 1 minute
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Email alerts
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Slack/Discord integrations
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Up to 3 team members
                </li>
              </ul>
              <Link
                href="/auth/signup?plan=pro"
                className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 text-center px-4 py-3 rounded-md font-medium transition-smooth"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-card border-2 border-border rounded-lg p-6 sm:p-8 hover-lift transition-smooth flex flex-col h-full">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Team</h3>
              <p className="text-3xl sm:text-4xl font-bold mb-4">
                $79
                <span className="text-base sm:text-lg font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2 sm:space-y-3 mb-6 flex-grow">
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  500 monitors
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Min interval: 30 seconds
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Email alerts
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Slack/Discord integrations
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Custom webhooks
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  API access
                </li>
                <li className="flex items-center text-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Up to 10 team members
                </li>
              </ul>
              <Link
                href="/auth/signup?plan=team"
                className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 text-center px-4 py-3 rounded-md font-medium transition-smooth"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-card border-2 border-primary/20 rounded-xl sm:rounded-2xl my-12 sm:my-16 lg:my-20 text-center px-4 relative overflow-hidden" aria-label="Get started">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Ready to Start Monitoring?
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
              Set up your first monitor in less than 2 minutes
            </p>
            <Link
              href="/auth/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium inline-block transition-smooth hover-lift shadow-lg shadow-primary/20"
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MonitorIcon className="w-5 h-5" />
                <span className="font-mono">DeadManPing</span>
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
