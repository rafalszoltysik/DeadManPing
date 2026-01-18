import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'

export const metadata: Metadata = {
  title: "DeadManPing Documentation | Quick Start Guide | API Reference",
  description: "Complete documentation for DeadManPing cron job monitoring. Quick start guide, API reference, integration examples for bash, Python, Node.js, and Docker.",
  keywords: "deadmanping documentation, cron monitoring api, dead man switch api, cron job monitoring guide, ping api documentation",
  openGraph: {
    title: "DeadManPing Documentation",
    description: "Complete documentation for DeadManPing cron job monitoring. Quick start guide and API reference.",
    type: "article",
  },
  alternates: {
    canonical: "/docs",
  },
}

export default function DocsPage() {
  return (
    <div className="min-h-screen text-foreground relative">
      <PageNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Quick Start Guide</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Get started with DeadManPing in 2 minutes. Monitor your cron jobs with a simple curl command.
            </p>
          </header>

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

          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 space-y-8">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">1. Create a Monitor</h2>
              <p className="text-muted-foreground mb-4">
                After signing up, create your first monitor. Give it a name and set how often your job should run.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">2. Get Your Ping URL</h2>
              <p className="text-muted-foreground mb-4">
                Each monitor gets a unique URL. Copy it and add it to your cron job or script.
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code className="text-foreground">https://deadmanping.com/api/ping/your-monitor-slug</code>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">3. Add to Your Existing Script</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Important:</strong> The curl command must be <strong>inside your script</strong>, not in the cron line, because only in the script do you have access to variables from execution results (e.g., count, file size, duration).
              </p>
              <p className="text-muted-foreground mb-4">Here are examples for different scenarios:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Basic Bash Script</h3>
                  <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code className="text-foreground">
                      <div>#!/bin/bash</div>
                      <div># Your existing backup script here</div>
                      <div>./backup.sh</div>
                      <div></div>
                      <div># Add this one line at the end</div>
                      <div>curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug" \</div>
                      <div>  -H "Content-Type: application/json" \</div>
                      <div>  -d {"'"}{'{'}`"success": true{'}'}{"'"}</div>
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Bash Script with Data from Execution</h3>
                  <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code className="text-foreground">
                      <div>#!/bin/bash</div>
                      <div>users_synced=$(./sync_users_logic.sh)</div>
                      <div>if [ $? -eq 0 ]; then</div>
                      <div>  curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug" \</div>
                      <div>    -H "Content-Type: application/json" \</div>
                      <div>    -d "{'{'}\"success\": true, \"count\": $users_synced{'}'}"</div>
                      <div>else</div>
                      <div>  curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug" \</div>
                      <div>    -H "Content-Type: application/json" \</div>
                      <div>    -d {"'"}{'{'}`"success": false{'}'}{"'"}</div>
                      <div>fi</div>
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Crontab Entry</h3>
                  <p className="text-sm text-muted-foreground mb-2">Just call your script. The curl is inside the script.</p>
                  <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code className="text-foreground">
                      <div>0 3 * * * /path/to/backup.sh</div>
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Python Script</h3>
                  <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code className="text-foreground">
                      <div>import requests</div>
                      <div></div>
                      <div># Your existing script logic here</div>
                      <div>records_synced = sync_users()</div>
                      <div></div>
                      <div># Add this one line at the end</div>
                      <div>requests.post(</div>
                      <div>  "https://deadmanping.com/api/ping/your-monitor-slug",</div>
                      <div>  json={'{'}"success": True, "count": records_synced{'}'}</div>
                      <div>)</div>
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Node.js Script</h3>
                  <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <code className="text-foreground">
                      <div>const https = require('https');</div>
                      <div></div>
                      <div>// Your existing script logic here</div>
                      <div>const recordsSynced = await syncUsers();</div>
                      <div></div>
                      <div>// Add this one line at the end</div>
                      <div>const payload = JSON.stringify({'{'}"success": true, "count": recordsSynced{'}'});</div>
                      <div>const req = https.request('https://deadmanping.com/api/ping/your-monitor-slug', {'{'}</div>
                      <div>  method: 'POST',</div>
                      <div>  headers: {'{'}'Content-Type': 'application/json'{'}'}</div>
                      <div>{'}'});</div>
                      <div>req.write(payload);</div>
                      <div>req.end();</div>
                    </code>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">What Can You Monitor?</h2>
              <p className="text-muted-foreground mb-4">
                DeadManPing can monitor different types of verification with data from your script execution:
              </p>
              <div className="space-y-4">
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-base font-semibold mb-2">📁 File Verification</h3>
                  <p className="text-sm text-muted-foreground mb-2">Check if backup file exists and size (GB)</p>
                  <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs">
                    <code>{`if [ -f "$BACKUP_FILE" ]; then
  FILE_SIZE_GB=$(du -h "$BACKUP_FILE" | ...)
  curl ... -d "{\\"file_exists\\": true, \\"size_gb\\": $FILE_SIZE_GB}"
fi`}</code>
                  </pre>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-base font-semibold mb-2">🔢 Count Verification</h3>
                  <p className="text-sm text-muted-foreground mb-2">How many records/items were processed</p>
                  <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs">
                    <code>{`RECORDS_PROCESSED=$(./sync.sh | grep -c "synced")
curl ... -d "{\\"count\\": $RECORDS_PROCESSED}"`}</code>
                  </pre>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-base font-semibold mb-2">⏱️ Duration Verification</h3>
                  <p className="text-sm text-muted-foreground mb-2">How long script execution took</p>
                  <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs">
                    <code>{`START_TIME=$(date +%s)
./generate_report.sh
DURATION=$((END_TIME - START_TIME))
curl ... -d "{\\"duration_seconds\\": $DURATION}"`}</code>
                  </pre>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-base font-semibold mb-2">✅ Status Verification</h3>
                  <p className="text-sm text-muted-foreground mb-2">Success/failure with context</p>
                  <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs">
                    <code>{`if ./backup.sh; then
  curl ... -d "{\\"success\\": true, \\"backup_size\\": \\"$SIZE\\"}"
else
  curl ... -d "{\\"success\\": false, \\"error\\": \\"$ERROR\\"}"
fi`}</code>
                  </pre>
                </div>
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-base font-semibold mb-2">📊 Threshold Verification</h3>
                  <p className="text-sm text-muted-foreground mb-2">Numeric values (more/less than X)</p>
                  <pre className="bg-background border border-border rounded p-3 overflow-x-auto text-xs">
                    <code>{`FILES_DELETED=$(./cleanup.sh | wc -l)
curl ... -d "{\\"files_deleted\\": $FILES_DELETED}"
# In dashboard: files_deleted >= 10 → OK, < 10 → WARN`}</code>
                  </pre>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">4. Report Failures</h2>
              <p className="text-muted-foreground mb-4">
                If your job fails, you can report it by adding <code className="bg-muted px-1.5 py-0.5 rounded text-sm">?s=fail</code> to the URL:
              </p>
              <div className="bg-background border border-border p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code className="text-foreground">curl -X POST "https://deadmanping.com/api/ping/your-monitor-slug?s=fail&m=Database+connection+error"</code>
              </div>
            </section>

            <section>
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

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">FAQ</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Do I need to migrate my cron jobs?
                  </h3>
                  <p className="text-muted-foreground">
                    <strong>No.</strong> Keep your cron. Keep your scripts. Just add one curl line at the end of your existing script.
                  </p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Does DeadManPing run my jobs?
                  </h3>
                  <p className="text-muted-foreground">
                    <strong>No.</strong> Your cron runs your jobs. DeadManPing only observes the results. DeadManPing doesn't touch execution.
                  </p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Why must curl be inside the script, not in the cron line?
                  </h3>
                  <p className="text-muted-foreground">
                    Because only inside the script do you have access to variables from execution results (e.g., count, file size, duration). Data must come from execution, not be hardcoded.
                  </p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    What if my job runs less frequently than 5 minutes?
                  </h3>
                  <p className="text-muted-foreground">
                    The free tier has a minimum interval of 5 minutes. Upgrade to Starter or Pro plan for longer intervals.
                  </p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Can I monitor jobs that run on different servers?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes! As long as the server can make HTTP requests, you can ping from anywhere.
                  </p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    What happens if I exceed my monitor limit?
                  </h3>
                  <p className="text-muted-foreground">
                    You'll need to upgrade your plan to create more monitors. Existing monitors will continue to work.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
