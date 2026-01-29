'use client'

import { useState } from 'react'
import { MonitorFormDemo, type MonitorFormData } from './MonitorFormDemo'
import { CTAButton } from './CTAButton'
import { AnimatedItem, StaggerContainer } from './AnimatedSection'
import { CodeBlock } from './CodeBlock'

function generateCronExpression(intervalValue: number, intervalUnit: 'hours' | 'minutes'): string {
  if (intervalUnit === 'minutes') {
    if (intervalValue === 1) {
      return '* * * * *'
    } else if (intervalValue === 5) {
      return '*/5 * * * *'
    } else if (intervalValue % 5 === 0) {
      return `*/${intervalValue} * * * *`
    } else {
      // For non-standard intervals, use a simple approximation
      return `*/${intervalValue} * * * *`
    }
  } else {
    // Hours
    if (intervalValue === 1) {
      return '0 * * * *'
    } else if (intervalValue === 24) {
      return '0 0 * * *'
    } else {
      return `0 */${intervalValue} * * *`
    }
  }
}

function generateCurlCommand(payloadFields: MonitorFormData['payloadFields'], monitorId: string = 'abc123'): string {
  const fields = payloadFields.filter(f => f.name.trim() !== '')
  
  if (fields.length === 0) {
    return `curl -X POST "https://deadmanping.com/api/ping/${monitorId}"`
  }

  const params = fields
    .map(field => {
      // Generate variable name based on field name
      // Special handling for common field names
      let varName = field.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')
      
      // Use more readable variable names for common cases
      if (field.name === 'count') {
        varName = 'COUNT'
      } else if (field.name === 'exit_code') {
        varName = 'EXIT_CODE'
      } else if (field.name === 'file_size') {
        varName = 'FILE_SIZE'
      }
      
      return `${field.name}=$${varName}`
    })
    .join('&')

  return `curl -X POST "https://deadmanping.com/api/ping/${monitorId}?${params}"`
}

function generateScriptExample(payloadFields: MonitorFormData['payloadFields'], monitorId: string = 'abc123'): string {
  const fields = payloadFields.filter(f => f.name.trim() !== '')
  
  // Generate variable assignments
  const varAssignments: string[] = []
  const hasExitCode = fields.some(f => f.name === 'exit_code')
  
  // Main script execution - capture result
  let mainScript = './sync_users_logic.sh'
  let mainScriptWithCapture = mainScript
  
  // Check if we need to capture output for count or other fields
  const needsOutput = fields.some(f => f.name === 'count' || (f.name !== 'exit_code' && f.name !== 'file_size'))
  
  if (needsOutput) {
    mainScriptWithCapture = `users_synced=$(./sync_users_logic.sh)`
  }
  
  fields.forEach(field => {
    const varName = field.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    if (field.name === 'exit_code') {
      // exit_code comes from the main script
      varAssignments.push('EXIT_CODE=$?')
    } else if (field.name === 'count') {
      // Use the captured output
      if (needsOutput) {
        varAssignments.push(`COUNT=$users_synced`)
      } else {
        varAssignments.push(`COUNT=$(./sync_users_logic.sh | wc -l)`)
      }
    } else if (field.name === 'file_size') {
      // Example: check backup file size
      varAssignments.push(`${varName}=$(stat -f%z backup.tar.gz 2>/dev/null || stat -c%s backup.tar.gz 2>/dev/null || echo 0)`)
    } else {
      // Generic variable
      varAssignments.push(`${varName}=$(./get_${field.name}.sh)`)
    }
  })

  // Don't add EXIT_CODE automatically - only if user explicitly adds exit_code field

  const curlCommand = generateCurlCommand(payloadFields, monitorId)

  let script = `#!/bin/bash
${mainScriptWithCapture}`
  
  if (varAssignments.length > 0) {
    script += `\n${varAssignments.join('\n')}`
  }

  script += `\n
# Single ping with data from execution
# Use the monitor ID from your dashboard
# Validation rules are already configured in the dashboard
${curlCommand}`

  return script
}

export function HowItWorksSection() {
  const [formData, setFormData] = useState<MonitorFormData>({
    name: 'Daily Backup',
    scheduleType: 'interval',
    intervalValue: 24,
    intervalUnit: 'hours',
    payloadFields: [
      { id: `field-count-${Date.now()}`, name: 'count', type: 'number', rule: '>=', value: '1', severity: 'error' },
    ],
  })

  const cronExpression = formData.scheduleType === 'cron' && formData.cronExpression
    ? formData.cronExpression
    : generateCronExpression(formData.intervalValue, formData.intervalUnit)
  const monitorId = 'abc123' // Demo monitor ID
  const scriptExample = generateScriptExample(formData.payloadFields, monitorId)
  const scriptName = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'sync_users'

  return (
    <>
      <AnimatedItem delay={100} direction="up" duration={600}>
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 card-hover">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-smooth group-hover:bg-primary/20">
              <span className="text-lg sm:text-xl font-mono font-bold text-primary">1</span>
            </div>
            <div className="flex-grow min-w-0 w-full sm:w-auto">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Create monitor in dashboard</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Set up your first monitor in our dashboard. Define validation rules, set intervals, and configure alerts — all without writing code.
              </p>
              <AnimatedItem delay={200} direction="up" duration={500}>
                <div className="mb-4 sm:mb-6">
                  <MonitorFormDemo onChange={setFormData} />
                </div>
              </AnimatedItem>
              <AnimatedItem delay={300} direction="up" duration={500}>
                <div className="flex justify-end">
                  <CTAButton className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth hover-lift-smooth hover-scale active:scale-95">
                    Create Monitor
                  </CTAButton>
                </div>
              </AnimatedItem>
            </div>
          </div>
        </div>
      </AnimatedItem>

      <AnimatedItem delay={200} direction="up" duration={600}>
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 card-hover">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="bg-primary/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-smooth group-hover:bg-primary/20">
              <span className="text-lg sm:text-xl font-mono font-bold text-primary">2</span>
            </div>
            <div className="flex-grow min-w-0 w-full sm:w-auto">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Add one line at the end of your existing script</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Cron runs your script. Your script executes logic and collects data. At the end of your script — one curl line with data from execution.
              </p>
              
              <AnimatedItem delay={250} direction="up" duration={500}>
                <div className="bg-primary/10 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-sm sm:text-base text-muted-foreground font-medium">
                    <span className="text-primary font-semibold">Important:</span> Curl must be <span className="font-semibold">INSIDE</span> the script, not in the cron line, because only in the script do you have access to variables from execution results.
                  </p>
                </div>
              </AnimatedItem>

              <AnimatedItem delay={300} direction="up" duration={500}>
                <div className="bg-background border border-border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-mono">{scriptName}.sh</p>
                  </div>
                  <CodeBlock
                    code={scriptExample}
                    language="bash"
                  />
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                      <span className="text-muted-foreground/60"># In crontab:</span> <span className="text-foreground">{cronExpression} /path/to/{scriptName}.sh</span>
                    </p>
                  </div>
                </div>
              </AnimatedItem>
            </div>
          </div>
        </div>
      </AnimatedItem>
    </>
  )
}
