/**
 * Profile settings component for user account management.
 * 
 * Handles Google OAuth account linking and password management. Displays
 * current authentication methods and allows adding password to OAuth accounts
 * or linking Google to email accounts. Integrates with PasswordSettings component.
 * Memoized for performance.
 * 
 * Does not handle email changes - only authentication method management.
 */

'use client'

import React, { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getErrorMessage } from '@/lib/error-utils'
import { PasswordSettings } from './PasswordSettings'

interface ProfileSettingsProps {
  hasGoogleConnection: boolean
  hasPassword: boolean
  onPasswordAdded?: () => void
  onPasswordChanged?: () => void
}

export const ProfileSettings = React.memo(function ProfileSettings({
  hasGoogleConnection: initialHasGoogleConnection,
  hasPassword: initialHasPassword,
  onPasswordAdded,
  onPasswordChanged,
}: ProfileSettingsProps) {
  const [hasGoogleConnection, setHasGoogleConnection] = useState<boolean>(initialHasGoogleConnection)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleLinkGoogle = useCallback(async () => {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      const redirectTo = `${appUrl}/auth/callback?redirect=${encodeURIComponent('/dashboard/settings')}`
      
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'online',
            prompt: 'select_account', // Always show account selection screen
          },
        },
      })

      if (oauthError) {
        setError(oauthError.message)
        return
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    }
  }, [supabase])

  return (
    <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 flex flex-col h-full card-hover">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Account Connection</h2>
      
      <div className="space-y-4 sm:space-y-6 flex-1">
        {/* Google Connection */}
        <div>
          <h3 className="text-sm font-medium mb-2">Google Account</h3>
          {hasGoogleConnection ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your account is connected to Google. You can sign in with Google.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Link your Google account to sign in with Google.
              </p>
            </div>
          )}
        </div>

        {/* Password Section */}
        <PasswordSettings
          hasPassword={initialHasPassword}
          onPasswordAdded={onPasswordAdded}
          onPasswordChanged={onPasswordChanged}
        />
      </div>

      {/* Buttons at the bottom */}
      <div className="mt-auto pt-3 sm:pt-4 space-y-2">
        {/* Google Account Button */}
        {!hasGoogleConnection && (
          <button
            onClick={handleLinkGoogle}
            className="w-full px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-smooth border border-border active:scale-95 hover:border-primary/20 hover:shadow-sm"
          >
            Link Google Account
          </button>
        )}

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
})

