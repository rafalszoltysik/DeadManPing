'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageNav } from '@/components/PageNav'
import { validatePassword } from '@/lib/password-validator'
import { InfoTooltip } from '@/components/Tooltip'
import { InfoIcon, EyeIcon, EyeOffIcon } from '@/components/Icons'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'

function SetPasswordForm() {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [hasValidToken, setHasValidToken] = useState<boolean | null>(null)
  const [workspaceName, setWorkspaceName] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    try {
      setSupabase(createClient())
    } catch (err) {
      setError('Failed to initialize client')
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      return
    }

    // Check for error params in URL
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (errorParam) {
      const decodedError = errorDescription 
        ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        : 'The invitation link is invalid or has expired.'
      setError(decodedError)
      setHasValidToken(false)
      return
    }

    // Get workspace name from URL if available
    const workspaceNameParam = searchParams.get('workspace_name')
    if (workspaceNameParam) {
      setWorkspaceName(decodeURIComponent(workspaceNameParam))
    }

    // Check for invitation token
    const checkToken = async () => {
      // First, check if user already has a session (Supabase might have already logged them in via callback)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // User already has a session - this is valid for invitation
        // Check if they have a pending invitation
        const workspaceId = searchParams.get('workspace')
        if (workspaceId) {
          setHasValidToken(true)
          return
        }
      }

      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const code = searchParams.get('code')
      
      // Check hash fragment (Supabase typically uses this for invitations when redirecting directly)
      const hash = window.location.hash
      let hashParams: URLSearchParams | null = null
      let hashToken: string | null = null
      let hashType: string | null = null
      
      if (hash && hash.length > 1) {
        try {
          hashParams = new URLSearchParams(hash.substring(1))
          hashToken = hashParams.get('access_token')
          hashType = hashParams.get('type')
        } catch (e) {
          console.error('Error parsing hash:', e)
        }
      }
      
      // Check if we have a valid invitation token
      const hasCode = !!code
      const hasHashToken = !!(hashToken && hashType === 'invite')
      const hasQueryToken = !!(token && type === 'invite')
      const hasAnyHash = !!(hash && hash.length > 1 && hash.includes('access_token'))
      
      if (hasCode || hasHashToken || hasQueryToken || hasAnyHash) {
        setHasValidToken(true)
      } else {
        // If no token found, check if we can find pending invitation by workspace
        // This handles cases where user was already logged in or token expired
        const workspaceId = searchParams.get('workspace')
        if (workspaceId) {
          // Allow user to proceed - they might have a valid session or we'll handle it in submit
          // But show a warning that they should use the invitation link
          setHasValidToken(true)
        } else {
          setHasValidToken(false)
          setError('Invalid or missing invitation token. Please use the invitation link from your email.')
        }
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

    if (!supabase) {
      setError('Client not initialized')
      setLoading(false)
      return
    }

    try {
      // Get workspace ID from URL
      const workspaceId = searchParams.get('workspace')
      
      // Check if we already have a session
      let { data: { session: existingSession } } = await supabase.auth.getSession()
      
      // If no session, try to get it from hash fragment or code
      if (!existingSession) {
        // Try to get session from code parameter
        const code = searchParams.get('code')
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            setError(exchangeError.message || 'Invalid or expired invitation code.')
            setLoading(false)
            return
          }
          
          if (!data?.session) {
            setError('Failed to create session from invitation code.')
            setLoading(false)
            return
          }
          
          // Clean up URL
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('code')
          window.history.replaceState({}, '', newUrl.toString())
        } else {
          // Try to get it from hash fragment
          const hash = window.location.hash
          if (hash) {
            const hashParams = new URLSearchParams(hash.substring(1))
            const accessToken = hashParams.get('access_token')
            const refreshToken = hashParams.get('refresh_token')
            
            if (accessToken && refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              
              if (sessionError) {
                setError('Invalid or expired invitation token.')
                setLoading(false)
                return
              }
              
              // Clear hash from URL
              window.history.replaceState(null, '', window.location.pathname + window.location.search)
            } else {
              setError('No active session found. Please use a valid invitation link.')
              setLoading(false)
              return
            }
          } else {
            setError('No active session found. Please use a valid invitation link.')
            setLoading(false)
            return
          }
        }
      }
      
      // Now update the password
      if (!supabase) {
        setError('Client not initialized')
        setLoading(false)
        return
      }
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message || 'Failed to set password')
        setLoading(false)
        return
      }

      // Get user ID after password is set
      if (!supabase) {
        setError('Client not initialized')
        setLoading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Failed to get user information')
        setLoading(false)
        return
      }

      // Update invitation status to accepted
      if (workspaceId && user.id) {
        try {
          const response = await fetch('/api/workspace/members/accept-invitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspaceId }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to accept invitation:', errorData)
            // Don't fail - password is set, user can access dashboard
            // Auto-accept in dashboard layout will handle it
          }
        } catch (fetchError) {
          console.error('Error calling accept-invitation:', fetchError)
          // Don't fail - password is set, user can access dashboard
        }
      }

      setSuccess(true)
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push('/dashboard?invited=true' + (workspaceName ? `&workspace=${encodeURIComponent(workspaceName)}` : ''))
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to set password')
      setLoading(false)
    }
  }

  // Show loading state while checking for token
  if (hasValidToken === null) {
    return (
      <div className="min-h-screen text-foreground relative">
        <PageNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
          <AnimatedSection className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
            <div className="text-center">Verifying invitation link...</div>
          </AnimatedSection>
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
          <AnimatedSection className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
            <AnimatedItem delay={0} direction="up" duration={700}>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-center">
                  Invalid Invitation Link
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  This invitation link is invalid or has expired.
                </p>
              </div>
            </AnimatedItem>
            {error && (
              <AnimatedItem delay={100} direction="up" duration={700}>
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
                  {error}
                </div>
              </AnimatedItem>
            )}
            <AnimatedItem delay={200} direction="up" duration={700}>
              <Link
                href="/auth/login"
                className="block w-full text-center py-2.5 px-4 border border-border rounded-lg shadow-sm text-sm font-medium bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-smooth"
              >
                Back to Sign In
              </Link>
            </AnimatedItem>
          </AnimatedSection>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen text-foreground relative">
        <PageNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
          <AnimatedSection className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
            <AnimatedItem delay={0} direction="up" duration={700}>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-center">
                  Password Set Successfully
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Redirecting to dashboard...
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={100} direction="up" duration={700}>
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
                <p className="font-medium">Password set successfully. Welcome to the workspace!</p>
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
                Set Your Password
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {workspaceName 
                  ? `You've been invited to join "${workspaceName}". Set your password to get started.`
                  : "You've been invited to join a workspace. Set your password to get started."}
              </p>
            </div>
          </AnimatedItem>

          <AnimatedItem delay={200} direction="up" duration={700}>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg animate-scale-in">
                  {error}
                </div>
              )}

              <div className="space-y-4">
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
                    Confirm Password
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
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-lift-smooth hover-scale"
                >
                  {loading ? 'Setting Password...' : 'Set Password & Join Workspace'}
                </button>
              </div>
            </form>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
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
      <SetPasswordForm />
    </Suspense>
  )
}

