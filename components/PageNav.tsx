'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Logo } from './Logo'

export function PageNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
        }
      } catch (error) {
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-smooth">
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
                    href="/dashboard/settings"
                    className="text-muted-foreground hover:text-foreground px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-smooth"
                  >
                    <span className="hidden sm:inline">Profil</span>
                    <span className="sm:hidden">Profil</span>
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

