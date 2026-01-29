'use client'

import React, { useState, useCallback } from 'react'
import { getErrorMessage } from '@/lib/error-utils'

interface DeleteAccountSectionProps {
  email: string
}

export const DeleteAccountSection = React.memo(function DeleteAccountSection({ email }: DeleteAccountSectionProps) {
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false)
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)
  const [deleteAccountSuccess, setDeleteAccountSuccess] = useState(false)

  const handleDeleteAccount = useCallback(async () => {
    if (!confirm('A confirmation email will be sent to your email address. Click the link in the email to complete the account deletion process.')) {
      return
    }

    setDeleteAccountLoading(true)
    setDeleteAccountError(null)
    setDeleteAccountSuccess(false)

    try {
      const response = await fetch('/api/auth/request-delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send deletion email')
      }

      setDeleteAccountSuccess(true)
      setDeleteAccountError(null)
      
      // Clear success message after 5 seconds
      setTimeout(() => setDeleteAccountSuccess(false), 5000)
    } catch (err: unknown) {
      setDeleteAccountError(getErrorMessage(err))
    } finally {
      setDeleteAccountLoading(false)
    }
  }, [])

  return (
    <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 flex flex-col h-full card-hover">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Delete Account</h2>
      <div className="flex-1 flex flex-col">
        <div className="bg-error/10 border border-error/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm font-medium text-error mb-2">
            Warning: This action cannot be undone
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
            Deleting your account will permanently delete all your data, including monitors, pings, and alerts. 
            Your subscription will be canceled immediately.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Process:</strong> Click the button below to receive a confirmation email. You'll need to click the link in the email to complete the deletion.
          </p>
        </div>
        <div className="mt-auto space-y-2 sm:space-y-3">
          {deleteAccountError && (
            <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
              {deleteAccountError}
            </div>
          )}
          {deleteAccountSuccess && (
            <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
              <p className="font-medium mb-1">Deletion email sent</p>
              <p className="text-xs sm:text-sm">
                Please check your email ({email}) and click the confirmation link to delete your account. The link will expire in 24 hours.
              </p>
            </div>
          )}
          <button
            onClick={handleDeleteAccount}
            disabled={deleteAccountLoading || deleteAccountSuccess}
            className="w-full px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground border border-error/20 rounded-lg text-sm font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth active:scale-95 hover:border-error/40 hover:shadow-sm"
          >
            {deleteAccountLoading ? 'Sending Email...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  )
})

