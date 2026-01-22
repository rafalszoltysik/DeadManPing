import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'

export const metadata: Metadata = {
  title: "Cron Job Not Running? How to Detect and Fix | DeadManPing",
  description: "Your cron job stopped running. Learn how to detect cron job failures, diagnose why they're not running, and set up monitoring to prevent future incidents.",
  keywords: "cron job not running, cron job failed, detect cron job failure, why cron job not running, cron job troubleshooting, cron job stopped working, cron job monitoring, cron notification if is not working, cron notification not working, cron job notification, cron notification alert, cron notification when job fails, cron notification if job fails, cron job notification service, monitor cron notification",
  openGraph: {
    title: "Cron Job Not Running? How to Detect and Fix",
    description: "Learn how to detect cron job failures, diagnose why they're not running, and set up monitoring to prevent future incidents.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Job Not Running? How to Detect and Fix",
    description: "Learn how to detect cron job failures, diagnose why they're not running, and set up monitoring to prevent future incidents.",
  },
  alternates: {
    canonical: "/blog/cron-job-failed",
  },
}

export default function CronJobFailedPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cron Job Not Running? How to Detect and Fix",
    "description": "Troubleshooting guide for detecting and fixing cron jobs that stopped running.",
    "author": {
      "@type": "Organization",
      "name": "DeadManPing"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
            <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8">
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
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div># Check system cron logs</div>
                  <div>sudo tail -f /var/log/cron</div>
                  <div>sudo tail -f /var/log/syslog | grep CRON</div>
                  <div></div>
                  <div># Check user cron logs (if enabled)</div>
                  <div>grep CRON /var/log/auth.log</div>
                </code>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                2. Verify Cron Service is Running
              </h3>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div># systemd</div>
                  <div>systemctl status cron</div>
                  <div>systemctl status crond</div>
                  <div></div>
                  <div># Check if cron daemon is running</div>
                  <div>ps aux | grep cron</div>
                </code>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                3. List Your Cron Jobs
              </h3>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div># View current user's crontab</div>
                  <div>crontab -l</div>
                  <div></div>
                  <div># View root crontab</div>
                  <div>sudo crontab -l</div>
                </code>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                4. Check for Syntax Errors
              </h3>
              <p className="text-muted-foreground mb-4">
                Cron silently ignores jobs with syntax errors. Validate your crontab:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div># Validate crontab syntax</div>
                  <div>crontab -l | crontab -</div>
                  <div></div>
                  <div># Check for common issues</div>
                  <div>crontab -l | grep -v "^#" | grep -v "^$"</div>
                </code>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                Common Reasons Cron Jobs Stop Running
              </h2>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                1. Cron Service Stopped or Disabled
              </h3>
              <p className="text-muted-foreground mb-4">
                The cron daemon might have been stopped or disabled. Restart it:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div># systemd</div>
                  <div>sudo systemctl start cron</div>
                  <div>sudo systemctl enable cron</div>
                </code>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                2. Incorrect PATH or Environment Variables
              </h3>
              <p className="text-muted-foreground mb-4">
                Cron runs with a minimal environment. Your script might fail because PATH doesn't include 
                necessary directories. Fix by using absolute paths or setting PATH in your crontab:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div>PATH=/usr/local/bin:/usr/bin:/bin</div>
                  <div>SHELL=/bin/bash</div>
                  <div>0 3 * * * /usr/local/bin/backup.sh</div>
                </code>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                3. Permission Issues
              </h3>
              <p className="text-muted-foreground mb-4">
                The script might not be executable, or the user running cron doesn't have permission:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div># Make script executable</div>
                  <div>chmod +x /path/to/script.sh</div>
                  <div></div>
                  <div># Check file ownership</div>
                  <div>ls -l /path/to/script.sh</div>
                </code>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                4. Script Errors Not Being Logged
              </h3>
              <p className="text-muted-foreground mb-4">
                If your script fails, cron won't tell you unless you redirect output. Always log errors:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">0 3 * * * /path/to/script.sh &gt;&gt; /var/log/script.log 2&gt;&amp;1</code>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                5. Disk Space or Resource Limits
              </h3>
              <p className="text-muted-foreground mb-4">
                Check if disk space or other resources are exhausted:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">
                  <div># Check disk space</div>
                  <div>df -h</div>
                  <div></div>
                  <div># Check inodes</div>
                  <div>df -i</div>
                </code>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8">
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
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                <code className="text-foreground">0 3 * * * /path/to/backup.sh && curl -X POST "https://your-domain.com/api/ping/backup-daily"</code>
              </div>
              <p className="text-muted-foreground">
                If <code className="bg-muted px-1.5 py-0.5 rounded text-sm">backup.sh</code> fails or doesn't run, the ping never happens, 
                and you get an alert.
              </p>
            </section>

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
                <Link
                  href="/auth/signup"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift"
                >
                  Start Monitoring Free
                </Link>
              </div>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
