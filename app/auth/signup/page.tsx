'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validatePassword } from '@/lib/password-validator'
import { PageNav } from '@/components/PageNav'
import { createClient } from '@/lib/supabase/client'
import { InfoTooltip, WarningTooltip } from '@/components/Tooltip'
import { InfoIcon, WarningIcon, EyeIcon, EyeOffIcon } from '@/components/Icons'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      setSupabase(createClient())
    } catch (err) {
      setError('Failed to initialize client')
    }
    setMounted(true)
    
    // SECURITY: Remove email and password from URL if present (should never be there)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const emailParam = urlParams.get('email')
      const passwordParam = urlParams.get('password')
      if (emailParam || passwordParam) {
        console.warn('[SECURITY] Email or password found in URL - removing immediately')
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('email')
        newUrl.searchParams.delete('password')
        window.history.replaceState({}, '', newUrl.toString())
      }
    }
  }, [])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    
    // Real-time validation
    const validation = validatePassword(newPassword)
    setPasswordErrors(validation.errors)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setError('Client not initialized')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)


    // Validate password strength
    const validation = validatePassword(password)
    if (!validation.valid) {
      setError(validation.errors.join('. '))
      setLoading(false)
      return
    }

    // Track signup started (email method)
    const { captureSignupStarted } = await import('@/lib/posthog/client')
    captureSignupStarted({ method: 'email' })

    const plan = typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search).get('plan')
      : null
    const redirect = plan ? `/dashboard/billing?plan=${plan}` : '/dashboard'

    // Use API route to signup (will create user with Supabase auth and create session)
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, redirect }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Signup failed')
      setLoading(false)
    } else {
      setSuccess(true)
      setRequiresEmailConfirmation(data.requiresEmailConfirmation || false)
      setUserEmail(data.email || null)
      
      // Only redirect if we have a session (email confirmed or auto-confirm enabled)
      if (!data.requiresEmailConfirmation && data.redirect) {
        // Refresh the Supabase session to ensure cookies are loaded
        try {
          await supabase.auth.getSession()
        } catch (err) {
          console.error('Error refreshing session:', err)
        }
        
        // Use window.location for full page reload to ensure cookies are available
        setTimeout(() => {
          window.location.href = data.redirect
        }, 1500)
      }
    }
  }

  const handleGoogleSignup = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Track signup started (google method)
    const { captureSignupStarted } = await import('@/lib/posthog/client')
    captureSignupStarted({ method: 'google' })

    try {
      const plan = typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('plan')
        : null
      
      const redirect = plan ? `/dashboard/billing?plan=${plan}` : '/dashboard'
      // Use NEXT_PUBLIC_APP_URL for production, fallback to window.location.origin for development
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      const redirectTo = `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`
      
      // Use Supabase Auth OAuth - automatically links accounts with same email
      if (!supabase) {
        setError('Client not initialized')
        return
      }
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
      setError(err.message || 'Failed to sign up with Google')
      setLoading(false)
    }
  }

  if (success) {
    if (requiresEmailConfirmation) {
      return (
        <div className="min-h-screen text-foreground relative">
          <PageNav />
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
            <AnimatedSection className="max-w-md w-full space-y-6 p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm hover-lift-smooth" delay={0} direction="up" duration={800}>
              <AnimatedItem delay={100} direction="up" duration={700}>
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4 animate-pulse-glow">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">Check your email</h2>
                  <p className="mt-2 text-muted-foreground">
                    We've sent a confirmation link to{' '}
                    <span className="font-semibold text-foreground">{userEmail || 'your email address'}</span>
                  </p>
                </div>
              </AnimatedItem>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Next steps:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Check your inbox (and spam folder)</li>
                  <li>Click the confirmation link in the email</li>
                  <li>You'll be automatically signed in</li>
                </ol>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setRequiresEmailConfirmation(false)
                      setUserEmail(null)
                      setLoading(false)
                    }}
                    className="text-primary hover:text-primary/80 font-medium underline"
                  >
                    Try again
                  </button>
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      )
    }
    
    return (
      <div className="min-h-screen text-foreground relative">
        <PageNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <AnimatedSection className="max-w-md w-full space-y-8 p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm hover-lift-smooth" delay={0} direction="up" duration={800}>
            <AnimatedItem delay={100} direction="up" duration={700}>
              <div className="text-center">
                <h2 className="text-2xl font-bold">Account created!</h2>
                <p className="mt-2 text-muted-foreground">Redirecting to dashboard...</p>
              </div>
            </AnimatedItem>
          </AnimatedSection>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <PageNav />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <AnimatedSection className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm hover-lift-smooth" delay={0} direction="up" duration={800}>
          <AnimatedItem delay={100} direction="up" duration={700}>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-center">
                Create your account
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Or{' '}
                <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80 transition-smooth">
                  sign in to existing account
                </Link>
              </p>
            </div>
          </AnimatedItem>
          <AnimatedItem delay={200} direction="up" duration={700}>
            <form 
              method="POST" 
              action="#" 
              className="mt-8 space-y-6" 
              onSubmit={(e) => {
                handleSignup(e)
              }} 
              noValidate
            >
              {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg animate-scale-in">
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
                <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium mb-2">
                  Password
                  <InfoTooltip 
                    content={
                      <div className="space-y-1">
                        <p className="font-semibold mb-1">Password requirements:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-xs">
                          <li>At least 8 characters</li>
                          <li>One uppercase letter</li>
                          <li>One lowercase letter</li>
                          <li>One number</li>
                          <li>One special character</li>
                        </ul>
                      </div>
                    }
                    position="right"
                  >
                    <button type="button" className="text-muted-foreground hover:text-foreground transition-smooth">
                      <InfoIcon className="w-4 h-4" />
                    </button>
                  </InfoTooltip>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={handlePasswordChange}
                    className={`block w-full px-3 py-2 pr-10 bg-background border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth ${
                      passwordErrors.length > 0 && password.length > 0 ? 'border-error' : 'border-input'
                    }`}
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
                {passwordErrors.length > 0 && password.length > 0 && (
                  <ul className="mt-2 text-sm text-error list-disc list-inside">
                    {passwordErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>


              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-smooth hover-lift-smooth hover-scale"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </AnimatedItem>

          <AnimatedItem delay={300} direction="up" duration={700}>
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
                    handleGoogleSignup(e)
                  }}
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-border rounded-lg shadow-sm text-sm font-medium bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-smooth hover-lift-smooth hover-scale"
                >
                  Google
                </button>
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem delay={400} direction="up" duration={700}>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              By creating an account, you agree to our{' '}
              <Link href="/legal/terms" target="_blank" className="text-primary hover:text-primary/80 underline transition-smooth">
                Terms and Conditions
              </Link>
              {' '}and{' '}
              <Link href="/legal/privacy" target="_blank" className="text-primary hover:text-primary/80 underline transition-smooth">
                Privacy Policy
              </Link>
              .
            </p>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </div>
  )
}
