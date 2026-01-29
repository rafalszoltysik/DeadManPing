'use client'

import React, { useState, useCallback } from 'react'
import { InfoTooltip } from './Tooltip'
import { InfoIcon, EyeIcon, EyeOffIcon } from './Icons'
import { validatePassword } from '@/lib/password-validator'
import { getErrorMessage } from '@/lib/error-utils'

interface PasswordSettingsProps {
  hasPassword: boolean
  onPasswordAdded?: () => void
  onPasswordChanged?: () => void
}

export const PasswordSettings = React.memo(function PasswordSettings({
  hasPassword: initialHasPassword,
  onPasswordAdded,
  onPasswordChanged,
}: PasswordSettingsProps) {
  const [hasPassword, setHasPassword] = useState<boolean>(initialHasPassword)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePasswordChange = useCallback((newPassword: string) => {
    setPassword(newPassword)
    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      setPasswordErrors(validation.errors)
    } else {
      setPasswordErrors([])
    }
  }, [])

  const handleAddPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setError(null)
    setSuccess(false)

    if (!password) {
      setError('Password is required')
      setPasswordLoading(false)
      return
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match')
      setPasswordLoading(false)
      return
    }

    const validation = validatePassword(password)
    if (!validation.valid) {
      setError(validation.errors.join('. '))
      setPasswordLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/add-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add password')
      }

      setSuccess(true)
      setPassword('')
      setPasswordConfirm('')
      setPasswordErrors([])
      setHasPassword(true)
      onPasswordAdded?.()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setPasswordLoading(false)
    }
  }, [password, passwordConfirm, onPasswordAdded])

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setChangePasswordLoading(true)
    setError(null)
    setSuccess(false)

    if (!currentPassword) {
      setError('Current password is required')
      setChangePasswordLoading(false)
      return
    }

    if (!password) {
      setError('New password is required')
      setChangePasswordLoading(false)
      return
    }

    if (password !== passwordConfirm) {
      setError('New passwords do not match')
      setChangePasswordLoading(false)
      return
    }

    if (currentPassword === password) {
      setError('New password must be different from current password')
      setChangePasswordLoading(false)
      return
    }

    const validation = validatePassword(password)
    if (!validation.valid) {
      setError(validation.errors.join('. '))
      setChangePasswordLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword,
          newPassword: password 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccess(true)
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirm('')
      setPasswordErrors([])
      setShowChangePassword(false)
      onPasswordChanged?.()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setChangePasswordLoading(false)
    }
  }, [currentPassword, password, passwordConfirm, onPasswordChanged])

  const handleCancel = useCallback(() => {
    setShowChangePassword(false)
    setCurrentPassword('')
    setPassword('')
    setPasswordConfirm('')
    setPasswordErrors([])
    setError(null)
    setSuccess(false)
  }, [])

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Password</h3>
      {hasPassword ? (
        <div>
          {!showChangePassword ? (
            <p className="text-sm text-muted-foreground">
              You have a password set. You can sign in with your email and password.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-3">
                Enter your current password and new password.
              </p>
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 pr-10 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth active:scale-90"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="changePassword" className="flex items-center gap-2 text-sm font-medium mb-2">
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
                    id="changePassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 pr-10 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth active:scale-90"
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
                <label htmlFor="changePasswordConfirm" className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="changePasswordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 pr-10 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth active:scale-90"
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
              {error && (
                <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  Password changed successfully.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            Add a password to sign in with your email and password.
          </p>
          <div>
            <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium mb-2">
              Add Password
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 pr-10 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
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
                type={showPasswordConfirm ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3 py-2 pr-10 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
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
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
              Password added successfully. You can now sign in with your email and password.
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-4 space-y-2">
        {hasPassword && !showChangePassword && (
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-smooth border border-border active:scale-95 hover:border-primary/20 hover:shadow-sm"
          >
            Change Password
          </button>
        )}

        {hasPassword && showChangePassword && (
          <form onSubmit={handleChangePassword} noValidate>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-3 sm:px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth active:scale-95 hover:border-primary/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changePasswordLoading || passwordErrors.length > 0 || !currentPassword || !password || password !== passwordConfirm}
                className="flex-1 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-lift active:scale-95"
              >
                {changePasswordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}

        {!hasPassword && (
          <form onSubmit={handleAddPassword} noValidate>
            <button
              type="submit"
              disabled={passwordLoading || passwordErrors.length > 0 || !password || password !== passwordConfirm}
              className="w-full px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-lift active:scale-95"
            >
              {passwordLoading ? 'Adding Password...' : 'Add Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
})

