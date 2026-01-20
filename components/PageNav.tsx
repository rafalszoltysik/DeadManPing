'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Logo } from './Logo'
import { createClient } from '@/lib/supabase/client'

export function PageNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Check initial session state
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsLoggedIn(!!session)
      } catch (error) {
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center flex-shrink-0 min-w-0">
            <Link href="/" className="hover:opacity-80 transition-smooth flex-shrink-0">
              <Logo showText={true} variant="with-text" className="text-lg sm:text-xl" />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/docs"
              className="hidden sm:inline-block text-muted-foreground hover:text-foreground px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-smooth"
            >
              Docs
            </Link>
            {!loading && (
              <>
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-foreground px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-smooth"
                  >
                    <span className="hidden sm:inline">Profile</span>
                    <span className="sm:hidden">Profile</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-muted-foreground hover:text-foreground px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-smooth"
                    >
                      <span className="hidden sm:inline">Sign In</span>
                      <span className="sm:hidden">Login</span>
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-smooth hover-lift"
                    >
                      <span className="hidden sm:inline">Start Free Trial</span>
                      <span className="sm:hidden">Start</span>
                    </Link>
                  </>
                )}
              </>
            )}
            {/* Theme toggle removed - dark mode is locked */}
          </div>
        </div>
      </div>
    </nav>
  )
}

