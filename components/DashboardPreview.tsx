'use client'

import { StatusHealthyIcon, StatusLateIcon, StatusFailedIcon, StatusPendingIcon } from './Icons'

const mockMonitors = [
  { name: 'Daily Backup', status: 'healthy', interval: '24h', lastPing: '2h ago' },
  { name: 'Database Sync', status: 'healthy', interval: '1h', lastPing: '15m ago' },
  { name: 'Report Generator', status: 'late', interval: '6h', lastPing: '7h ago' },
  { name: 'Health Check', status: 'failed', interval: '5m', lastPing: '2h ago' },
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <StatusHealthyIcon className="w-4 h-4" />
    case 'late':
      return <StatusLateIcon className="w-4 h-4" />
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
    case 'failed':
      return 'bg-error/10 text-error border-error/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export function DashboardPreview() {
  return (
    <div className="max-w-5xl mx-auto px-4">
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
            <span className="text-xs sm:text-sm text-muted-foreground">4 monitors</span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {mockMonitors.map((monitor, index) => (
            <div
              key={index}
              className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-accent/50 transition-smooth animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`p-1.5 sm:p-2 rounded-lg border flex-shrink-0 ${getStatusColor(monitor.status)}`}>
                    {getStatusIcon(monitor.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base truncate">{monitor.name}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Expected every {monitor.interval}</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block flex-shrink-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Last ping</p>
                  <p className="text-xs sm:text-sm font-mono">{monitor.lastPing}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

