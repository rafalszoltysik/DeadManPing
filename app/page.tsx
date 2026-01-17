import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { DiscordIcon, SlackIcon, EmailIcon, MonitorIcon } from '@/components/Icons'
import { DashboardPreview } from '@/components/DashboardPreview'

export const metadata: Metadata = {
  title: "Monitor Job Results, Not Just Execution | DeadManPing",
  description: "Your cron didn't crash. It just silently did the wrong thing. DeadManPing monitors what your jobs return, not just whether they ran. Define success rules in the dashboard. Send raw facts from your code.",
  keywords: "cron job monitoring, job result monitoring, outcome monitoring, scheduled task monitoring, backup monitoring, cron job alerts, detect cron job failure, monitor cron jobs, job monitoring service, result-aware monitoring, declarative rules, job outcome verifier",
  openGraph: {
    title: "Monitor Job Results, Not Just Execution | DeadManPing",
    description: "DeadManPing monitors what your jobs return, not just whether they ran. Define success rules in the dashboard. Send raw facts from your code.",
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
              Your cron didn't crash.<br className="hidden sm:block" />It just silently did the wrong thing.
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2">
              DeadManPing monitors what your jobs return, not just whether they ran.<br className="hidden sm:block" />
              Define success rules in the dashboard. Send raw facts from your code.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4">
              <Link
                href="/auth/signup"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-smooth hover-lift shadow-lg"
              >
                Start monitoring results, not guesses
              </Link>
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
        <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="The problem">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">The uncomfortable truth</h2>
            <p className="text-xl sm:text-2xl text-center mb-8 sm:mb-12 text-muted-foreground">
              Most cron jobs don't fail loudly.<br />
              They succeed… incorrectly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">zero rows processed</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">partial data</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">wrong counts</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">outdated results</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">skipped logic paths</p>
              </div>
            </div>
            <p className="text-center mt-8 text-lg text-muted-foreground">
              And no alert fires.
            </p>
          </div>
        </section>

        {/* Why Other Tools Fail */}
        <section className="py-12 sm:py-16 lg:py-20" aria-label="Why other tools fail">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Why existing monitoring tools fail here</h2>
            
            <div className="space-y-8 sm:space-y-12">
              <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-destructive">❌</span>
                  Plain webhooks (Discord / Slack)
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• logic buried in scripts</li>
                  <li>• no shared state</li>
                  <li>• no recovery</li>
                  <li>• no "job didn't run"</li>
                  <li>• every script behaves differently</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground italic">
                  After 10 jobs: "I don't remember which script checks what."
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-destructive">❌</span>
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

              <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-destructive">❌</span>
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
            </div>
          </div>
        </section>

        {/* What DeadManPing Does */}
        <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="What DeadManPing does">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">What DeadManPing does differently</h2>
            <p className="text-xl sm:text-2xl mb-8 sm:mb-12 text-muted-foreground">
              DeadManPing separates execution from evaluation.
            </p>
            <p className="text-lg sm:text-xl">
              Your code sends facts.<br />
              DeadManPing decides if that's OK.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-16 lg:py-20" aria-label="How DeadManPing works">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 px-4">How It Works</h2>
          <div className="max-w-5xl mx-auto px-4 space-y-8 sm:space-y-12">
            <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-mono font-bold text-primary">1</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-4">Send structured facts</h3>
                  <p className="text-muted-foreground mb-4">
                    From any language, any environment:
                  </p>
                  <pre className="bg-background border border-border rounded-lg p-4 overflow-x-auto text-sm">
                    <code>{`curl https://deadmanping.io/ping/abc123 \\
  -d '{
    "success": true,
    "count": 87
  }'`}</code>
                  </pre>
                  <ul className="mt-4 space-y-2 text-muted-foreground text-sm">
                    <li>• No SDKs.</li>
                    <li>• No branching logic.</li>
                    <li>• No alert decisions in code.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-mono font-bold text-primary">2</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-4">Define rules in the dashboard</h3>
                  <p className="text-muted-foreground mb-4">Example rules:</p>
                  <ul className="space-y-2 text-muted-foreground text-sm mb-4">
                    <li>• <code className="bg-background px-2 py-1 rounded">success == true</code></li>
                    <li>• <code className="bg-background px-2 py-1 rounded">count {'>='} 100 → OK</code></li>
                    <li>• <code className="bg-background px-2 py-1 rounded">count {'<'} 100 → WARN</code></li>
                    <li>• <code className="bg-background px-2 py-1 rounded">no ping for 15 min → FAIL</code></li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    Change rules anytime. No redeploys.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-mono font-bold text-primary">3</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-4">Get state-aware alerts</h3>
                  <p className="text-muted-foreground mb-4">DeadManPing tracks transitions:</p>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• OK → FAIL</li>
                    <li>• FAIL → OK</li>
                    <li>• job didn't run</li>
                    <li>• result degraded but not broken</li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground">
                    No spam. No silence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Differentiators */}
        <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Key differentiators">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Key Differentiators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">🧠 Result-aware monitoring</h3>
                <p className="text-muted-foreground">We monitor outcomes, not just execution.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">🧩 Declarative rules</h3>
                <p className="text-muted-foreground">Rules live in the UI, not inside scripts.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">🔄 Built-in recovery logic</h3>
                <p className="text-muted-foreground">Alerts fire on state change, not every run.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">🕳️ Missing-run detection</h3>
                <p className="text-muted-foreground">If your cron never executes — you still get alerted.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-6 md:col-span-2">
                <h3 className="text-lg font-semibold mb-3">🧼 Zero custom logic per customer</h3>
                <p className="text-muted-foreground">Same payload schema. Same evaluation engine. No support burden.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
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

        {/* Who This Is For */}
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
                <h3 className="text-xl font-semibold mb-4 text-muted-foreground">Not for:</h3>
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

        {/* Positioning One-liner */}
        <section className="py-12 sm:py-16 lg:py-20 bg-card/50 border-y border-border" aria-label="Positioning">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-relaxed">
              Error trackers tell you when your job crashed.<br />
              DeadManPing tells you when it succeeded… incorrectly.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-card border-2 border-primary/20 rounded-xl sm:rounded-2xl my-12 sm:my-16 lg:my-20 text-center px-4 relative overflow-hidden" aria-label="Get started">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Stop trusting green checkmarks.
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
              Monitor results, not assumptions.
            </p>
            <Link
              href="/auth/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium inline-block transition-smooth hover-lift shadow-lg shadow-primary/20"
            >
              Get started in 2 minutes
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
