'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageNav } from '@/components/PageNav'
import { EyeIcon, EyeOffIcon } from '@/components/Icons'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [showResendForm, setShowResendForm] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
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
      if (errorParam === 'verification_link_expired') {
        setError('The email verification link has expired. Please request a new verification email below.')
        setShowResendForm(true)
      } else {
        // Decode error message if it's URL encoded
        try {
          setError(decodeURIComponent(errorParam))
        } catch {
          setError(errorParam)
        }
      }
    }
    
    // Check for resend verification action
    const action = searchParams.get('action')
    if (action === 'resend_verification') {
      setShowResendForm(true)
      if (errorParam !== 'verification_link_expired') {
        setError('The verification link has expired. Please request a new one.')
      }
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

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setResendLoading(true)
    setError(null)
    setSuccess(null)

    if (!resendEmail) {
      setError('Please enter your email address')
      setResendLoading(false)
      return
    }

    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resendEmail }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Failed to resend verification email')
    } else {
      setSuccess(data.message || 'If an account with this email exists and needs verification, a new verification link has been sent.')
      setResendEmail('')
    }

    setResendLoading(false)
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
                Password reset successful. You can now sign in with your new password.
              </div>
            )}
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
                {success}
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
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 pr-10 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
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

          {showResendForm && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium">Resend verification email</p>
              <form onSubmit={handleResendVerification} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="block w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth"
                  >
                    {resendLoading ? 'Sending...' : 'Send verification email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResendForm(false)
                      setResendEmail('')
                      setError(null)
                      setSuccess(null)
                    }}
                    className="py-2 px-4 bg-background border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

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
