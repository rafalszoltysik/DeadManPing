/**
 * Documentation page with API reference, quick start guide, and integration examples.
 * 
 * Server component rendering static documentation content including code examples
 * for bash, Python, Node.js, and Docker. Includes structured data (BreadcrumbList,
 * HowTo) for SEO. No authentication required.
 * 
 * Does not handle API calls or dynamic content - purely static documentation.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { getCanonicalBaseUrl } from '@/lib/seo-helpers'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { CTAButton } from '@/components/CTAButton'
import { Footer } from '@/components/Footer'
import { CodeBlock } from '@/components/CodeBlock'

const canonicalBase = getCanonicalBaseUrl()

export const metadata: Metadata = {
  title: "Cron Monitoring API Docs - Quick Start, Ping, Payload Validation",
  description: "Set up cron job monitoring in 2 minutes. Ping API, start/stop tracking, payload validation. Code examples for Bash, Python, Node.js, Docker.",
  keywords: "deadmanping documentation, cron monitoring api, dead man switch api, cron job monitoring guide, ping api documentation",
  openGraph: {
    title: "Cron Monitoring API Docs - Quick Start, Ping, Payload Validation",
    description: "Set up cron job monitoring in 2 minutes. Ping API, start/stop tracking, payload validation. Bash, Python, Node.js, Docker examples.",
    type: "article",
    url: `${canonicalBase}/docs`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Monitoring API Docs - Quick Start & Payload Validation",
    description: "Set up cron monitoring in 2 minutes. Ping API, start/stop tracking, payload validation. Bash, Python, Node.js, Docker.",
  },
  alternates: {
    canonical: `${canonicalBase}/docs`,
  },
}

export default function DocsPage() {
  const baseUrl = getCanonicalBaseUrl()
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
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Four Monitoring Methods</h2>
                <p className="text-muted-foreground mb-6">
                  DeadManPing supports four monitoring methods. Choose the one that fits your needs:
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
                        Just verify that your job executed. One curl line confirms completion. Perfect for basic monitoring when you only need to know if the cron ran.
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        <strong>How it works:</strong> When your job completes, it sends a ping to DeadManPing. If the ping doesn't arrive within the expected time window, you get an alert. The monitor status changes from "healthy" to "late" or "down" if no ping is received.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Bash Example:</p>
                          <CodeBlock
                            code={`#!/bin/bash
./backup.sh

# Simple ping - just confirms execution
curl https://deadmanping.com/api/ping/your-slug`}
                            language="bash"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Python Example:</p>
                          <CodeBlock
                            code={`import requests

# Your job logic
backup_database()

# Simple ping
requests.post("https://deadmanping.com/api/ping/your-slug")`}
                            language="python"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <strong>Supported HTTP methods:</strong> GET, POST, HEAD. All methods work the same way.
                        </p>
                      </div>
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
                        Verify correctness. Send data from execution and validate results in the dashboard. Configure validation rules to check if results meet your criteria (e.g., count &gt; 100, file_size &gt; 0).
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        <strong>How it works:</strong> Send data in query parameters (GET) or JSON body (POST). DeadManPing validates the payload against rules you configure in the dashboard. If validation fails, the monitor status changes to "failed" and you get an alert. Only fields declared in your validation rules are checked - extra fields are ignored.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Bash Example (Query Parameters):</p>
                          <CodeBlock
                            code={`#!/bin/bash
users_synced=$(./sync_users.sh)
EXIT_CODE=$?

# Ping with payload via query parameters
# In DeadManPing panel: set validation rules like "count >= 100" and "exit_code == 0"
curl -X POST "https://deadmanping.com/api/ping/your-slug?count=$users_synced&exit_code=$EXIT_CODE"`}
                            language="bash"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Python Example (JSON Body):</p>
                          <CodeBlock
                            code={`import requests

# Your job logic
records_synced = sync_users()
backup_size = get_backup_size()

# Ping with payload via JSON body
# In DeadManPing panel: set validation rules like "count >= 100" and "size > 0"
requests.post(
  "https://deadmanping.com/api/ping/your-slug",
  json={"count": records_synced, "size": backup_size}
)`}
                            language="python"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <strong>Payload format:</strong> Query parameters (GET/HEAD) or JSON body (POST). Max payload size: 2KB. Validation rules can use operators: ==, !=, &gt;, &lt;, &gt;=, &lt;=, contains, starts_with, ends_with.
                        </p>
                      </div>
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
                        Measure execution time. Track job duration and optionally include payload validation. Perfect for tracking job duration and detecting performance issues.
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        <strong>How it works:</strong> Send a POST request to <code className="bg-muted px-1 py-0.5 rounded text-xs">/api/ping/your-slug/start</code> at the beginning of your job. This returns a <code className="bg-muted px-1 py-0.5 rounded text-xs">run_id</code>. When your job completes, send a ping with the <code className="bg-muted px-1 py-0.5 rounded text-xs">run_id</code> as a query parameter. DeadManPing automatically calculates the duration between start and stop. The duration is displayed in the dashboard and can be used for performance monitoring.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Bash Example:</p>
                          <CodeBlock
                            code={`#!/bin/bash

# Start tracking - returns run_id
RUN_ID=$(curl -s -X POST "https://deadmanping.com/api/ping/your-slug/start" \\
  -H "Content-Type: application/json" | jq -r '.run_id')

# Your job logic
./backup.sh
EXIT_CODE=$?

# Stop tracking with run_id
# Duration is automatically calculated and displayed in dashboard
curl -X POST "https://deadmanping.com/api/ping/your-slug?run_id=$RUN_ID"`}
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
sync_users()

# Stop tracking
# Duration is automatically calculated: stop_time - start_time
requests.post(f"https://deadmanping.com/api/ping/your-slug?run_id={run_id}")`}
                            language="python"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <strong>Duration tracking:</strong> The dashboard automatically calculates execution time in milliseconds. If a job run is not completed (no stop ping), it remains in "running" status. You can optionally provide your own <code className="bg-muted px-1 py-0.5 rounded text-xs">run_id</code> in the start request body.
                        </p>
                      </div>
                    </div>
                  </AnimatedItem>

                  <AnimatedItem delay={300}>
                    <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xl font-bold">4</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold">Start/Stop with Payload</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Track duration and validate payload data for complete monitoring. Combines execution time tracking with payload validation.
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        <strong>How it works:</strong> Same as Start/Stop Tracking, but include payload data in the stop ping. DeadManPing tracks both execution duration and validates the payload against your rules. This gives you complete visibility: you know how long the job took AND whether the results are correct.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Bash Example:</p>
                          <CodeBlock
                            code={`#!/bin/bash

# Start tracking
RUN_ID=$(curl -s -X POST "https://deadmanping.com/api/ping/your-slug/start" \\
  -H "Content-Type: application/json" | jq -r '.run_id')

# Your job logic
users_synced=$(./sync_users.sh)
EXIT_CODE=$?

# Stop tracking with run_id AND payload
# Duration is tracked AND payload is validated
curl -X POST "https://deadmanping.com/api/ping/your-slug?run_id=$RUN_ID&count=$users_synced&exit_code=$EXIT_CODE"`}
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
backup_size = get_backup_size()

# Stop tracking with run_id AND payload
# Duration is tracked AND payload is validated
requests.post(
  f"https://deadmanping.com/api/ping/your-slug?run_id={run_id}",
  json={"count": records_synced, "size": backup_size}
)`}
                            language="python"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <strong>Best of both worlds:</strong> You get execution duration tracking AND payload validation. If validation fails, the job run is marked as "failed" even if the duration was normal. This helps detect jobs that complete but produce incorrect results.
                        </p>
                      </div>
                    </div>
                  </AnimatedItem>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section id="api-reference">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">API Reference</h2>
                <p className="text-muted-foreground mb-6">
                  Detailed technical documentation for all API endpoints and how they work.
                </p>

                <div className="space-y-6">
                  <AnimatedItem delay={0}>
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">1. Simple Ping Endpoint</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Endpoint:</p>
                          <CodeBlock
                            code="GET|POST|HEAD https://deadmanping.com/api/ping/{slug}"
                            language="bash"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Description:</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Sends a ping to confirm job execution. Updates monitor status to "healthy" and sets the next expected ping time.
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Response (200 OK):</p>
                          <CodeBlock
                            code={`{
  "ok": true,
  "monitor": "Backup Daily",
  "status": "healthy"
}`}
                            language="json"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">How it works:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Updates <code className="bg-muted px-1 py-0.5 rounded text-xs">last_ping_at</code> timestamp</li>
                            <li>Calculates <code className="bg-muted px-1 py-0.5 rounded text-xs">next_expected_ping_at</code> based on expected interval + grace period</li>
                            <li>Changes status from "pending" → "healthy" (first ping) or "late"/"failed" → "healthy" (recovery)</li>
                            <li>Creates a ping record in the database</li>
                            <li>Triggers recovery alerts if status changed from failed/late to healthy</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  <AnimatedItem delay={100}>
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">2. Ping with Payload Endpoint</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Endpoint:</p>
                          <CodeBlock
                            code={`POST https://deadmanping.com/api/ping/{slug}?field1=value1&field2=value2
POST https://deadmanping.com/api/ping/{slug}
Content-Type: application/json

{"field1": "value1", "field2": "value2"}`}
                            language="bash"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Description:</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Sends a ping with payload data for validation. Only fields declared in your validation rules are checked - extra fields are ignored.
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Payload Format:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside mb-2">
                            <li><strong>Query parameters (GET/POST):</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs">?count=100&exit_code=0</code></li>
                            <li><strong>JSON body (POST):</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs">{"{"}"count": 100, "exit_code": 0{"}"}</code></li>
                            <li><strong>Max size:</strong> 2KB total</li>
                            <li><strong>Supported types:</strong> strings, numbers, booleans</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">How Validation Works:</p>
                          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Extract only declared fields from payload (ignore everything else)</li>
                            <li>Validate each field against its rule (==, !=, &gt;, &lt;, &gt;=, &lt;=, contains, etc.)</li>
                            <li>If any field with severity "error" fails → status = "failed"</li>
                            <li>If only fields with severity "warn" fail → status stays "healthy" but ping shows as "fail"</li>
                            <li>If all validations pass → status = "healthy"</li>
                          </ol>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Response (200 OK):</p>
                          <CodeBlock
                            code={`{
  "ok": true,
  "monitor": "Backup Daily",
  "status": "healthy"  // or "failed" if validation failed
}`}
                            language="json"
                          />
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  <AnimatedItem delay={200}>
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">3. Start Tracking Endpoint</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Endpoint:</p>
                          <CodeBlock
                            code={`POST https://deadmanping.com/api/ping/{slug}/start
Content-Type: application/json

{
  "run_id": "optional-custom-run-id",  // Optional
  "metadata": {}  // Optional
}`}
                            language="bash"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Description:</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Starts tracking a job run. Returns a <code className="bg-muted px-1 py-0.5 rounded text-xs">run_id</code> that you must include in the stop ping. If you don't provide a <code className="bg-muted px-1 py-0.5 rounded text-xs">run_id</code>, one is automatically generated.
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Response (200 OK):</p>
                          <CodeBlock
                            code={`{
  "ok": true,
  "run_id": "550e8400-e29b-41d4-a716-446655440000"
}`}
                            language="json"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">How it works:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Creates a job run record with status "running"</li>
                            <li>Stores <code className="bg-muted px-1 py-0.5 rounded text-xs">started_at</code> timestamp</li>
                            <li>Returns <code className="bg-muted px-1 py-0.5 rounded text-xs">run_id</code> that you must use in the stop ping</li>
                            <li>If you provide a custom <code className="bg-muted px-1 py-0.5 rounded text-xs">run_id</code>, it must be unique for this monitor</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  <AnimatedItem delay={300}>
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">4. Stop Tracking (with run_id)</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Endpoint:</p>
                          <CodeBlock
                            code="POST https://deadmanping.com/api/ping/{slug}?run_id={run_id}
POST https://deadmanping.com/api/ping/{slug}?run_id={run_id}&count=100&exit_code=0"
                            language="bash"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Description:</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Completes a job run started with the start endpoint. Automatically calculates duration. Optionally includes payload for validation.
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">How Duration is Calculated:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Duration = <code className="bg-muted px-1 py-0.5 rounded text-xs">stop_time - start_time</code> (in milliseconds)</li>
                            <li>Stored in <code className="bg-muted px-1 py-0.5 rounded text-xs">job_runs.duration_ms</code></li>
                            <li>Also stored in <code className="bg-muted px-1 py-0.5 rounded text-xs">pings.duration_ms</code> for the ping record</li>
                            <li>Displayed in dashboard for performance monitoring</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Job Run Status:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li><strong>"completed":</strong> If payload validation passes (or no validation rules)</li>
                            <li><strong>"failed":</strong> If payload validation fails</li>
                            <li><strong>"running":</strong> If stop ping never arrives (job crashed or timed out)</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Response (200 OK):</p>
                          <CodeBlock
                            code={`{
  "ok": true,
  "monitor": "Backup Daily",
  "status": "healthy"
}`}
                            language="json"
                          />
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  <AnimatedItem delay={400}>
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Error Responses</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">404 - Monitor Not Found:</p>
                          <CodeBlock
                            code={`{
  "error": "Monitor not found"
}`}
                            language="json"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">403 - Monitor Paused or Subscription Expired:</p>
                          <CodeBlock
                            code={`{
  "error": "Monitor is paused. Please upgrade your plan to reactivate it."
}`}
                            language="json"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">429 - Rate Limit Exceeded:</p>
                          <CodeBlock
                            code={`{
  "error": "Rate limit exceeded"
}`}
                            language="json"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Max 1 ping per 10 seconds per monitor. This prevents accidental spam and ensures accurate monitoring.
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">400 - Invalid Payload:</p>
                          <CodeBlock
                            code={`{
  "error": "Payload too large (max 2KB)",
  "details": "..."
}`}
                            language="json"
                          />
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  <AnimatedItem delay={500}>
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Monitor Status Lifecycle</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Status States:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li><strong>"pending":</strong> Monitor created but no ping received yet</li>
                            <li><strong>"healthy":</strong> Pings arriving on time and validation passing</li>
                            <li><strong>"late":</strong> Ping received but after expected time window</li>
                            <li><strong>"failed":</strong> Ping received but payload validation failed (error severity)</li>
                            <li><strong>"down":</strong> No ping received within expected time + grace period</li>
                            <li><strong>"paused":</strong> Monitor disabled (subscription expired or manually paused)</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Status Transitions:</p>
                          <CodeBlock
                            code={`pending → healthy (first successful ping)
healthy → late (ping received but too late)
healthy → failed (ping received but validation failed)
healthy → down (no ping received)
late → healthy (ping received on time)
late → down (no ping received)
failed → healthy (ping received with valid payload)
down → healthy (ping received after downtime)
down → late (ping received but late)`}
                            language="text"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Alert Triggers:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li><strong>Failure alert:</strong> When status changes to "failed" or "down"</li>
                            <li><strong>Recovery alert:</strong> When status changes from "failed"/"late"/"down" to "healthy"</li>
                            <li>Alerts are sent via email, Slack, or Discord webhooks (configured in settings)</li>
                          </ul>
                        </div>
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
