import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { Footer } from '@/components/Footer'
import { CodeBlock } from '@/components/CodeBlock'
import { createArticleSchema, createBreadcrumbSchema } from '@/lib/seo-helpers'
import { RelatedArticles } from '@/components/RelatedArticles'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Cron Job Not Running? How to Detect and Fix | DeadManPing",
  description: "Your cron job stopped running. Learn how to detect failures, diagnose why they're not running, and set up monitoring to prevent incidents.",
  keywords: "cron job not running, cron job failed, detect cron job failure, why cron job not running, cron job troubleshooting, cron job stopped working, cron job monitoring, cron notification if is not working, cron notification not working, cron job notification, cron notification alert, cron notification when job fails, cron notification if job fails, cron job notification service, monitor cron notification",
  openGraph: {
    title: "Cron Job Not Running? How to Detect and Fix",
    description: "Learn how to detect cron job failures, diagnose why they're not running, and set up monitoring to prevent future incidents.",
    type: "article",
    url: `${cleanBaseUrl}/blog/cron-job-failed`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Job Not Running? How to Detect and Fix",
    description: "Learn how to detect cron job failures, diagnose why they're not running, and set up monitoring to prevent future incidents.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/cron-job-failed`,
  },
}

export default function CronJobFailedPage() {
  const structuredData = createArticleSchema({
    slug: "cron-job-failed",
    headline: "Cron Job Not Running? How to Detect and Fix",
    description: "Troubleshooting guide for detecting and fixing cron jobs that stopped running.",
    keywords: "cron job not running, cron job failed, detect cron job failure, why cron job not running, cron job troubleshooting, cron job stopped working, cron job monitoring",
    articleSection: "Cron Monitoring Guides"
  })

  const breadcrumbSchema = createBreadcrumbSchema({
    slug: "cron-job-failed",
    title: "Cron Job Not Running"
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
            href="/" 
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
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Cron Job Not Running? How to Detect and Fix
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              You just discovered your cron job hasn't run in days. Learn how to detect failures immediately 
              and prevent this from happening again.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Check if Your Cron Job is Running
                </h2>
                <p className="text-muted-foreground mb-4">
                  First, verify whether the cron job is actually running. Here are the diagnostic steps:
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  1. Check Cron Logs
                </h3>
                <p className="text-muted-foreground mb-4">
                  Most Linux distributions log cron activity. Check these locations:
                </p>
                <CodeBlock
                  code={`# Check system cron logs
sudo tail -f /var/log/cron
sudo tail -f /var/log/syslog | grep CRON

# Check user cron logs (if enabled)
grep CRON /var/log/auth.log`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  2. Verify Cron Service is Running
                </h3>
                <CodeBlock
                  code={`# systemd
systemctl status cron
systemctl status crond

# Check if cron daemon is running
ps aux | grep cron`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  3. List Your Cron Jobs
                </h3>
                <CodeBlock
                  code={`# View current user's crontab
crontab -l

# View root crontab
sudo crontab -l`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  4. Check for Syntax Errors
                </h3>
                <p className="text-muted-foreground mb-4">
                  Cron silently ignores jobs with syntax errors. Validate your crontab:
                </p>
                <CodeBlock
                  code={`# Validate crontab syntax
crontab -l | crontab -

# Check for common issues
crontab -l | grep -v "^#" | grep -v "^$"`}
                  language="bash"
                />
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Common Reasons Cron Jobs Stop Running
                </h2>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  1. Cron Service Stopped or Disabled
                </h3>
                <p className="text-muted-foreground mb-4">
                  The cron daemon might have been stopped or disabled. Restart it:
                </p>
                <CodeBlock
                  code={`# systemd
sudo systemctl start cron
sudo systemctl enable cron`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  2. Incorrect PATH or Environment Variables
                </h3>
                <p className="text-muted-foreground mb-4">
                  Cron runs with a minimal environment. Your script might fail because PATH doesn't include 
                  necessary directories. Fix by using absolute paths or setting PATH in your crontab:
                </p>
                <CodeBlock
                  code={`PATH=/usr/local/bin:/usr/bin:/bin
SHELL=/bin/bash
0 3 * * * /usr/local/bin/backup.sh`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  3. Permission Issues
                </h3>
                <p className="text-muted-foreground mb-4">
                  The script might not be executable, or the user running cron doesn't have permission:
                </p>
                <CodeBlock
                  code={`# Make script executable
chmod +x /path/to/script.sh

# Check file ownership
ls -l /path/to/script.sh`}
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  4. Script Errors Not Being Logged
                </h3>
                <p className="text-muted-foreground mb-4">
                  If your script fails, cron won't tell you unless you redirect output. Always log errors:
                </p>
                <CodeBlock
                  code="0 3 * * * /path/to/script.sh >> /var/log/script.log 2>&1"
                  language="bash"
                />

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  5. Disk Space or Resource Limits
                </h3>
                <p className="text-muted-foreground mb-4">
                  Check if disk space or other resources are exhausted:
                </p>
                <CodeBlock
                  code={`# Check disk space
df -h

# Check inodes
df -i`}
                  language="bash"
                />
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Detect Cron Job Failures Automatically
                </h2>
                <p className="text-muted-foreground mb-4">
                  Manual checks are reactive. You need proactive monitoring that alerts you when a cron job 
                  doesn't run. A dead man switch is the simplest solution. With a proper cron notification system, 
                  you'll get a cron notification if is not working, ensuring you're immediately alerted when your 
                  cron job fails or stops running.
                </p>
                <p className="text-muted-foreground mb-4">
                  A cron job notification service monitors your scheduled tasks and sends cron notification alerts 
                  when something goes wrong. If your cron notification is not working, it means your job didn't 
                  complete successfully. The cron notification when job fails provides instant feedback, so you 
                  can fix issues before they impact your business.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Your cron job pings a monitoring service after each successful run</li>
                  <li>If the ping doesn't arrive within the expected interval, you get an alert</li>
                  <li>Works with any cron job, any language, any environment</li>
                  <li>No complex setup, just add a curl command</li>
                </ul>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Quick Setup Example
                </h3>
                <CodeBlock
                  code='0 3 * * * /path/to/backup.sh && curl -X POST "https://deadmanping.com/api/ping/backup-daily"'
                  language="bash"
                />
                <p className="text-muted-foreground">
                  If <code className="bg-muted px-1.5 py-0.5 rounded text-sm">backup.sh</code> fails or doesn't run, the ping never happens, 
                  and you get an alert.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Never Miss a Cron Job Failure Again
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing provides dead man switch monitoring for cron jobs. Set up monitoring in 2 minutes, 
                    get instant alerts when jobs fail, and sleep peacefully knowing you'll be notified immediately.
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

            <RelatedArticles slug="cron-job-failed" />
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
