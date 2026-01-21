import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Verify Cron Output: Check Script Output Content | DeadManPing",
  description: "How to verify cron job script output contains expected content. Examples for validating script output in bash, Python, Node.js.",
  keywords: "verify cron output, check cron job output, verify script output content, validate cron output, cron output validation, check script output",
  openGraph: {
    title: "Verify Cron Output: Check Script Output Content | DeadManPing",
    description: "How to verify cron job script output contains expected content.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify Cron Output: Check Script Output Content | DeadManPing",
    description: "How to verify cron job script output contains expected content.",
  },
  alternates: {
    canonical: "/verify-cron-output",
  },
}

export default function VerifyCronOutputPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Verify Cron Output: How to Validate Script Output Content",
    "description": "Complete guide on verifying that cron job scripts produce expected output and detecting when output is missing or incorrect.",
    "author": {
      "@type": "Organization",
      "name": "DeadManPing"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing"
    }
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Verify Cron Output: Check Script Output Content
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job runs successfully, but you need to verify the script output contains expected content. Here's how to validate output programmatically.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: Output Validation
                </h2>
                <p className="text-muted-foreground mb-4">
                  Scripts can run successfully but produce wrong or missing output:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Database query returns empty result set instead of expected data</li>
                  <li>API call succeeds but response doesn't contain required fields</li>
                  <li>File processing completes but output file is missing expected content</li>
                  <li>Report generation runs but produces empty or malformed output</li>
                  <li>Data transformation completes but output format is wrong</li>
                  <li>Log parsing succeeds but doesn't find expected patterns</li>
                </ul>
                <p className="text-muted-foreground">
                  Exit code alone doesn't verify output quality. You need to check output content.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Validate Output Content
                </h2>
                <p className="text-muted-foreground mb-4">
                  After running your script, verify the output contains expected content. Check for required strings, validate JSON structure, verify file contents, or count output lines. The validation must be inside your script, not in the cron line.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Check Output Contains Expected String
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>OUTPUT=$(./generate-report.sh)</div>
                    <div></div>
                    <div># Verify output contains expected content</div>
                    <div>if ! echo "$OUTPUT" | grep -q "Report generated successfully"; then</div>
                    <div>  echo "Error: Output missing expected content"</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/report-job?s=fail&m=missing+content"</div>
                    <div>  exit 1</div>
                    <div>fi</div>
                    <div></div>
                    <div># Verify output is not empty</div>
                    <div>if [ -z "$OUTPUT" ]; then</div>
                    <div>  echo "Error: Output is empty"</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/report-job?s=fail&m=empty+output"</div>
                    <div>  exit 1</div>
                    <div>fi</div>
                    <div></div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/report-job?s=ok"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Validate JSON Output
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import subprocess</div>
                    <div>import json</div>
                    <div>import requests</div>
                    <div></div>
                    <div>result = subprocess.run(['./api-fetch.sh'], capture_output=True, text=True)</div>
                    <div>output = result.stdout</div>
                    <div></div>
                    <div># Verify output is valid JSON</div>
                    <div>try:</div>
                    <div>  data = json.loads(output)</div>
                    <div>except json.JSONDecodeError:</div>
                    <div>  requests.post("https://deadmanping.com/api/ping/api-job?s=fail&m=invalid+json")</div>
                    <div>  exit(1)</div>
                    <div></div>
                    <div># Verify required fields exist</div>
                    <div>required_fields = ['status', 'data', 'timestamp']</div>
                    <div>for field in required_fields:</div>
                    <div>  if field not in data:</div>
                    <div>    requests.post(f"https://deadmanping.com/api/ping/api-job?s=fail&m=missing+{'{'}field{'}'}")</div>
                    <div>    exit(1)</div>
                    <div></div>
                    <div># Verify data is not empty</div>
                    <div>if not data.get('data'):</div>
                    <div>  requests.post("https://deadmanping.com/api/ping/api-job?s=fail&m=empty+data")</div>
                    <div>  exit(1)</div>
                    <div></div>
                    <div>requests.post("https://deadmanping.com/api/ping/api-job?s=ok")</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Check File Output Content
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>const { execSync } = require('child_process');</div>
                    <div>const fs = require('fs');</div>
                    <div>const https = require('https');</div>
                    <div></div>
                    <div>// Run script</div>
                    <div>execSync('./process-data.sh');</div>
                    <div></div>
                    <div>// Verify output file exists and has content</div>
                    <div>const outputFile = '/output/processed-data.json';</div>
                    <div>if (!fs.existsSync(outputFile)) {'{'}</div>
                    <div>  https.request('https://deadmanping.com/api/ping/data-job?s=fail&m=file+missing', {'{'} method: 'POST' {'}'}).end();</div>
                    <div>  process.exit(1);</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>// Verify file content</div>
                    <div>const content = fs.readFileSync(outputFile, 'utf8');</div>
                    <div>if (!content.includes('"status": "success"')) {'{'}</div>
                    <div>  https.request('https://deadmanping.com/api/ping/data-job?s=fail&m=missing+status', {'{'} method: 'POST' {'}'}).end();</div>
                    <div>  process.exit(1);</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>// Verify minimum line count</div>
                    <div>const lineCount = content.split('\n').length;</div>
                    <div>if (lineCount &lt; 10) {'{'}</div>
                    <div>  https.request(`https://deadmanping.com/api/ping/data-job?s=fail&m=too+few+lines+${'{'}lineCount{'}'}`, {'{'} method: 'POST' {'}'}).end();</div>
                    <div>  process.exit(1);</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>https.request('https://deadmanping.com/api/ping/data-job?s=ok', {'{'} method: 'POST' {'}'}).end();</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Count Output Lines
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>OUTPUT=$(./query-database.sh)</div>
                    <div></div>
                    <div># Count non-empty lines</div>
                    <div>LINE_COUNT=$(echo "$OUTPUT" | grep -v '^$' | wc -l)</div>
                    <div></div>
                    <div># Verify minimum expected lines</div>
                    <div>if [ "$LINE_COUNT" -lt 5 ]; then</div>
                    <div>  echo "Error: Too few output lines: $LINE_COUNT"</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/query-job?s=fail&m=too+few+lines"</div>
                    <div>  exit 1</div>
                    <div>fi</div>
                    <div></div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/query-job?s=ok&lines=$LINE_COUNT"</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Monitoring Output Validation
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding output validation to your scripts, use a dead man switch to monitor whether validation completed successfully. If your script detects invalid output and exits with error code, the ping never arrives, and you get an alert.
                </p>
                <p className="text-muted-foreground mb-4">
                  Include validation details in your ping payload (e.g., line counts, missing fields) so you can track output quality over time.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Start Verifying Script Output
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your output validation completes. Set up monitoring in 2 minutes, get alerts when output is invalid or missing.
                  </p>
                  <Link
                    href="/auth/signup"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift"
                  >
                    Start Monitoring Free
                  </Link>
                </div>
              </section>
            </AnimatedSection>
          </div>
        </article>
      </main>
    </div>
  )
}
