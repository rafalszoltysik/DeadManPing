import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Verify Cron Output: Check Script Output Content | DeadManPing",
  description: "How to verify cron job script output contains expected content. Examples for validating script output in bash, Python, Node.js.",
  keywords: "verify cron output, check cron job output, verify script output content, validate cron output, cron output validation, check script output",
  openGraph: {
    title: "Verify Cron Output: Check Script Output Content | DeadManPing",
    description: "How to verify cron job script output contains expected content.",
    type: "article",
    url: `${cleanBaseUrl}/blog/verify-cron-output`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify Cron Output: Check Script Output Content | DeadManPing",
    description: "How to verify cron job script output contains expected content.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog/verify-cron-output`,
  },
}

export default function VerifyCronOutputPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "url": `${cleanBaseUrl}/blog/verify-cron-output`,
    "headline": "Verify Cron Output: How to Validate Script Output Content",
    "description": "Complete guide on verifying that cron job scripts produce expected output and detecting when output is missing or incorrect.",
    "datePublished": "2024-12-01",
    "dateModified": "2024-12-01",
    "author": {
      "@type": "Organization",
      "name": "DeadManPing",
      "url": cleanBaseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing",
      "logo": {
        "@type": "ImageObject",
        "url": `${cleanBaseUrl}/icon.svg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${cleanBaseUrl}/blog/verify-cron-output`
    },
    "articleSection": "Cron Monitoring Guides",
    "keywords": "verify cron output, check cron job output, verify script output content, validate cron output, cron output validation, check script output",
    "inLanguage": "en-US"
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": cleanBaseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Verify Cron Output",
        "item": `${cleanBaseUrl}/blog/verify-cron-output`
      }
    ]
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
              Your cron job runs successfully, but you need to verify the script output contains expected content. Learn how to validate output programmatically.
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
                    <div># Get output validation data</div>
                    <div>HAS_EXPECTED_CONTENT=0</div>
                    <div>OUTPUT_LENGTH=${'{'}#OUTPUT{'}'}</div>
                    <div>if echo "$OUTPUT" | grep -q "Report generated successfully"; then</div>
                    <div>  HAS_EXPECTED_CONTENT=1</div>
                    <div>fi</div>
                    <div></div>
                    <div># Single ping with output validation data in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "has_expected_content" == 1</div>
                    <div>#   - "output_length" &gt; 0</div>
                    <div># Panel will automatically detect if output is invalid</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/report-job?has_expected_content=$HAS_EXPECTED_CONTENT&output_length=$OUTPUT_LENGTH"</div>
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
                    <div># Parse output and extract data for payload</div>
                    <div>is_valid_json = True</div>
                    <div>has_required_fields = False</div>
                    <div>data_not_empty = False</div>
                    <div>try:</div>
                    <div>  data = json.loads(output)</div>
                    <div>  required_fields = ['status', 'data', 'timestamp']</div>
                    <div>  has_required_fields = all(field in data for field in required_fields)</div>
                    <div>  data_not_empty = bool(data.get('data'))</div>
                    <div>except json.JSONDecodeError:</div>
                    <div>  is_valid_json = False</div>
                    <div></div>
                    <div># Single ping with output validation data in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "is_valid_json" == True</div>
                    <div>#   - "has_required_fields" == True</div>
                    <div>#   - "data_not_empty" == True</div>
                    <div># Panel will automatically detect if output is invalid</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/api-job?is_valid_json={'{'}is_valid_json{'}'}&has_required_fields={'{'}has_required_fields{'}'}&data_not_empty={'{'}data_not_empty{'}'}")</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Check File Output Content
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>const {'{'} execSync {'}'} = require(&apos;child_process&apos;);</div>
                    <div>const fs = require('fs');</div>
                    <div>const https = require('https');</div>
                    <div></div>
                    <div>// Run script</div>
                    <div>execSync('./process-data.sh');</div>
                    <div></div>
                    <div>// Get output file data</div>
                    <div>const outputFile = '/output/processed-data.json';</div>
                    <div>let fileExists = fs.existsSync(outputFile);</div>
                    <div>let lineCount = 0;</div>
                    <div>let hasStatusField = false;</div>
                    <div></div>
                    <div>if (fileExists) {'{'}</div>
                    <div>  const content = fs.readFileSync(outputFile, 'utf8');</div>
                    <div>  lineCount = content.split('\n').length;</div>
                    <div>  hasStatusField = content.includes('"status": "success"');</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>// Single ping with output data in payload</div>
                    <div>// In DeadManPing panel: set validation rules:</div>
                    <div>//   - "file_exists" == true</div>
                    <div>//   - "line_count" &gt;= 10</div>
                    <div>//   - "has_status_field" == true</div>
                    <div>// Panel will automatically detect if output is invalid</div>
                    <div>https.request(&#96;https://deadmanping.com/api/ping/data-job?file_exists=${'{'}fileExists{'}'}&line_count=${'{'}lineCount{'}'}&has_status_field=${'{'}hasStatusField{'}'}&#96;, {'{'} method: &apos;POST&apos; {'}'}).end();</div>
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
                    <div># Single ping with line count in payload</div>
                    <div># In DeadManPing panel: set validation rule "line_count" &gt;= 5</div>
                    <div># Panel will automatically detect if output has too few lines</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/query-job?lines=$LINE_COUNT"</div>
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
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Working Examples
                </h2>
                <p className="text-muted-foreground mb-4">
                  See complete, working code examples in our GitHub repository:
                </p>
                <Link
                  href="https://github.com/DeadManPing/examples"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-2"
                >
                  View Examples on GitHub →
                </Link>
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
