import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'
import { Footer } from '@/components/Footer'
import { CodeBlock } from '@/components/CodeBlock'
import { createArticleSchema, createBreadcrumbSchema } from '@/lib/seo-helpers'
import { RelatedArticles } from '@/components/RelatedArticles'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Cron Monitoring Without SDK: One Curl Line | DeadManPing",
  description: "Monitor cron jobs with one curl line. No SDK, no agent, no migration. Keep your scripts and cron—add a single HTTP ping to get alerts when jobs fail.",
  keywords: "cron monitoring without SDK, monitor cron with curl, cron job monitoring no SDK, curl cron monitoring, simple cron monitoring, cron alert without agent, ping-based cron monitoring",
  openGraph: {
    title: "Cron Monitoring Without SDK: One Curl Line",
    description: "Monitor cron jobs with one curl line. No SDK, no agent, no migration. Get alerts when jobs fail.",
    type: "article",
    url: `${cleanBaseUrl}/blog/cron-monitoring-without-sdk`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Monitoring Without SDK: One Curl Line",
    description: "Monitor cron jobs with one curl line. No SDK, no agent, no migration.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/cron-monitoring-without-sdk`,
  },
}

export default function CronMonitoringWithoutSdkPage() {
  const structuredData = createArticleSchema({
    slug: "cron-monitoring-without-sdk",
    headline: "Cron Monitoring Without SDK: One Curl Line",
    description: "How to monitor cron jobs with a single curl call. No SDK, no agent, no code migration—just add one line and get alerts when jobs fail.",
    keywords: "cron monitoring without SDK, monitor cron with curl, cron job monitoring no SDK, curl cron monitoring",
    articleSection: "Cron Monitoring Guides"
  })

  const breadcrumbSchema = createBreadcrumbSchema({
    slug: "cron-monitoring-without-sdk",
    title: "Cron Monitoring Without SDK"
  })

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
              Cron Monitoring Without SDK: One Curl Line
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              You don&apos;t need an SDK, an agent, or a rewrite. Add one curl (or HTTP) call at the end of your job. 
              If the job fails or doesn&apos;t run, the ping never happens—and you get an alert. Your code stays the same.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why &quot;No SDK&quot; Matters
                </h2>
                <p className="text-muted-foreground mb-4">
                  Many cron monitoring tools want you to install an agent, use their SDK, or change how you run jobs. 
                  That means new dependencies, deployment steps, and migration work. With a ping-based approach you keep your existing cron and scripts; you only add a single HTTP request when the job succeeds.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Works with any language (Bash, Python, Node, PHP, Go, etc.)</li>
                  <li>No libraries to install or update</li>
                  <li>Same pattern on every server and environment</li>
                  <li>Easy to add to existing crontab in one line</li>
                </ul>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  One Line in Crontab
                </h2>
                <p className="text-muted-foreground mb-4">
                  Run your script; only if it succeeds, send the ping. Use <code className="bg-muted px-1.5 py-0.5 rounded text-sm">&amp;&amp;</code> so the ping runs only after a successful exit.
                </p>
                <CodeBlock
                  code={`# Every day at 3 AM: run backup, then ping only on success
0 3 * * * /path/to/backup.sh && curl -X POST "https://deadmanping.com/api/ping/backup-daily"

# Every 5 min: sync job
*/5 * * * * /path/to/sync.sh && curl -s -X POST "https://deadmanping.com/api/ping/sync-job" > /dev/null`}
                  language="bash"
                />
                <p className="text-muted-foreground mt-4">
                  If <code className="bg-muted px-1.5 py-0.5 rounded text-sm">backup.sh</code> fails or doesn&apos;t run, the curl never runs. 
                  DeadManPing expects a ping within your configured interval; if it doesn&apos;t get one, it alerts you.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  From Your Script (Any Language)
                </h2>
                <p className="text-muted-foreground mb-4">
                  Call the ping URL at the end of your script, after the work is done. GET, POST, or HEAD—all work.
                </p>
                <h3 className="text-lg font-semibold mb-2 mt-4">Bash</h3>
                <CodeBlock
                  code={`#!/bin/bash
/path/to/your-job.sh
curl -X POST "https://deadmanping.com/api/ping/my-job"`}
                  language="bash"
                />
                <h3 className="text-lg font-semibold mb-2 mt-4">Python</h3>
                <CodeBlock
                  code={`import urllib.request
# ... your job logic ...
urllib.request.urlopen("https://deadmanping.com/api/ping/my-job", data=b"")`}
                  language="python"
                />
                <h3 className="text-lg font-semibold mb-2 mt-4">Node.js</h3>
                <CodeBlock
                  code={`await runMyJob();
await fetch('https://deadmanping.com/api/ping/my-job', { method: 'POST' });`}
                  language="javascript"
                />
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Optional: Send Result Data (Payload Validation)
                </h2>
                <p className="text-muted-foreground mb-4">
                  You can send simple key-value data with the ping (e.g. file size, row count, status). 
                  DeadManPing can validate that the values are in range—so you&apos;re not only checking &quot;did it run?&quot; but &quot;did it produce a valid result?&quot;
                </p>
                <CodeBlock
                  code={`# Ping with payload: file size and record count
curl -X POST "https://deadmanping.com/api/ping/backup-daily?file_size_mb=42&records_processed=1000"
# In the dashboard you can set rules: file_size_mb > 0, records_processed >= 100`}
                  language="bash"
                />
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Keep Your Cron. Add One Curl.
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing gives you cron monitoring without SDK or agent. Create a monitor, get a unique ping URL, add one line to your job. 
                    You get alerts when the job doesn&apos;t run or when results fail validation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/auth/signup"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Start Free
                    </Link>
                    <Link
                      href="/blog/monitor-cron-jobs"
                      className="border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift text-center"
                    >
                      Monitor Cron Jobs Guide
                    </Link>
                  </div>
                </div>
              </section>
            </AnimatedSection>

            <RelatedArticles slug="cron-monitoring-without-sdk" />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
