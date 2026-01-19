'use client'

import { useState, useEffect, useRef } from 'react'
import { StatusHealthyIcon, StatusLateIcon, StatusFailedIcon, StatusPendingIcon, WarningIcon } from './Icons'

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
      return 'OK'
    case 'late':
      return 'LATE'
    case 'warn':
      return 'WARN'
    case 'failed':
      return 'ERROR'
    default:
      return 'PENDING'
  }
}

export function DashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const hasStartedAnimation = useRef(false)

  useEffect(() => {
    if (!containerRef.current || hasStartedAnimation.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStartedAnimation.current) {
            hasStartedAnimation.current = true
            
            // Animate items one by one
            mockMonitors.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems(prev => new Set([...prev, index]))
              }, index * 300)
            })

            // Unobserve after animation starts
            setTimeout(() => {
              if (containerRef.current) {
                observer.unobserve(containerRef.current)
              }
            }, mockMonitors.length * 300 + 100)
          }
        })
      },
      { threshold: 0.1, rootMargin: '-200px' }
    )

    const currentContainerRef = containerRef.current
    observer.observe(currentContainerRef)

    return () => {
      if (currentContainerRef) {
        observer.unobserve(currentContainerRef)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Monitor Everything in One Place</h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Real-time status updates and instant alerts for all your cron jobs
        </p>
      </div>
      <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-xl">
        <div className="bg-muted/50 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm sm:text-base">Active Monitors</h3>
            <span className="text-xs sm:text-sm text-muted-foreground">{mockMonitors.length} monitors</span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {mockMonitors.map((monitor, index) => {
            const isVisible = visibleItems.has(index)
            return (
              <div
                key={index}
                className={`px-4 sm:px-6 py-3 sm:py-4 hover:bg-accent/50 transition-all duration-1200 ease-out ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}
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
        </div>
      </div>
    </div>
  )
}

