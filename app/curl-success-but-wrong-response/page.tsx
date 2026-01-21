import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Curl Success But Wrong Response | DeadManPing",
  description: "How to detect when curl returns success (200) but contains wrong data or error messages. Examples for validating API responses.",
  keywords: "curl success but wrong response, curl returns 200 but wrong data, verify curl response content, detect curl error in response, curl response validation, check curl response body",
  openGraph: {
    title: "Curl Success But Wrong Response | DeadManPing",
    description: "How to detect when curl returns success (200) but contains wrong data or error messages.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curl Success But Wrong Response | DeadManPing",
    description: "How to detect when curl returns success (200) but contains wrong data or error messages.",
  },
  alternates: {
    canonical: "/curl-success-but-wrong-response",
  },
}

export default function CurlSuccessButWrongResponsePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Curl Success But Wrong Response: How to Validate API Responses",
    "description": "Complete guide on detecting when curl returns HTTP 200 but contains error messages or wrong data.",
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
              Curl Success But Wrong Response: Validate API Responses
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your curl command returns HTTP 200, but the response body contains an error message. Learn how to detect and handle this.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: HTTP 200 with Error Content
                </h2>
                <p className="text-muted-foreground mb-4">
                  Many APIs return HTTP 200 even when there's an error, putting the error message in the response body. This breaks simple exit code checks:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>API returns 200 OK with JSON error: {"{"}"error": "Invalid token"{"}"}</li>
                  <li>REST API returns 200 with HTML error page</li>
                  <li>GraphQL returns 200 with errors array in response</li>
                  <li>Webhook endpoints return 200 but log failures internally</li>
                  <li>Health check endpoints return 200 even when service is degraded</li>
                </ul>
                <p className="text-muted-foreground">
                  Checking only HTTP status code isn't enough. You need to validate the response body content.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Validate Response Body
                </h2>
                <p className="text-muted-foreground mb-4">
                  Always check response content, not just HTTP status. Parse JSON responses and look for error fields, or search for error keywords in text responses.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Check JSON Response
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>RESPONSE=$(curl -s -w &quot;\n%{'{'}http_code{'}'}&quot; &quot;https://api.example.com/data&quot;)</div>
                    <div>HTTP_CODE=$(echo "$RESPONSE" | tail -n1)</div>
                    <div>BODY=$(echo "$RESPONSE" | sed '$d')</div>
                    <div></div>
                    <div># Extract response validation data</div>
                    <div>HAS_ERROR=0</div>
                    <div>if echo "$BODY" | grep -q '"error"'; then</div>
                    <div>  HAS_ERROR=1</div>
                    <div>fi</div>
                    <div></div>
                    <div># Single ping with response data in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "status_code" == 200</div>
                    <div>#   - "has_error" == 0</div>
                    <div># Panel will automatically detect violations and alert</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/api-check?status_code=$HTTP_CODE&has_error=$HAS_ERROR"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Validate JSON Response
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import requests</div>
                    <div>import json</div>
                    <div></div>
                    <div>response = requests.get("https://api.example.com/data")</div>
                    <div></div>
                    <div># Extract response data for payload</div>
                    <div>has_error = False</div>
                    <div>try:</div>
                    <div>  data = response.json()</div>
                    <div>  has_error = "error" in data</div>
                    <div>except json.JSONDecodeError:</div>
                    <div>  has_error = True  # Invalid JSON</div>
                    <div></div>
                    <div># Single ping with response data in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "status_code" == 200</div>
                    <div>#   - "has_error" == False</div>
                    <div># Panel will automatically detect violations and alert</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/api-check?status_code={'{'}response.status_code{'}'}&has_error={'{'}has_error{'}'}")</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Check Response Content
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>const https = require('https');</div>
                    <div></div>
                    <div>https.get('https://api.example.com/data', (res) =&gt; {'{'}</div>
                    <div>  let data = '';</div>
                    <div>  res.on('data', (chunk) =&gt; data += chunk);</div>
                    <div>  res.on('end', () =&gt; {'{'}</div>
                    <div>    // Extract response data for payload</div>
                    <div>    let hasError = false;</div>
                    <div>    try {'{'}</div>
                    <div>      const json = JSON.parse(data);</div>
                    <div>      hasError = !!json.error;</div>
                    <div>    {'}'} catch (e) {'{'}</div>
                    <div>      // Invalid JSON</div>
                    <div>    {'}'}</div>
                    <div></div>
                    <div>    // Single ping with response data in payload</div>
                    <div>    // In DeadManPing panel: set validation rules:</div>
                    <div>    //   - "status_code" == 200</div>
                    <div>    //   - "has_error" == false</div>
                    <div>    // Panel will automatically detect violations and alert</div>
                    <div>    https.request(&#96;https://deadmanping.com/api/ping/api-check?status_code=${'{'}res.statusCode{'}'}&has_error=${'{'}hasError{'}'}&#96;, {'{'} method: &apos;POST&apos; {'}'}).end();</div>
                    <div>  {'}'});</div>
                    <div>{'}'});</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  GraphQL Example: Check Errors Array
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>RESPONSE=$(curl -s -X POST "https://api.example.com/graphql" \</div>
                    <div>  -H "Content-Type: application/json" \</div>
                    <div>  -d &apos;{'{'}"query": "{'{'} query {'{'} data {'}'} {'}'}"{'}'}&apos;)</div>
                    <div></div>
                    <div># Extract GraphQL response data</div>
                    <div>HAS_ERRORS=0</div>
                    <div>if echo "$RESPONSE" | grep -q '"errors"'; then</div>
                    <div>  HAS_ERRORS=1</div>
                    <div>fi</div>
                    <div></div>
                    <div># Single ping with GraphQL response data in payload</div>
                    <div># In DeadManPing panel: set validation rule "has_errors" == 0</div>
                    <div># Panel will automatically detect if GraphQL response has errors</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/graphql-check?has_errors=$HAS_ERRORS"</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Monitoring Response Validation
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding response validation to your scripts, use a dead man switch to monitor whether validation completed successfully. If your script detects an error in the response body and exits with error code, the ping never arrives, and you get an alert.
                </p>
                <p className="text-muted-foreground mb-4">
                  Include error messages in your ping payload so you can track what types of errors occur and identify patterns.
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
                    Start Monitoring API Responses
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your response validation completes. Set up monitoring in 2 minutes, get alerts when APIs return wrong responses.
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
