'use client'

import { createPortal } from 'react-dom'
import { getErrorMessage } from '@/lib/error-utils'

interface MonitorDeleteConfirmationProps {
  monitorName: string
  monitorSlug: string
  show: boolean
  deleting: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function MonitorDeleteConfirmation({
  monitorName,
  monitorSlug,
  show,
  deleting,
  error,
  onCancel,
  onConfirm,
}: MonitorDeleteConfirmationProps) {
  if (!show || typeof window === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 backdrop-blur-md flex items-start justify-center z-50 pt-20 sm:pt-24">
      <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-2">Delete Monitor</h2>
        <p className="text-muted-foreground mb-6">
          Are you sure you want to delete "{monitorName}"? This action cannot be undone. All pings and alerts for this monitor will also be deleted.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-error text-error-foreground rounded-lg text-sm font-medium hover:bg-error/90 transition-smooth disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Monitor'}
          </button>
        </div>
        {error && (
          <div className="mt-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

