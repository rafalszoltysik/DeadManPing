import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'

export const metadata: Metadata = {
  title: "DeadManPing Documentation | Quick Start Guide | API Reference",
  description: "Complete documentation for DeadManPing cron job monitoring. Quick start guide, API reference, integration examples for bash, Python, Node.js, and Docker.",
  keywords: "deadmanping documentation, cron monitoring api, dead man switch api, cron job monitoring guide, ping api documentation",
  openGraph: {
    title: "DeadManPing Documentation",
    description: "Complete documentation for DeadManPing cron job monitoring. Quick start guide and API reference.",
    type: "article",
  },
  alternates: {
    canonical: "/docs",
  },
}

export default function DocsPage() {
  return (
    <div className="min-h-screen text-foreground relative">
      <PageNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Quick Start Guide</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Get started with DeadManPing in 2 minutes. Monitor your cron jobs with a simple curl command.
            </p>
          </header>

          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 space-y-8">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">1. Create a Monitor</h2>
              <p className="text-muted-foreground mb-4">
                After signing up, create your first monitor. Give it a name and set how often your job should run.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">2. Get Your Ping URL</h2>
              <p className="text-muted-foreground mb-4">
                Each monitor gets a unique URL. Copy it and add it to your cron job or script.
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code className="text-foreground">https://deadmanping.com/api/ping/your-monitor-slug</code>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">3. Add to Your Cron Job</h2>
              <p className="text-muted-foreground mb-4">Here are examples for different scenarios:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Basic Bash Script</h3>
                  <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code className="text-foreground">
                      <div>#!/bin/bash</div>
                      <div># Your backup script here</div>
                      <div>./backup.sh</div>
                      <div>curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug"</div>
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Crontab Entry</h3>
                  <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code className="text-foreground">
                      <div>0 3 * * * /path/to/backup.sh && curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug"</div>
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Python Script</h3>
                  <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code className="text-foreground">
                      <div>import requests</div>
                      <div># Your script here</div>
                      <div>requests.post("https://deadmanping.com/api/ping/your-monitor-slug")</div>
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Node.js Script</h3>
                  <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code className="text-foreground">
                      <div>const https = require('https');</div>
                      <div>// Your script here</div>
                      <div>{`https.request('https://deadmanping.com/api/ping/your-monitor-slug', { method: 'POST' }).end();`}</div>
                    </code>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">4. Report Failures</h2>
              <p className="text-muted-foreground mb-4">
                If your job fails, you can report it by adding <code className="bg-muted px-1.5 py-0.5 rounded text-sm">?s=fail</code> to the URL:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code className="text-foreground">curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug?s=fail&m=Database+connection+error"</code>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">5. Set Up Alerts</h2>
              <p className="text-muted-foreground mb-4">
                Configure email, Slack, or Discord webhooks in your settings. You'll get instant notifications when:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your job doesn't ping within the expected time window</li>
                <li>Your job reports a failure status</li>
                <li>Your job recovers after being down</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">FAQ</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    What if my job runs less frequently than 5 minutes?
                  </h3>
                  <p className="text-muted-foreground">
                    The free tier has a minimum interval of 5 minutes. Upgrade to Solo or Agency plan for longer intervals.
                  </p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Can I monitor jobs that run on different servers?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes! As long as the server can make HTTP requests, you can ping from anywhere.
                  </p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    What happens if I exceed my monitor limit?
                  </h3>
                  <p className="text-muted-foreground">
                    You'll need to upgrade your plan to create more monitors. Existing monitors will continue to work.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
