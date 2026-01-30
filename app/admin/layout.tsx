import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'
import { AdminNav, AdminMobileNav } from '@/components/AdminNav'
import { isAdmin } from '@/lib/auth/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  // Check if user is admin
  const userIsAdmin = await isAdmin(user.id)

  if (!userIsAdmin) {
    redirect('/dashboard?error=admin_access_required')
  }

  return (
    <div className="min-h-screen text-foreground relative">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col h-full border-r border-border bg-card">
          <Link href="/admin" className="px-6 py-6 border-b border-border flex-shrink-0">
            <span className="font-bold text-2xl whitespace-nowrap">
              <span className="text-foreground">Admin</span>
              <span className="text-primary"> Portal</span>
            </span>
          </Link>
          <AdminNav />
          <div className="px-4 py-[9px] border-t border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/dashboard"
                className="flex-1 text-xs text-center px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 text-foreground transition-smooth"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Top nav for mobile */}
      <nav className="lg:hidden border-b border-border bg-card sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            <Link href="/admin" className="flex items-center flex-shrink-0 min-w-0">
              <span className="font-bold text-lg sm:text-xl whitespace-nowrap">
                <span className="text-foreground">Admin</span>
                <span className="text-primary"> Portal</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80 text-foreground transition-smooth"
              >
                Dashboard
              </Link>
              <LogoutButton variant="compact" />
            </div>
          </div>
        </div>
        <AdminMobileNav />
      </nav>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-grow w-full max-w-[1600px] mx-auto py-4 sm:py-6 sm:px-6 lg:px-8 xl:px-12 px-4">
          {children}
        </main>
        <footer className="mt-auto border-t border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} DeadManPing Admin Portal. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  User Dashboard
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}


