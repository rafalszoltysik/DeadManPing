import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Curl Returns 200 But Wrong Data | DeadManPing",
  description: "How to detect when curl returns HTTP 200 but contains wrong data or error messages. Examples for validating API responses.",
  keywords: "curl returns 200 but wrong data, curl success but wrong response, verify curl response content, detect curl error in response, curl response validation",
  openGraph: {
    title: "Curl Returns 200 But Wrong Data | DeadManPing",
    description: "How to detect when curl returns HTTP 200 but contains wrong data or error messages.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curl Returns 200 But Wrong Data | DeadManPing",
    description: "How to detect when curl returns HTTP 200 but contains wrong data or error messages.",
  },
  alternates: {
    canonical: "/curl-returns-200-but-wrong-data",
  },
}

export default function CurlReturns200ButWrongDataPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Curl Returns 200 But Wrong Data: Validate API Responses",
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
              Curl Returns 200 But Wrong Data: Validate API Responses
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your curl command returns HTTP 200, but the response body contains an error or wrong data. Here's how to detect and handle this.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: HTTP 200 with Wrong Content
                </h2>
                <p className="text-muted-foreground mb-4">
                  Many APIs return HTTP 200 even when there's an error, putting the error in the response body:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>JSON APIs return 200 with error object</li>
                  <li>REST APIs return 200 with HTML error page</li>
                  <li>GraphQL returns 200 with errors array</li>
                  <li>Health checks return 200 when service is degraded</li>
                </ul>
                <p className="text-muted-foreground">
                  Checking only HTTP status code isn't enough. You need to validate response body content.
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
                    <div>RESPONSE=$(curl -s -w "\n%{http_code}" "https://api.example.com/data")</div>
                    <div>HTTP_CODE=$(echo "$RESPONSE" | tail -n1)</div>
                    <div>BODY=$(echo "$RESPONSE" | sed '$d')</div>
                    <div></div>
                    <div>if [ "$HTTP_CODE" != "200" ]; then</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/api-check?s=fail&m=http+$HTTP_CODE"</div>
                    <div>  exit 1</div>
                    <div>fi</div>
                    <div></div>
                    <div># Check for errors in JSON</div>
                    <div>if echo "$BODY" | grep -q '"error"'; then</div>
                    <div>  ERROR=$(echo "$BODY" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)</div>
                    <div>  curl -X POST "https://deadmanping.com/api/ping/api-check?s=fail&m=$ERROR"</div>
                    <div>  exit 1</div>
                    <div>fi</div>
                    <div></div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/api-check?s=ok"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Validate JSON
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import requests</div>
                    <div>import json</div>
                    <div></div>
                    <div>response = requests.get("https://api.example.com/data")</div>
                    <div></div>
                    <div>if response.status_code != 200:</div>
                    <div>  requests.post(f"https://deadmanping.com/api/ping/api-check?s=fail&m=http+{'{'}response.status_code{'}'}")</div>
                    <div>  exit(1)</div>
                    <div></div>
                    <div>try:</div>
                    <div>  data = response.json()</div>
                    <div>  if "error" in data:</div>
                    <div>    requests.post(f"https://deadmanping.com/api/ping/api-check?s=fail&m={'{'}data['error']{'}'}")</div>
                    <div>    exit(1)</div>
                    <div>except json.JSONDecodeError:</div>
                    <div>  requests.post("https://deadmanping.com/api/ping/api-check?s=fail&m=invalid+json")</div>
                    <div>  exit(1)</div>
                    <div></div>
                    <div>requests.post("https://deadmanping.com/api/ping/api-check?s=ok")</div>
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
                  After adding response validation to your scripts, use a dead man switch to monitor whether validation completed successfully. If your script detects wrong data and exits with error code, the ping never arrives, and you get an alert.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Start Validating API Responses
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your response validation completes. Set up monitoring in 2 minutes, get alerts when APIs return wrong data.
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
