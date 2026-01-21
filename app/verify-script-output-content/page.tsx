import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Verify Script Output Content | DeadManPing",
  description: "How to verify script output contains expected content. Examples for validating script output in bash, Python, Node.js.",
  keywords: "verify script output content, check script output content, validate script output, verify script output, script output validation, check script output",
  openGraph: {
    title: "Verify Script Output Content | DeadManPing",
    description: "How to verify script output contains expected content.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify Script Output Content | DeadManPing",
    description: "How to verify script output contains expected content.",
  },
  alternates: {
    canonical: "/verify-script-output-content",
  },
}

export default function VerifyScriptOutputContentPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Verify Script Output Content: Validate Output Quality",
    "description": "Complete guide on verifying that script output contains expected content and detecting when output is missing or incorrect.",
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
              Verify Script Output Content: Validate Output Quality
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your script runs successfully, but you need to verify the output contains expected content. Learn how to validate script output programmatically.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Why Output Validation Matters
                </h2>
                <p className="text-muted-foreground mb-4">
                  Scripts can run successfully but produce wrong or missing output:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Database query returns empty result set</li>
                  <li>API call succeeds but response missing required fields</li>
                  <li>File processing completes but output file missing content</li>
                  <li>Report generation runs but produces empty output</li>
                  <li>Data transformation completes but format is wrong</li>
                </ul>
                <p className="text-muted-foreground">
                  Exit code alone doesn't verify output quality. You need to check output content.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Verify Output Content
                </h2>
                <p className="text-muted-foreground mb-4">
                  After running your script, verify the output contains expected content. Check for required strings, validate JSON structure, verify file contents, or count output lines.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Check Output Contains String
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
                    <div>try:</div>
                    <div>  data = json.loads(output)</div>
                    <div>  required_fields = ['status', 'data', 'timestamp']</div>
                    <div>  has_required_fields = all(field in data for field in required_fields)</div>
                    <div>except json.JSONDecodeError:</div>
                    <div>  is_valid_json = False</div>
                    <div></div>
                    <div># Single ping with output validation data in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "is_valid_json" == True</div>
                    <div>#   - "has_required_fields" == True</div>
                    <div># Panel will automatically detect if output is invalid</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/api-job?is_valid_json={'{'}is_valid_json{'}'}&has_required_fields={'{'}has_required_fields{'}'}")</div>
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
                  href="https://github.com/BlackPearl02/deadmanping-examples"
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
                    DeadManPing monitors whether your output validation completes. Set up monitoring in 2 minutes, get alerts when output is invalid.
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
