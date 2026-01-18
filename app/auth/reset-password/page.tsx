'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageNav } from '@/components/PageNav'
import { validatePassword } from '@/lib/password-validator'
import { InfoTooltip } from '@/components/Tooltip'
import { InfoIcon } from '@/components/Icons'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Supabase redirects with token in hash (#access_token=...&type=recovery)
    // We need to check both query params and hash
    const checkToken = () => {
      // Check query params first
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      
      // Check hash fragment (Supabase uses this for password reset)
      const hash = window.location.hash
      const hashParams = new URLSearchParams(hash.substring(1))
      const hashToken = hashParams.get('access_token')
      const hashType = hashParams.get('type')
      
      // If we have token in hash, Supabase will handle it automatically
      // We just need to verify the user can update password
      if (!token && !hashToken) {
        setError('Invalid or missing reset token. Please request a new password reset link.')
      }
    }
    
    checkToken()
  }, [searchParams])

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
      // First, if we have a hash token, we need to exchange it for a session
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

  // Check for token in URL (query params or hash)
  // Supabase uses hash fragment for password reset: #access_token=...&type=recovery
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  const hashParams = hash ? new URLSearchParams(hash.substring(1)) : null
  const hashToken = hashParams?.get('access_token')
  const hashType = hashParams?.get('type')
  
  // Supabase uses hash fragment for password reset tokens
  const hasToken = !!(token || (hash && hashToken))
  const isRecoveryType = type === 'recovery' || hashType === 'recovery' || (hash && hash.includes('type=recovery'))

  // Show error only if we definitely don't have a token
  // If hash exists, allow form (token will be processed on submit)
  if (!hasToken && !hash) {
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
              <p className="font-medium">✅ Password updated successfully!</p>
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
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="block w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                />
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
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="block w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                />
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

