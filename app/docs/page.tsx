import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "DeadManPing Documentation | Quick Start Guide | API Reference",
  description: "Complete documentation for DeadManPing cron job monitoring. Quick start guide, API reference, integration examples for bash, Python, Node.js, and Docker.",
  keywords: "deadmanping documentation, cron monitoring api, dead man switch api, cron job monitoring guide, ping api documentation",
  openGraph: {
    title: "DeadManPing Documentation",
    description: "Complete documentation for DeadManPing cron job monitoring. Quick start guide and API reference.",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "DeadManPing Documentation",
    description: "Complete documentation for DeadManPing cron job monitoring. Quick start guide and API reference.",
  },
  alternates: {
    canonical: "/docs",
  },
}

export default function DocsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Documentation",
        "item": `${baseUrl}/docs`
      }
    ]
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Monitor Cron Jobs with DeadManPing",
    "description": "Step-by-step guide to set up DeadManPing monitoring for your cron jobs without changing your existing setup.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Create a Monitor",
        "text": "After signing up, create your first monitor. Give it a name and set how often your job should run.",
        "url": `${baseUrl}/docs#create-monitor`
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Get Your Ping URL",
        "text": "Each monitor gets a unique URL. Copy it and add it to your cron job or script.",
        "url": `${baseUrl}/docs#ping-url`
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Add to Your Existing Script",
        "text": "Add one curl line at the end of your existing script. The curl command must be inside your script, not in the cron line, because only in the script do you have access to variables from execution results.",
        "url": `${baseUrl}/docs#add-script`
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Configure Payload Validation",
        "text": "Send data in the payload and configure validation rules in the DeadManPing panel. For example, to detect empty backup files, send file size and set a validation rule.",
        "url": `${baseUrl}/docs#payload-validation`
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Set Up Alerts",
        "text": "Configure email, Slack, or Discord webhooks in your settings. You'll get instant notifications when your job doesn't ping, reports a failure, or recovers.",
        "url": `${baseUrl}/docs#alerts`
      }
    ],
    "totalTime": "PT2M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    }
  }


  return (
    <div className="min-h-screen text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
          <AnimatedSection>
            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">Quick Start Guide</h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Get started with DeadManPing in 2 minutes. Monitor your cron jobs with a simple curl command.
              </p>
            </header>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Important: What DeadManPing Does</h2>
            <p className="text-muted-foreground mb-4">
              <strong>DeadManPing doesn't run your jobs.</strong> It only observes the results.
            </p>
            <p className="text-muted-foreground mb-4">
              Your cron runs your jobs. Your scripts execute your logic. DeadManPing only observes if the ping arrived, when it arrived, and what payload it contained.
            </p>
            <p className="text-muted-foreground">
              Keep your cron. Keep your scripts. Just add one curl line at the end of your existing script.
            </p>
            </div>
          </AnimatedSection>

          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 space-y-8">
            <AnimatedSection>
              <section id="create-monitor">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">1. Create a Monitor</h2>
              <p className="text-muted-foreground mb-4">
                After signing up, create your first monitor. Give it a name and set how often your job should run.
              </p>
            </section>

            <section id="ping-url">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">2. Get Your Ping URL</h2>
              <p className="text-muted-foreground mb-4">
                Each monitor gets a unique URL. Copy it and add it to your cron job or script.
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto card-hover">
                <code className="text-foreground">https://deadmanping.com/ping/your-monitor-slug</code>
              </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section id="add-script">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">3. Add to Your Existing Script</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Important:</strong> The curl command must be <strong>inside your script</strong>, not in the cron line, because only in the script do you have access to variables from execution results (e.g., count, file size, duration).
              </p>
              <p className="text-muted-foreground mb-4">Here are examples for different scenarios:</p>

              <div className="space-y-4">
                <AnimatedItem delay={0}>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Basic Bash Script</h3>
                    <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto card-hover">
                    <code className="text-foreground">
                      <div>#!/bin/bash</div>
                      <div># Your existing backup script here</div>
                      <div>./backup.sh</div>
                      <div></div>
                      <div># Add this one line at the end</div>
                      <div>curl -X POST "https://deadmanping.com/ping/your-monitor-slug" \</div>
                      <div>  -H "Content-Type: application/json" \</div>
                      <div>  -d {"'"}{'{'}`"success": true{'}'}{"'"}</div>
                    </code>
                    </div>
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={100}>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Bash Script with Data from Execution</h3>
                    <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto card-hover">
                    <code className="text-foreground">
                      <div>#!/bin/bash</div>
                      <div>users_synced=$(./sync_users_logic.sh)</div>
                      <div>if [ $? -eq 0 ]; then</div>
                      <div>  curl -X POST "https://deadmanping.com/ping/your-monitor-slug" \</div>
                      <div>    -H "Content-Type: application/json" \</div>
                      <div>    -d "{'{'}\"success\": true, \"count\": $users_synced{'}'}"</div>
                      <div>else</div>
                      <div>  curl -X POST "https://deadmanping.com/ping/your-monitor-slug" \</div>
                      <div>    -H "Content-Type: application/json" \</div>
                      <div>    -d {"'"}{'{'}`"success": false{'}'}{"'"}</div>
                      <div>fi</div>
                    </code>
                    </div>
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={200}>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Crontab Entry</h3>
                    <p className="text-sm text-muted-foreground mb-2">Just call your script. The curl is inside the script.</p>
                    <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto card-hover">
                    <code className="text-foreground">
                      <div>0 3 * * * /path/to/backup.sh</div>
                    </code>
                    </div>
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={300}>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Python Script</h3>
                    <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto card-hover">
                    <code className="text-foreground">
                      <div>import requests</div>
                      <div></div>
                      <div># Your existing script logic here</div>
                      <div>records_synced = sync_users()</div>
                      <div></div>
                      <div># Add this one line at the end</div>
                      <div>requests.post(</div>
                      <div>  "https://deadmanping.com/ping/your-monitor-slug",</div>
                      <div>  json={'{'}"success": True, "count": records_synced{'}'}</div>
                      <div>)</div>
                    </code>
                    </div>
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={400}>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Node.js Script</h3>
                    <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto card-hover">
                    <code className="text-foreground">
                      <div>const https = require('https');</div>
                      <div></div>
                      <div>// Your existing script logic here</div>
                      <div>const recordsSynced = await syncUsers();</div>
                      <div></div>
                      <div>// Add this one line at the end</div>
                      <div>const payload = JSON.stringify({'{'}"success": true, "count": recordsSynced{'}'});</div>
                      <div>const req = https.request('https://deadmanping.com/ping/your-monitor-slug', {'{'}</div>
                      <div>  method: 'POST',</div>
                      <div>  headers: {'{'}'Content-Type': 'application/json'{'}'}</div>
                      <div>{'}'});</div>
                      <div>req.write(payload);</div>
                      <div>req.end();</div>
                    </code>
                    </div>
                  </div>
                </AnimatedItem>
              </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">What Can You Monitor?</h2>
              <p className="text-muted-foreground mb-4">
                DeadManPing can monitor different types of verification with data from your script execution:
              </p>
              <div className="space-y-4">
                <AnimatedItem delay={0}>
                  <div className="bg-background border border-border rounded-lg p-4 card-hover">
                    <h3 className="text-base font-semibold mb-2">File Verification</h3>
                    <p className="text-sm text-muted-foreground mb-2">Check if backup file exists and size (GB)</p>
                    <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs">
                      <code>{`if [ -f "$BACKUP_FILE" ]; then
  FILE_SIZE_GB=$(du -h "$BACKUP_FILE" | ...)
  curl ... -d "{\\"file_exists\\": true, \\"size_gb\\": $FILE_SIZE_GB}"
fi`}</code>
                    </pre>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={100}>
                  <div className="bg-background border border-border rounded-lg p-4 card-hover">
                    <h3 className="text-base font-semibold mb-2">Count Verification</h3>
                    <p className="text-sm text-muted-foreground mb-2">How many records/items were processed</p>
                    <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs">
                      <code>{`RECORDS_PROCESSED=$(./sync.sh | grep -c "synced")
curl ... -d "{\\"count\\": $RECORDS_PROCESSED}"`}</code>
                    </pre>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={200}>
                  <div className="bg-background border border-border rounded-lg p-4 card-hover">
                    <h3 className="text-base font-semibold mb-2">Duration Verification</h3>
                    <p className="text-sm text-muted-foreground mb-2">How long script execution took</p>
                    <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs">
                      <code>{`START_TIME=$(date +%s)
./generate_report.sh
DURATION=$((END_TIME - START_TIME))
curl ... -d "{\\"duration_seconds\\": $DURATION}"`}</code>
                    </pre>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={300}>
                  <div className="bg-background border border-border rounded-lg p-4 card-hover">
                    <h3 className="text-base font-semibold mb-2">Status Verification</h3>
                    <p className="text-sm text-muted-foreground mb-2">Success/failure with context</p>
                    <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs">
                      <code>{`if ./backup.sh; then
  curl ... -d "{\\"success\\": true, \\"backup_size\\": \\"$SIZE\\"}"
else
  curl ... -d "{\\"success\\": false, \\"error\\": \\"$ERROR\\"}"
fi`}</code>
                    </pre>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={400}>
                  <div className="bg-background border border-border rounded-lg p-4 card-hover">
                    <h3 className="text-base font-semibold mb-2">Threshold Verification</h3>
                    <p className="text-sm text-muted-foreground mb-2">Numeric values (more/less than X)</p>
                    <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs">
                      <code>{`FILES_DELETED=$(./cleanup.sh | wc -l)
curl ... -d "{\\"files_deleted\\": $FILES_DELETED}"
# In dashboard: files_deleted >= 10 → OK, < 10 → WARN`}</code>
                    </pre>
                  </div>
                </AnimatedItem>
              </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section id="payload-validation">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">4. Payload Validation</h2>
              <p className="text-muted-foreground mb-4">
                Instead of checking conditions in your code, send data in the payload and configure validation rules in the DeadManPing panel. For example, to detect empty backup files:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto card-hover">
                <code className="text-foreground">curl -X POST "https://deadmanping.com/ping/your-monitor-slug?size=$FILE_SIZE"</code>
              </div>
              <p className="text-muted-foreground mb-4 mt-4">
                Then in the DeadManPing panel, set a validation rule: <code className="bg-muted px-1.5 py-0.5 rounded text-sm">size &gt; 0</code>. The panel will automatically detect violations and alert you.
              </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section id="alerts">
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
            </AnimatedSection>

            <AnimatedSection>
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Have More Questions?</h2>
                <p className="text-muted-foreground mb-4">
                  Check out our comprehensive{' '}
                  <Link href="/faq" className="text-primary hover:underline font-medium">
                    FAQ page
                  </Link>
                  {' '}for answers to common questions about DeadManPing, monitoring setup, pricing, and more.
                </p>
              </section>
            </AnimatedSection>
          </div>
        </article>
      </main>
    </div>
  )
}
