import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Cron Job Exit Code Not Zero: Detect Failures | DeadManPing",
  description: "How to detect when cron jobs exit with non-zero exit codes. Examples for checking exit codes in bash, Python, Node.js.",
  keywords: "cron job exit code not zero, detect cron job exit code, cron job exit status check, check cron job exit code, verify cron job exit code, cron job failure exit code",
  openGraph: {
    title: "Cron Job Exit Code Not Zero: Detect Failures | DeadManPing",
    description: "How to detect when cron jobs exit with non-zero exit codes.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Job Exit Code Not Zero: Detect Failures | DeadManPing",
    description: "How to detect when cron jobs exit with non-zero exit codes.",
  },
  alternates: {
    canonical: "/blog/cron-job-exit-code-not-zero",
  },
}

export default function CronJobExitCodeNotZeroPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cron Job Exit Code Not Zero: How to Detect and Handle Failures",
    "description": "Complete guide on detecting when cron jobs exit with non-zero exit codes and how to monitor this automatically.",
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
              Cron Job Exit Code Not Zero: Detect Failures
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job exits with a non-zero exit code, indicating failure. Learn how to detect and handle exit codes properly.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Understanding Exit Codes
                </h2>
                <p className="text-muted-foreground mb-4">
                  Exit codes indicate whether a command succeeded or failed:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Exit code 0</strong> - Success</li>
                  <li><strong>Exit code 1</strong> - General error</li>
                  <li><strong>Exit code 2</strong> - Misuse of shell command</li>
                  <li><strong>Exit code 126</strong> - Command cannot execute</li>
                  <li><strong>Exit code 127</strong> - Command not found</li>
                  <li><strong>Exit code 130</strong> - Script terminated by Ctrl+C</li>
                  <li><strong>Any non-zero</strong> - Failure</li>
                </ul>
                <p className="text-muted-foreground">
                  Cron doesn't alert you when jobs exit with non-zero codes. You need to check exit codes explicitly.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  How to Check Exit Codes
                </h2>
                <p className="text-muted-foreground mb-4">
                  Always check exit codes after running commands. The check must be inside your script, not in the cron line, because you need to handle the exit code and send appropriate pings.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Check Exit Code
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>set -e  # Exit immediately on error</div>
                    <div></div>
                    <div># Run command and capture exit code</div>
                    <div>./backup.sh</div>
                    <div>EXIT_CODE=$?</div>
                    <div></div>
                    <div># Single ping with exit code in payload</div>
                    <div># In DeadManPing panel: set validation rule "exit_code" == 0</div>
                    <div># Panel will automatically detect if exit code is non-zero and alert</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?exit_code=$EXIT_CODE"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Check Multiple Commands
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>FAILED=0</div>
                    <div></div>
                    <div># Run multiple commands and check each</div>
                    <div>./step1.sh || FAILED=1</div>
                    <div>./step2.sh || FAILED=1</div>
                    <div>./step3.sh || FAILED=1</div>
                    <div></div>
                    <div># Single ping with step completion data in payload</div>
                    <div># In DeadManPing panel: set validation rule "failed_steps_count" == 0</div>
                    <div># Panel will automatically detect if any steps failed</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/multi-step?failed_steps_count=$FAILED"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Check Exit Code
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import subprocess</div>
                    <div>import sys</div>
                    <div>import requests</div>
                    <div></div>
                    <div># Run command and check exit code</div>
                    <div>result = subprocess.run(['./backup.sh'], capture_output=True)</div>
                    <div></div>
                    <div># Single ping with exit code in payload</div>
                    <div># In DeadManPing panel: set validation rule "exit_code" == 0</div>
                    <div># Panel will automatically detect if exit code is non-zero and alert</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/backup-daily?exit_code={'{'}result.returncode{'}'}")</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Check Process Exit Code
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>const {'{'} execSync {'}'} = require(&apos;child_process&apos;);</div>
                    <div>const https = require('https');</div>
                    <div></div>
                    <div>let exitCode = 0;</div>
                    <div>try {'{'}</div>
                    <div>  // execSync throws on non-zero exit code</div>
                    <div>  execSync('./backup.sh', {'{'} stdio: 'inherit' {'}'});</div>
                    <div>{'}'} catch (error) {'{'}</div>
                    <div>  exitCode = error.status || 1;</div>
                    <div>{'}'}</div>
                    <div></div>
                    <div>// Single ping with exit code in payload</div>
                    <div>// In DeadManPing panel: set validation rule "exit_code" == 0</div>
                    <div>// Panel will automatically detect if exit code is non-zero and alert</div>
                    <div>https.request(&#96;https://deadmanping.com/api/ping/backup-daily?exit_code=${'{'}exitCode{'}'}&#96;, {'{'} method: &apos;POST&apos; {'}'}).end();</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Pipe Failures
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>set -o pipefail  # Catch failures in pipes</div>
                    <div></div>
                    <div># Pipe can fail but still return 0</div>
                    <div>pg_dump mydb | gzip &gt; backup.sql.gz</div>
                    <div>EXIT_CODE=$?</div>
                    <div></div>
                    <div># Single ping with exit code in payload</div>
                    <div># In DeadManPing panel: set validation rule "exit_code" == 0</div>
                    <div># Panel will automatically detect if exit code is non-zero and alert</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?exit_code=$EXIT_CODE"</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Monitoring Exit Codes
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding exit code checks to your scripts, use a dead man switch to monitor whether checks completed successfully. If your script detects a non-zero exit code and exits with error, the ping never arrives, and you get an alert.
                </p>
                <p className="text-muted-foreground mb-4">
                  Include exit codes in your ping payload so you can track what types of failures occur and identify patterns.
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
                    Start Monitoring Exit Codes
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your exit code checks complete. Set up monitoring in 2 minutes, get alerts when jobs exit with non-zero codes.
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
