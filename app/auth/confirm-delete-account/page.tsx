/**
 * Account deletion confirmation page with token validation.
 * 
 * Client component that validates deletion token from email link and allows
 * users to confirm account deletion. Includes deletion reason collection for
 * feedback. Validates token, shows confirmation steps, and executes deletion.
 * Used after user clicks deletion link from email.
 * 
 * Does not send deletion emails - see request-delete-account API for that.
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageNav } from '@/components/PageNav'

/**
 * Renders account deletion confirmation form with token validation.
 * 
 * Validates token from URL, collects deletion reason, and executes deletion.
 * Side effects: API calls, account deletion, subscription cancellation.
 */
function ConfirmDeleteAccountForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [deleteReason, setDeleteReason] = useState<string>('')
  const [customReason, setCustomReason] = useState<string>('')
  const [understood, setUnderstood] = useState(false)
  const [showFinalConfirm, setShowFinalConfirm] = useState(false)
  const token = searchParams.get('token')

  const deleteReasons = [
    { value: 'too_expensive', label: 'Too expensive' },
    { value: 'not_using', label: 'Not using the service anymore' },
    { value: 'found_alternative', label: 'Found a better alternative' },
    { value: 'missing_features', label: 'Missing features I need' },
    { value: 'too_complicated', label: 'Too complicated to use' },
    { value: 'privacy_concerns', label: 'Privacy concerns' },
    { value: 'technical_issues', label: 'Technical issues' },
    { value: 'other', label: 'Other reason' },
  ]

  useEffect(() => {
    if (!token) {
      setError('Invalid deletion link. Please request a new deletion email from your account settings.')
    }
  }, [token])

  const handleContinue = () => {
    if (!deleteReason) {
      setError('Please select a reason for deleting your account')
      return
    }
    if (deleteReason === 'other' && !customReason.trim()) {
      setError('Please provide a reason')
      return
    }
    if (!understood) {
      setError('Please confirm that you understand the consequences')
      return
    }
    setError(null)
    setShowFinalConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!token) {
      setError('Invalid deletion link')
      return
    }

    if (!confirm('Are you absolutely sure? This is your last chance. Your account will be permanently deleted and cannot be recovered.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/confirm-delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          reason: deleteReason === 'other' ? customReason : deleteReason
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      setSuccess(true)
      
      // Redirect to home page after 3 seconds
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen text-foreground relative">
        <PageNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
          <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm">
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
              <p className="font-medium">Invalid deletion link</p>
              <p className="text-sm mt-1">
                Please request a new deletion email from your account settings.
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              className="block w-full text-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-smooth"
            >
              Go to Settings
            </Link>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-error">
              Confirm Account Deletion
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              This action cannot be undone
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
                <p className="font-medium mb-1">Account deleted successfully</p>
                <p className="text-sm">
                  Your account and all associated data have been permanently deleted. You will be redirected to the home page shortly.
                </p>
              </div>
            </div>
          ) : showFinalConfirm ? (
            <div className="space-y-4">
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <p className="text-sm font-medium text-error mb-2">
                  Final Confirmation Required
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  You are about to permanently delete your account. This action cannot be undone.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>What will be deleted:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4 list-disc list-inside">
                  <li>All your monitors and ping history</li>
                  <li>All alerts and notifications</li>
                  <li>Your account data and settings</li>
                  <li>Your subscription will be canceled immediately</li>
                </ul>
              </div>

              {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-error text-error-foreground rounded-lg text-sm font-medium hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
                >
                  {loading ? 'Deleting Account...' : 'Yes, Permanently Delete My Account'}
                </button>
                <button
                  onClick={() => setShowFinalConfirm(false)}
                  className="w-full py-2.5 px-4 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Reasons to stay */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-medium text-primary mb-3">
                  Before you go, consider staying...
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Reliable monitoring:</strong> Get instant alerts when your cron jobs fail</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Peace of mind:</strong> Never worry about missed scheduled tasks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Easy setup:</strong> Get started in minutes with simple webhook integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span><strong>Free tier available:</strong> Monitor up to 5 jobs for free</span>
                  </li>
                </ul>
                <Link
                  href="/dashboard"
                  className="mt-4 inline-block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth"
                >
                  Keep My Account
                </Link>
              </div>

              {/* Delete reason form */}
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <p className="text-sm font-medium text-error mb-3">
                  If you still want to delete your account
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Help us improve by telling us why you're leaving:
                </p>
                
                <div className="space-y-2 mb-4">
                  {deleteReasons.map((reason) => (
                    <label key={reason.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteReason"
                        value={reason.value}
                        checked={deleteReason === reason.value}
                        onChange={(e) => {
                          setDeleteReason(e.target.value)
                          setError(null)
                        }}
                        className="w-4 h-4 text-error focus:ring-error"
                      />
                      <span className="text-sm text-muted-foreground">{reason.label}</span>
                    </label>
                  ))}
                </div>

                {deleteReason === 'other' && (
                  <div className="mb-4">
                    <textarea
                      value={customReason}
                      onChange={(e) => {
                        setCustomReason(e.target.value)
                        setError(null)
                      }}
                      placeholder="Please tell us more..."
                      rows={3}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent transition-smooth text-sm"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={understood}
                      onChange={(e) => {
                        setUnderstood(e.target.checked)
                        setError(null)
                      }}
                      className="mt-1 w-4 h-4 text-error focus:ring-error"
                    />
                    <span className="text-sm text-muted-foreground">
                      I understand that deleting my account will permanently delete all my data and cannot be undone.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleContinue}
                  disabled={!deleteReason || (deleteReason === 'other' && !customReason.trim()) || !understood}
                  className="w-full py-2.5 px-4 bg-error text-error-foreground rounded-lg text-sm font-medium hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
                >
                  Continue to Final Confirmation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConfirmDeleteAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <ConfirmDeleteAccountForm />
    </Suspense>
  )
}

