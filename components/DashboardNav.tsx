'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MonitorIcon, SettingsIcon, TeamIcon } from './Icons'

interface DashboardNavProps {
  subscriptionTier?: string
}

export function DashboardNav({ subscriptionTier = 'free' }: DashboardNavProps) {
  const pathname = usePathname()
  
  const isMonitorsActive = pathname === '/dashboard' || pathname.startsWith('/dashboard/monitors')
  const isSettingsActive = pathname === '/dashboard/settings'
  const isTeamActive = pathname === '/dashboard/team'
  const hasTeamAccess = ['pro', 'team'].includes(subscriptionTier)

  return (
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <Link
        href="/dashboard"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
          isMonitorsActive
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <MonitorIcon className="w-5 h-5" />
        Monitors
      </Link>
      <Link
        href="/dashboard/team"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
          isTeamActive
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        } ${!hasTeamAccess ? 'opacity-60' : ''}`}
      >
        <TeamIcon className="w-5 h-5" />
        <span className="flex-1">Team</span>
        {!hasTeamAccess && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Pro/Team</span>
        )}
      </Link>
      <Link
        href="/dashboard/settings"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
          isSettingsActive
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <SettingsIcon className="w-5 h-5" />
        Settings
      </Link>
    </nav>
  )
}

interface DashboardMobileNavProps {
  subscriptionTier?: string
}

export function DashboardMobileNav({ subscriptionTier = 'free' }: DashboardMobileNavProps) {
  const pathname = usePathname()
  
  const isMonitorsActive = pathname === '/dashboard' || pathname.startsWith('/dashboard/monitors')
  const isSettingsActive = pathname === '/dashboard/settings'
  const isTeamActive = pathname === '/dashboard/team'
  const hasTeamAccess = ['pro', 'team'].includes(subscriptionTier)

  return (
    <div className="px-4 pb-3 flex gap-2 border-t border-border">
      <Link
        href="/dashboard"
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-smooth ${
          isMonitorsActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent'
        }`}
      >
        <MonitorIcon className="w-4 h-4" />
        <span>Monitors</span>
      </Link>
      <Link
        href="/dashboard/team"
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-smooth relative ${
          isTeamActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent'
        } ${!hasTeamAccess ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center gap-1.5">
          <TeamIcon className="w-4 h-4" />
          <span>Team</span>
        </div>
        {!hasTeamAccess && (
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded leading-none">Pro/Team</span>
        )}
      </Link>
      <Link
        href="/dashboard/settings"
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-smooth ${
          isSettingsActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent'
        }`}
      >
        <SettingsIcon className="w-4 h-4" />
        <span>Settings</span>
      </Link>
    </div>
  )
}

