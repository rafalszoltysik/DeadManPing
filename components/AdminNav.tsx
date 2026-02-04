/**
 * Admin dashboard sidebar navigation component.
 * 
 * Renders navigation links for admin sections (dashboard, users, monitors,
 * workspaces, subscriptions). Highlights active route based on pathname.
 * Used in admin layout sidebar. Requires admin authentication.
 * 
 * Does not handle routing - only displays navigation links.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MonitorIcon, SettingsIcon, TeamIcon } from './Icons'

/**
 * Renders admin navigation sidebar.
 * 
 * @returns Admin navigation component with active route highlighting
 */
export function AdminNav() {
  const pathname = usePathname()
  
  const isDashboardActive = pathname === '/admin' || pathname === '/admin/'
  const isUsersActive = pathname.startsWith('/admin/users')
  const isMonitorsActive = pathname.startsWith('/admin/monitors')
  const isWorkspacesActive = pathname.startsWith('/admin/workspaces')
  const isSubscriptionsActive = pathname.startsWith('/admin/subscriptions')

  return (
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <Link
        href="/admin"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
          isDashboardActive
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Dashboard
      </Link>
      <Link
        href="/admin/users"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
          isUsersActive
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <TeamIcon className="w-5 h-5" />
        Users
      </Link>
      <Link
        href="/admin/monitors"
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
        href="/admin/workspaces"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
          isWorkspacesActive
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <TeamIcon className="w-5 h-5" />
        Workspaces
      </Link>
      <Link
        href="/admin/subscriptions"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
          isSubscriptionsActive
            ? 'bg-primary/10 text-primary hover:bg-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Subscriptions
      </Link>
    </nav>
  )
}

interface AdminMobileNavProps {}

export function AdminMobileNav({}: AdminMobileNavProps) {
  const pathname = usePathname()
  
  const isDashboardActive = pathname === '/admin' || pathname === '/admin/'
  const isUsersActive = pathname.startsWith('/admin/users')
  const isMonitorsActive = pathname.startsWith('/admin/monitors')
  const isWorkspacesActive = pathname.startsWith('/admin/workspaces')
  const isSubscriptionsActive = pathname.startsWith('/admin/subscriptions')

  return (
    <div className="px-4 pb-3 flex gap-2 border-t border-border">
      <Link
        href="/admin"
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-smooth ${
          isDashboardActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Dashboard</span>
      </Link>
      <Link
        href="/admin/users"
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-smooth ${
          isUsersActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent'
        }`}
      >
        <TeamIcon className="w-4 h-4" />
        <span>Users</span>
      </Link>
      <Link
        href="/admin/monitors"
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
        href="/admin/workspaces"
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-smooth ${
          isWorkspacesActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent'
        }`}
      >
        <TeamIcon className="w-4 h-4" />
        <span>Workspaces</span>
      </Link>
      <Link
        href="/admin/subscriptions"
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-smooth ${
          isSubscriptionsActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span>Subs</span>
      </Link>
    </div>
  )
}


