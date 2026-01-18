'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageNav } from '@/components/PageNav'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirect, setRedirect] = useState('/dashboard')
  const router = useRouter()
  const searchParams = useSearchParams()

  const supabase = createClient()

  useEffect(() => {
    // SECURITY: Remove email and password from URL if present (should never be there)
    const emailParam = searchParams.get('email')
    const passwordParam = searchParams.get('password')
    if (emailParam || passwordParam) {
      console.warn('[SECURITY] Email or password found in URL - removing immediately')
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('email')
      newUrl.searchParams.delete('password')
      window.history.replaceState({}, '', newUrl.toString())
    }

    // Read search params only on client after hydration
    const redirectParam = searchParams.get('redirect')
    if (redirectParam) {
      setRedirect(redirectParam)
    }
    
    // Check for OAuth errors
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam)
    }
    
    // Check for password reset success message
    const passwordReset = searchParams.get('passwordReset')
    if (passwordReset === 'true') {
      // Show success message (you could add a success state for this)
      // For now, we'll just clear any errors
      setError(null)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Use API route to login (will verify password with Supabase and create session)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, redirect }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Login failed')
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  const handleGoogleLogin = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    try {
      // Use NEXT_PUBLIC_APP_URL for production, fallback to window.location.origin for development
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      const redirectTo = `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`
      // Use Supabase Auth OAuth - automatically links accounts with same email
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            prompt: 'select_account', // Always show account selection screen
          },
        },
      })

      if (error) {
        console.error('OAuth error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      // Redirect to Google OAuth URL - immediate redirect with no state updates
      if (data?.url) {
        window.location.href = data.url
        return
      } else {
        setError('Failed to get OAuth URL')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('OAuth exception:', err)
      setError(err.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <PageNav />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center">
              Sign in to DeadManPing
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Or{' '}
              <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80 transition-smooth">
                create a new account
              </Link>
            </p>
          </div>
          <form 
            method="POST" 
            action="#" 
            className="mt-8 space-y-6" 
            onSubmit={(e) => {
              handleLogin(e)
            }} 
            noValidate
          >
            {searchParams.get('passwordReset') === 'true' && (
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
                ✅ Password reset successful! You can now sign in with your new password.
              </div>
            )}
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-smooth"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-smooth"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={(e) => {
                  handleGoogleLogin(e)
                }}
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-border rounded-lg shadow-sm text-sm font-medium bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-smooth"
              >
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={(
      <div className="min-h-screen text-foreground relative">
        <PageNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
          <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    )}>
      <LoginForm />
    </Suspense>
  )
}
