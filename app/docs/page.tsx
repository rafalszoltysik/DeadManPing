import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { CTAButton } from '@/components/CTAButton'
import { Footer } from '@/components/Footer'
import { CodeBlock } from '@/components/CodeBlock'

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
    <div className="min-h-screen bg-transparent text-foreground relative">
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
              <CodeBlock
                code="https://deadmanping.com/api/ping/your-monitor-slug"
                language="bash"
              />
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
                    <p className="text-sm text-muted-foreground mb-2">Simple ping to confirm execution</p>
                    <CodeBlock
                      code={`#!/bin/bash
# Your existing backup script here
./backup.sh

# Add this one line at the end
curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug"`}
                      language="bash"
                    />
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={100}>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Bash Script with Payload</h3>
                    <p className="text-sm text-muted-foreground mb-2">Send data from execution for validation</p>
                    <CodeBlock
                      code={`#!/bin/bash
users_synced=$(./sync_users_logic.sh)
EXIT_CODE=$?

# Ping with data from execution
# In DeadManPing panel: set validation rules like "count >= 100" and "exit_code == 0"
curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug?count=$users_synced&exit_code=$EXIT_CODE"`}
                      language="bash"
                    />
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={200}>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Crontab Entry</h3>
                    <p className="text-sm text-muted-foreground mb-2">Just call your script. The curl is inside the script.</p>
                    <CodeBlock
                      code="0 3 * * * /path/to/backup.sh"
                      language="bash"
                    />
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={300}>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Python Script</h3>
                    <p className="text-sm text-muted-foreground mb-2">Send file size for backup validation</p>
                    <CodeBlock
                      code={`import os
import subprocess
import requests

# Your existing script logic here
backup_file = "/backups/db-backup.sql"
subprocess.run(["pg_dump", "mydb"], stdout=open(backup_file, "w"))

# Get file size and ping
file_size = os.path.getsize(backup_file) if os.path.exists(backup_file) else 0
# In DeadManPing panel: set validation rule "size > 0"
requests.post(f"https://deadmanping.com/api/ping/your-monitor-slug?size={file_size}")`}
                      language="python"
                    />
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={400}>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Node.js Script</h3>
                    <p className="text-sm text-muted-foreground mb-2">Send count of processed records</p>
                    <CodeBlock
                      code={`const https = require('https');

// Your existing script logic here
const recordsSynced = await syncUsers();

// Ping with count
// In DeadManPing panel: set validation rule "count >= 1"
https.request(\`https://deadmanping.com/api/ping/your-monitor-slug?count=\${recordsSynced}\`, {
  method: 'POST'
}).end();`}
                      language="javascript"
                    />
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={500}>
                  <div className="bg-card border-2 border-primary/20 rounded-lg p-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      More Examples
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Need more examples? Check out our comprehensive collection with 20+ ready-to-use scripts in Bash, Python, and Node.js:
                    </p>
                    <Link
                      href="https://github.com/DeadManPing/examples"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-2 font-medium"
                    >
                      View All Examples on GitHub
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>
                </AnimatedItem>
              </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section id="monitoring-modes">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Three Monitoring Modes</h2>
                <p className="text-muted-foreground mb-6">
                  DeadManPing supports three monitoring modes. Choose the one that fits your needs:
                </p>

                <div className="space-y-6">
                  <AnimatedItem delay={0}>
                    <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xl font-bold">1</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold">Simple Ping</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Just verify that your job executed. Perfect for basic monitoring when you only need to know if the cron ran.
                      </p>
                      <CodeBlock
                        code={`#!/bin/bash
./backup.sh

# Simple ping - just confirms execution
curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug"`}
                        language="bash"
                      />
                    </div>
                  </AnimatedItem>

                  <AnimatedItem delay={100}>
                    <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xl font-bold">2</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold">Ping with Payload</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Verify correctness by sending data from execution. Configure validation rules in the dashboard to check if results meet your criteria (e.g., count &gt; 100, file_size &gt; 0).
                      </p>
                      <CodeBlock
                        code={`#!/bin/bash
users_synced=$(./sync_users.sh)
EXIT_CODE=$?

# Ping with payload - validates results
# In DeadManPing panel: set validation rules like "count >= 100" and "exit_code == 0"
curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug?count=$users_synced&exit_code=$EXIT_CODE"`}
                        language="bash"
                      />
                    </div>
                  </AnimatedItem>

                  <AnimatedItem delay={200}>
                    <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xl font-bold">3</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold">Start/Stop Tracking</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Measure execution time by sending a start signal at the beginning and a ping with run_id at the end. Optionally include payload for result validation. Perfect for tracking job duration and detecting performance issues.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Bash Example:</p>
                          <CodeBlock
                            code={`#!/bin/bash

# Start tracking
RUN_ID=$(curl -s -X POST "https://deadmanping.com/api/ping/your-slug/start" \\
  -H "Content-Type: application/json" | jq -r '.run_id')

# Your job logic
./backup.sh
EXIT_CODE=$?

# Stop tracking with payload
curl -X POST "https://deadmanping.com/api/ping/your-slug?run_id=$RUN_ID" \\
  -H "Content-Type: application/json" \\
  -d '{"exit_code": '$EXIT_CODE'}'`}
                            language="bash"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Python Example:</p>
                          <CodeBlock
                            code={`import requests

# Start tracking
start_response = requests.post("https://deadmanping.com/api/ping/your-slug/start")
run_id = start_response.json()["run_id"]

# Your job logic
records_synced = sync_users()

# Stop tracking with payload
requests.post(
  f"https://deadmanping.com/api/ping/your-slug?run_id={run_id}",
  json={"count": records_synced}
)`}
                            language="python"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          The dashboard will automatically calculate and display execution duration. You can also set validation rules on the payload data.
                        </p>
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
                    <CodeBlock
                      code={`if [ -f "$BACKUP_FILE" ]; then
  FILE_SIZE_GB=$(du -h "$BACKUP_FILE" | ...)
  curl -X POST "https://deadmanping.com/api/ping/your-slug?file_exists=1&size_gb=$FILE_SIZE_GB"
fi`}
                      language="bash"
                    />
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={100}>
                  <div className="bg-background border border-border rounded-lg p-4 card-hover">
                    <h3 className="text-base font-semibold mb-2">Count Verification</h3>
                    <p className="text-sm text-muted-foreground mb-2">How many records/items were processed</p>
                    <CodeBlock
                      code={`RECORDS_PROCESSED=$(./sync.sh | grep -c "synced")
curl -X POST "https://deadmanping.com/api/ping/your-slug?count=$RECORDS_PROCESSED"`}
                      language="bash"
                    />
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={200}>
                  <div className="bg-background border border-border rounded-lg p-4 card-hover">
                    <h3 className="text-base font-semibold mb-2">Duration Verification</h3>
                    <p className="text-sm text-muted-foreground mb-2">How long script execution took</p>
                    <CodeBlock
                      code={`START_TIME=$(date +%s)
./generate_report.sh
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
curl -X POST "https://deadmanping.com/api/ping/your-slug?duration_seconds=$DURATION"`}
                      language="bash"
                    />
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={300}>
                  <div className="bg-background border border-border rounded-lg p-4 card-hover">
                    <h3 className="text-base font-semibold mb-2">Status Verification</h3>
                    <p className="text-sm text-muted-foreground mb-2">Success/failure with context</p>
                    <CodeBlock
                      code={`./backup.sh
EXIT_CODE=$?
SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")

# Always ping with exit code and size
# In DeadManPing panel: set validation rules "exit_code == 0" and "size > 0"
curl -X POST "https://deadmanping.com/api/ping/your-slug?exit_code=$EXIT_CODE&size=$SIZE"`}
                      language="bash"
                    />
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={400}>
                  <div className="bg-background border border-border rounded-lg p-4 card-hover">
                    <h3 className="text-base font-semibold mb-2">Threshold Verification</h3>
                    <p className="text-sm text-muted-foreground mb-2">Numeric values (more/less than X)</p>
                    <CodeBlock
                      code={`FILES_DELETED=$(./cleanup.sh | wc -l)
curl -X POST "https://deadmanping.com/api/ping/your-slug?files_deleted=$FILES_DELETED"
# In dashboard: files_deleted >= 10 → OK, < 10 → WARN`}
                      language="bash"
                    />
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
              <CodeBlock
                code={`curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug?size=$FILE_SIZE"`}
                language="bash"
              />
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

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 mt-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Start Monitoring Your Backups</h2>
                <p className="text-muted-foreground mb-6">
                  DeadManPing provides automated backup monitoring with dead man switch technology. Set up monitoring in 2 minutes, works with any backup method, and sends alerts via email, Slack, or Discord.
                </p>
                <CTAButton className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-smooth hover-lift">
                  Start Free Trial
                </CTAButton>
              </section>
            </AnimatedSection>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
