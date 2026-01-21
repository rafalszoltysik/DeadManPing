import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection } from '@/components/AnimatedSection'

export const metadata: Metadata = {
  title: "Cron Job Returns Success But Fails | DeadManPing",
  description: "How to detect when cron jobs return success exit code but actually fail. Examples for validating job results beyond exit codes.",
  keywords: "cron job returns success but fails, detect cron job false success, verify cron job actually succeeded, cron job success but error, check cron job real success",
  openGraph: {
    title: "Cron Job Returns Success But Fails | DeadManPing",
    description: "How to detect when cron jobs return success exit code but actually fail.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Job Returns Success But Fails | DeadManPing",
    description: "How to detect when cron jobs return success exit code but actually fail.",
  },
  alternates: {
    canonical: "/cron-job-returns-success-but-fails",
  },
}

export default function CronJobReturnsSuccessButFailsPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Cron Job Returns Success But Fails: Detect False Success",
    "description": "Complete guide on detecting when cron jobs return success exit code but actually fail to complete their work.",
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
              Cron Job Returns Success But Fails: Detect False Success
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Your cron job exits with code 0 (success), but it didn't actually complete its work. Learn how to detect false success.
            </p>
          </header>

          <div className="space-y-8">
            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  The Problem: False Success
                </h2>
                <p className="text-muted-foreground mb-4">
                  Scripts can exit with success code (0) even when they fail:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Script catches all exceptions but doesn't verify results</li>
                  <li>Command succeeds but produces empty or wrong output</li>
                  <li>Network request returns 200 but contains error message</li>
                  <li>File operations succeed but files are empty or corrupted</li>
                  <li>Database query runs but returns no results when data expected</li>
                  <li>Script completes but doesn't perform intended work</li>
                </ul>
                <p className="text-muted-foreground">
                  Exit code alone doesn't verify that work was actually completed. You need to validate results.
                </p>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Solution: Validate Results, Not Just Exit Codes
                </h2>
                <p className="text-muted-foreground mb-4">
                  After running commands, verify that expected results exist. Check file sizes, validate output content, confirm data was written, or verify API responses. The validation must be inside your script, not in the cron line.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Verify Backup File Created
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>BACKUP_FILE="/backups/db-$(date +%Y%m%d).sql"</div>
                    <div></div>
                    <div># Run backup (might exit 0 even if it fails)</div>
                    <div>pg_dump mydb &gt; "$BACKUP_FILE"</div>
                    <div></div>
                    <div># Get backup file size (0 if file doesn't exist or is empty)</div>
                    <div>FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2&gt;/dev/null || stat -c%s "$BACKUP_FILE" 2&gt;/dev/null || echo 0)</div>
                    <div></div>
                    <div># Single ping with file size in payload</div>
                    <div># In DeadManPing panel: set validation rule "size" &gt; 0 (or &gt;= 1024 for minimum size)</div>
                    <div># Panel will automatically detect if backup file is empty even though exit code was 0</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/backup-daily?size=$FILE_SIZE"</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Python Example: Validate API Response
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>import requests</div>
                    <div>import sys</div>
                    <div></div>
                    <div># API call might return 200 but with error</div>
                    <div>response = requests.get("https://api.example.com/data")</div>
                    <div></div>
                    <div># Extract response data for payload</div>
                    <div>has_error = False</div>
                    <div>data_count = 0</div>
                    <div>try:</div>
                    <div>  data = response.json()</div>
                    <div>  has_error = "error" in data</div>
                    <div>  data_count = len(data.get("data", []))</div>
                    <div>except:</div>
                    <div>  has_error = True</div>
                    <div></div>
                    <div># Single ping with response data in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "status_code" == 200</div>
                    <div>#   - "has_error" == False</div>
                    <div>#   - "data_count" &gt; 0</div>
                    <div># Panel will automatically detect violations and alert</div>
                    <div>requests.post(f"https://deadmanping.com/api/ping/api-job?status_code={'{'}response.status_code{'}'}&has_error={'{'}has_error{'}'}&data_count={'{'}data_count{'}'}")</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Node.js Example: Verify Database Query Results
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>const {'{'} execSync {'}'} = require(&apos;child_process&apos;);</div>
                    <div>const https = require('https');</div>
                    <div></div>
                    <div>// Query might succeed but return no rows</div>
                    <div>const output = execSync('psql -c "SELECT COUNT(*) FROM users"', {'{'} encoding: 'utf8' {'}'});</div>
                    <div></div>
                    <div>// Parse count from output</div>
                    <div>const match = output.match(/(\d+)/);</div>
                    <div>const count = match ? parseInt(match[1]) : 0;</div>
                    <div></div>
                    <div>// Single ping with count in payload</div>
                    <div>// In DeadManPing panel: set validation rules:</div>
                    <div>//   - "count" &gt; 0 (to detect empty results)</div>
                    <div>//   - "count" &gt;= 10 (minimum expected count, optional)</div>
                    <div>// Panel will automatically detect if count violates rules</div>
                    <div>https.request(&#96;https://deadmanping.com/api/ping/db-check?count=${'{'}count{'}'}&#96;, {'{'} method: &apos;POST&apos; {'}'}).end();</div>
                  </code>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6">
                  Bash Example: Verify Multiple Conditions
                </h3>
                <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  <code className="text-foreground">
                    <div>#!/bin/bash</div>
                    <div>set -e</div>
                    <div></div>
                    <div># Run sync (might exit 0 even if sync fails)</div>
                    <div>rsync -avz /data/ user@server:/backup/</div>
                    <div></div>
                    <div># Verify sync actually worked by checking remote file</div>
                    <div>REMOTE_COUNT=$(ssh user@server "find /backup -type f | wc -l")</div>
                    <div>LOCAL_COUNT=$(find /data -type f | wc -l)</div>
                    <div></div>
                    <div># Calculate count difference</div>
                    <div>DIFF=$(( LOCAL_COUNT - REMOTE_COUNT ))</div>
                    <div>DIFF_ABS=${'{'}DIFF#-{'}'}</div>
                    <div></div>
                    <div># Single ping with sync data in payload</div>
                    <div># In DeadManPing panel: set validation rules:</div>
                    <div>#   - "local_count" &gt; 0</div>
                    <div>#   - "count_diff" &lt;= 5 (tolerance)</div>
                    <div># Panel will automatically detect if counts don't match</div>
                    <div>curl -X POST "https://deadmanping.com/api/ping/sync-job?local_count=$LOCAL_COUNT&remote_count=$REMOTE_COUNT&count_diff=$DIFF_ABS"</div>
                  </code>
                </div>
              </section>
            </AnimatedSection>

            <AnimatedSection>
              <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                  Detecting False Success with Validation
                </h2>
                <p className="text-muted-foreground mb-4">
                  After adding result validation to your scripts, use a dead man switch to monitor whether validation completed successfully. If your script detects false success and exits with error code, the ping never arrives, and you get an alert.
                </p>
                <p className="text-muted-foreground mb-4">
                  Include validation details in your ping payload (e.g., file sizes, record counts) so you can track result quality over time and detect gradual degradation.
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
                    Start Detecting False Success
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    DeadManPing monitors whether your result validation completes. Set up monitoring in 2 minutes, get alerts when jobs return false success.
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
