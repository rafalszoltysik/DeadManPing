'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validatePassword } from '@/lib/password-validator'
import { PageNav } from '@/components/PageNav'
import { createClient } from '@/lib/supabase/client'
import { InfoTooltip, WarningTooltip } from '@/components/Tooltip'
import { InfoIcon, WarningIcon } from '@/components/Icons'

export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
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
    setLoading(true)
    setError(null)

    if (!acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to create an account')
      setLoading(false)
      return
    }

    // Validate password strength
    const validation = validatePassword(password)
    if (!validation.valid) {
      setError(validation.errors.join('. '))
      setLoading(false)
      return
    }

    const plan = typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search).get('plan')
      : null
    const redirect = plan ? `/dashboard/billing?plan=${plan}` : '/dashboard'

    // Use API route to signup (will create user with Supabase auth and create JWT session)
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
      setTimeout(() => {
        router.push(redirect)
        router.refresh()
      }, 2000)
    }
  }

  const handleGoogleSignup = async (e?: React.MouseEvent) => {
    // #region agent log
    console.log('[DEBUG] handleGoogleSignup called', { hasEvent: !!e, eventType: e?.type });
    fetch('http://127.0.0.1:7243/ingest/0b50c519-add8-4517-b494-6285eefb8740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/signup/page.tsx:82',message:'handleGoogleSignup called',data:{hasEvent:!!e,eventType:e?.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (e) {
      e.preventDefault()
      e.stopPropagation()
      // #region agent log
      console.log('[DEBUG] Event prevented and stopped', { defaultPrevented: e.defaultPrevented });
      fetch('http://127.0.0.1:7243/ingest/0b50c519-add8-4517-b494-6285eefb8740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/signup/page.tsx:86',message:'Event prevented and stopped',data:{defaultPrevented:e.defaultPrevented},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    }

    try {
      const plan = typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search).get('plan')
        : null
      
      const redirect = plan ? `/dashboard/billing?plan=${plan}` : '/dashboard'
      
      // #region agent log
      const redirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`;
      console.log('[DEBUG] Before signInWithOAuth call', { redirectTo, supabaseInitialized: !!supabase });
      fetch('http://127.0.0.1:7243/ingest/0b50c519-add8-4517-b494-6285eefb8740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/signup/page.tsx:96',message:'Before signInWithOAuth call',data:{redirectTo,supabaseInitialized:!!supabase},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
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

      // #region agent log
      console.log('[DEBUG] After signInWithOAuth call', { hasError: !!error, errorMessage: error?.message, hasData: !!data, hasUrl: !!data?.url, url: data?.url });
      fetch('http://127.0.0.1:7243/ingest/0b50c519-add8-4517-b494-6285eefb8740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/signup/page.tsx:104',message:'After signInWithOAuth call',data:{hasError:!!error,errorMessage:error?.message,hasData:!!data,hasUrl:!!data?.url,url:data?.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      if (error) {
        console.error('OAuth error:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      // Redirect to Google OAuth URL - immediate redirect with no state updates
      if (data?.url) {
        // #region agent log
        console.log('[DEBUG] Before location.href redirect', { url: data.url });
        fetch('http://127.0.0.1:7243/ingest/0b50c519-add8-4517-b494-6285eefb8740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/signup/page.tsx:113',message:'Before location.href redirect',data:{url:data.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        // Use window.location.href directly - most reliable method
        console.log('[DEBUG] Setting location.href to OAuth URL');
        window.location.href = data.url
        // #region agent log
        console.log('[DEBUG] After location.href assignment');
        fetch('http://127.0.0.1:7243/ingest/0b50c519-add8-4517-b494-6285eefb8740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/signup/page.tsx:115',message:'After location.href assignment',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return
      } else {
        console.error('No URL in OAuth response:', data)
        setError('Failed to get OAuth URL')
        setLoading(false)
      }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/0b50c519-add8-4517-b494-6285eefb8740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/signup/page.tsx:120',message:'OAuth exception caught',data:{errorMessage:err?.message,errorStack:err?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error('OAuth exception:', err)
      setError(err.message || 'Failed to sign up with Google')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen text-foreground relative">
        <PageNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full space-y-8 p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Account created!</h2>
              <p className="mt-2 text-muted-foreground">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <PageNav />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
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
          <form 
            method="POST" 
            action="#" 
            className="mt-8 space-y-6" 
            onSubmit={(e) => {
              // #region agent log
              console.log('[DEBUG] Form onSubmit fired', { method: e.currentTarget.method, action: e.currentTarget.action });
              fetch('http://127.0.0.1:7243/ingest/0b50c519-add8-4517-b494-6285eefb8740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/signup/page.tsx:189',message:'Form onSubmit fired',data:{method:e.currentTarget.method,action:e.currentTarget.action},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              handleSignup(e)
            }} 
            noValidate
          >
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
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`block w-full px-3 py-2 bg-background border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth ${
                    passwordErrors.length > 0 && password.length > 0 ? 'border-error' : 'border-input'
                  }`}
                />
                {passwordErrors.length > 0 && password.length > 0 && (
                  <ul className="mt-2 text-sm text-error list-disc list-inside">
                    {passwordErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-muted-foreground">
                I agree to the{' '}
                <Link href="/legal/terms" target="_blank" className="text-primary hover:text-primary/80 underline transition-smooth">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/legal/privacy" target="_blank" className="text-primary hover:text-primary/80 underline transition-smooth">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-smooth"
              >
                {loading ? 'Creating account...' : 'Create account'}
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
                  // #region agent log
                  console.log('[DEBUG] Google button clicked', { eventType: e.type, buttonType: 'button', isInsideForm: false });
                  fetch('http://127.0.0.1:7243/ingest/0b50c519-add8-4517-b494-6285eefb8740',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/auth/signup/page.tsx:294',message:'Button onClick fired',data:{eventType:e.type,buttonType:'button',isInsideForm:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                  // #endregion
                  handleGoogleSignup(e)
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
