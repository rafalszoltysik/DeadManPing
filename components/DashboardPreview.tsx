/**
 * Dashboard preview component for landing page.
 * 
 * Displays mock monitor data to demonstrate dashboard functionality on landing
 * page. Shows various monitor statuses (healthy, late, failed, warn) with
 * status indicators and call-to-action button. Used for marketing purposes.
 * Memoized for performance.
 * 
 * Does not display real data - only mock preview for marketing.
 */

'use client'

import { memo } from 'react'
import { StatusHealthyIcon, StatusLateIcon, StatusFailedIcon, StatusPendingIcon, WarningIcon } from './Icons'
import { CTAButton } from './CTAButton'
import { AnimatedItem, StaggerContainer } from './AnimatedSection'

const mockMonitors = [
  // OK: Ping przyszedł + payload poprawny
  { name: 'Daily Backup', status: 'healthy', interval: '24h', lastPing: '2h ago', reason: null },
  
  // WARN: Ping przyszedł + payload ma warning (severity 'warn')
  { name: 'Report Generator', status: 'warn', interval: '6h', lastPing: '1h ago', reason: 'count: 45 (expected >= 100)' },
  
  // LATE: Ping spóźniony (ale payload z ostatniego był OK)
  { name: 'Database Sync', status: 'late', interval: '1h', lastPing: '2h ago', reason: 'Ping delayed' },
  
  // ERROR: Ping nie przyszedł (przeszedł grace period)
  { name: 'Health Check', status: 'failed', interval: '5m', lastPing: '25m ago', reason: 'No ping received' },
  
  // ERROR: Ping przyszedł + payload validation failed (error severity)
  { name: 'Data Export', status: 'failed', interval: '12h', lastPing: '3h ago', reason: 'Payload validation failed' },
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <StatusHealthyIcon className="w-4 h-4" />
    case 'late':
      return <StatusLateIcon className="w-4 h-4" />
    case 'warn':
      return <WarningIcon className="w-4 h-4" />
    case 'failed':
      return <StatusFailedIcon className="w-4 h-4" />
    default:
      return <StatusPendingIcon className="w-4 h-4" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'healthy':
      return 'bg-success/10 text-success border-success/20'
    case 'late':
      return 'bg-warning/10 text-warning border-warning/20'
    case 'warn':
      return 'bg-warning/10 text-warning border-warning/20'
    case 'failed':
      return 'bg-error/10 text-error border-error/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'healthy':
      return '✓'
    case 'late':
      return 'LATE'
    case 'warn':
      return 'WARN'
    case 'failed':
      return '✗'
    default:
      return 'PENDING'
  }
}

export const DashboardPreview = memo(function DashboardPreview() {
  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="text-center mb-6 sm:mb-8">
        <AnimatedItem delay={100} direction="up" duration={700}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Monitor Everything in One Place
          </h2>
        </AnimatedItem>
        <AnimatedItem delay={200} direction="up" duration={700}>
          <p className="text-muted-foreground text-base sm:text-lg">
            Real-time status updates and instant alerts for all your cron jobs
          </p>
        </AnimatedItem>
      </div>
      <AnimatedItem delay={300} direction="up" duration={800}>
        <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-xl">
          <div className="bg-muted/50 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm sm:text-base">Active Monitors</h3>
              <CTAButton className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-smooth hover-lift-smooth">
                Add monitor
              </CTAButton>
            </div>
          </div>
          <StaggerContainer className="divide-y divide-border" staggerDelay={60}>
            {mockMonitors.map((monitor, index) => {
              return (
                <div
                  key={index}
                  className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-accent/50 transition-smooth"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`p-1.5 sm:p-2 rounded-lg border flex-shrink-0 ${getStatusColor(monitor.status)}`}>
                      {getStatusIcon(monitor.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm sm:text-base truncate">{monitor.name}</h4>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getStatusColor(monitor.status)}`}>
                          {getStatusLabel(monitor.status)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Expected every {monitor.interval}</p>
                      {monitor.reason && (
                        <p className="text-xs text-muted-foreground/80 mt-1 font-mono">{monitor.reason}</p>
                      )}
                    </div>
                    </div>
                    <div className="text-right hidden sm:block flex-shrink-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Last ping</p>
                      <p className="text-xs sm:text-sm font-mono">{monitor.lastPing}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </StaggerContainer>
        </div>
      </AnimatedItem>
    </div>
  )
})

