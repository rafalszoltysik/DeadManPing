'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageNav } from '@/components/PageNav'
import { validatePassword } from '@/lib/password-validator'
import { InfoTooltip } from '@/components/Tooltip'
import { InfoIcon, EyeIcon, EyeOffIcon } from '@/components/Icons'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [hasValidToken, setHasValidToken] = useState<boolean | null>(null) // null = not checked yet
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Check for error params in URL (Supabase redirects with errors)
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (errorParam) {
      // Decode error description if present
      const decodedError = errorDescription 
        ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        : 'The password reset link is invalid or has expired.'
      setError(decodedError)
      setHasValidToken(false)
      return
    }

    // Supabase can use different formats for password reset:
    // 1. Hash fragment: #access_token=...&type=recovery (most common)
    // 2. Query param code: ?code=... (needs to be exchanged for session)
    // 3. Query param token: ?token=...&type=recovery (older format)
    const checkToken = async () => {
      // Check query params first
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const code = searchParams.get('code')
      
      // Debug: log what we're checking
      console.log('Reset password check:', {
        hasToken: !!token,
        type,
        hasCode: !!code,
        fullUrl: window.location.href,
        hash: window.location.hash.substring(0, 50) + '...' // Only first 50 chars for security
      })
      
      // Check hash fragment (Supabase typically uses this for password reset)
      // Hash is only available on client side, so we check it here
      const hash = window.location.hash
      let hashParams: URLSearchParams | null = null
      let hashToken: string | null = null
      let hashType: string | null = null
      
      if (hash && hash.length > 1) {
        try {
          hashParams = new URLSearchParams(hash.substring(1))
          hashToken = hashParams.get('access_token')
          hashType = hashParams.get('type')
          console.log('Hash parsed:', { hasHashToken: !!hashToken, hashType })
        } catch (e) {
          console.error('Error parsing hash:', e)
        }
      }
      
      // If we have a code, we have a valid reset link
      // We'll exchange it for a session when user submits the form
      // This prevents issues with URL cleanup and re-renders
      if (code) {
        console.log('Reset code found in URL, allowing password reset form')
        setHasValidToken(true)
        // Don't remove code from URL yet - we'll use it in handleSubmit
        return
      }
      
      // Check if we have a valid token in other formats
      // Hash fragment is the most common format for Supabase password reset
      // Even if type is not explicitly 'recovery', if we have access_token in hash, it's likely a reset token
      const hasHashToken = !!(hashToken)
      const hasQueryToken = !!(token && type === 'recovery')
      const hasAnyHash = !!(hash && hash.length > 1 && hash.includes('access_token')) // Hash with access_token
      
      // If we have hash with access_token, we can proceed (will be processed on submit)
      // If we have query token with recovery type, we can proceed
      if (hasHashToken || hasQueryToken || hasAnyHash) {
        console.log('Valid token found, allowing password reset')
        setHasValidToken(true)
      } else {
        // No valid token found
        console.log('No valid token found')
        setHasValidToken(false)
        setError('Invalid or missing reset token. Please request a new password reset link.')
      }
    }
    
    checkToken()
  }, [searchParams, supabase])

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)
    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      setPasswordErrors(validation.errors)
    } else {
      setPasswordErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!password || !passwordConfirm) {
      setError('Password and confirmation are required')
      setLoading(false)
      return
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const validation = validatePassword(password)
    if (!validation.valid) {
      setError(validation.errors.join('. '))
      setLoading(false)
      return
    }

    try {
      // Check if we already have a session
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      
      if (!existingSession) {
        // Try to get session from code parameter (password reset code)
        const code = searchParams.get('code')
        if (code) {
          console.log('Exchanging code for session in handleSubmit...')
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            setError(exchangeError.message || 'Invalid or expired reset code. Please request a new password reset link.')
            setLoading(false)
            return
          }
          
          if (!data?.session) {
            setError('Failed to create session from reset code. Please request a new password reset link.')
            setLoading(false)
            return
          }
          
          // Clean up URL after successful exchange
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('code')
          window.history.replaceState({}, '', newUrl.toString())
        } else {
          // Try to get it from hash fragment
          // Supabase redirects with token in hash fragment (#access_token=...&type=recovery)
          const hash = window.location.hash
          if (hash) {
            const hashParams = new URLSearchParams(hash.substring(1))
            const accessToken = hashParams.get('access_token')
            const refreshToken = hashParams.get('refresh_token')
            
            if (accessToken && refreshToken) {
              // Exchange the tokens for a session
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              
              if (sessionError) {
                setError('Invalid or expired reset token. Please request a new password reset link.')
                setLoading(false)
                return
              }
              
              // Clear hash from URL after processing
              window.history.replaceState(null, '', window.location.pathname + window.location.search)
            } else {
              // No session and no valid tokens - user needs to request a new reset link
              setError('No active session found. Please request a new password reset link.')
              setLoading(false)
              return
            }
          } else {
            // No session and no hash - user needs to request a new reset link
            setError('No active session found. Please request a new password reset link.')
            setLoading(false)
            return
          }
        }
      }
      
      // Now update the password
      // Supabase requires an active session to update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message || 'Failed to reset password')
        setLoading(false)
      } else {
        setSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login?passwordReset=true')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
      setLoading(false)
    }
  }

  // Show loading state while checking for token (prevents hydration mismatch)
  if (hasValidToken === null) {
    return (
      <div className="min-h-screen text-foreground relative">
        <PageNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
          <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-center">
                Verifying Reset Link
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Please wait while we verify your password reset link...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error if we definitely don't have a token
  if (hasValidToken === false) {
    return (
      <div className="min-h-screen text-foreground relative">
        <PageNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
          <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-center">
                Invalid Reset Link
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
            </div>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <Link
                href="/auth/forgot-password"
                className="block w-full text-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-smooth"
              >
                Request New Reset Link
              </Link>
              <Link
                href="/auth/login"
                className="block w-full text-center py-2.5 px-4 border border-border rounded-lg shadow-sm text-sm font-medium bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-smooth"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen text-foreground relative">
        <PageNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
          <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-center">
                Password Reset Successful
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Your password has been reset. Redirecting to sign in...
              </p>
            </div>
            <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
              <p className="font-medium">Password updated successfully</p>
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
              Set New Password
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium mb-2">
                  New Password
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
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
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
                {passwordErrors.length > 0 && (
                  <ul className="mt-2 text-sm text-error space-y-1">
                    {passwordErrors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="block w-full px-3 py-2 pr-10 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                    aria-label={showPasswordConfirm ? "Hide password" : "Show password"}
                  >
                    {showPasswordConfirm ? (
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
                disabled={loading || passwordErrors.length > 0 || !password || password !== passwordConfirm}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-smooth"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  )
}

