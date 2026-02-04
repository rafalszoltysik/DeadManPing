/**
 * Support contact form component.
 * 
 * Allows users to send support messages via email. Validates form input,
 * applies rate limiting, and sends messages through Resend API. Used in
 * settings page for user support requests. Memoized for performance.
 * 
 * Does not handle support ticket management - only sends emails.
 */

'use client'

import React, { useState, useCallback } from 'react'
import { getErrorMessage } from '@/lib/error-utils'

interface SupportFormProps {
  email: string
}

/**
 * Renders support contact form with validation and rate limiting.
 * 
 * Handles form submission, validates input, and sends support email.
 * Side effects: API calls, email sending via Resend.
 * 
 * @param email - User's email address (pre-filled)
 */
export const SupportForm = React.memo(function SupportForm({ email }: SupportFormProps) {
  const [supportSubject, setSupportSubject] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportLoading, setSupportLoading] = useState(false)
  const [supportError, setSupportError] = useState<string | null>(null)
  const [supportSuccess, setSupportSuccess] = useState(false)

  const handleSupportSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSupportLoading(true)
    setSupportError(null)
    setSupportSuccess(false)

    if (!supportSubject.trim()) {
      setSupportError('Subject is required')
      setSupportLoading(false)
      return
    }

    if (!supportMessage.trim()) {
      setSupportError('Message is required')
      setSupportLoading(false)
      return
    }

    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: supportSubject.trim(),
          message: supportMessage.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSupportSuccess(true)
      setSupportSubject('')
      setSupportMessage('')
      
      // Clear success message after 5 seconds
      setTimeout(() => setSupportSuccess(false), 5000)
    } catch (err: unknown) {
      setSupportError(getErrorMessage(err))
    } finally {
      setSupportLoading(false)
    }
  }, [supportSubject, supportMessage])

  return (
    <div id="support" className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 card-hover">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contact Support</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Have a question or need help? Send us a message and we'll get back to you as soon as possible.
      </p>
      <form onSubmit={handleSupportSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="supportSubject" className="block text-sm font-medium mb-2">
            Subject
          </label>
          <input
            id="supportSubject"
            type="text"
            value={supportSubject}
            onChange={(e) => setSupportSubject(e.target.value)}
            placeholder="What can we help you with?"
            maxLength={200}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
          />
        </div>

        <div>
          <label htmlFor="supportMessage" className="block text-sm font-medium mb-2">
            Message
          </label>
          <textarea
            id="supportMessage"
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
            placeholder="Please describe your question or issue in detail..."
            rows={6}
            maxLength={5000}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30 resize-y"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {supportMessage.length}/5000 characters
          </p>
        </div>

        {supportError && (
          <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
            {supportError}
          </div>
        )}

        {supportSuccess && (
          <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
            Your message has been sent successfully. We will get back to you soon at {email}.
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="submit"
            disabled={supportLoading || !supportSubject.trim() || !supportMessage.trim()}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-lift active:scale-95"
          >
            {supportLoading ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Your message will be sent to our support inbox. We'll get back to you as soon as possible.
        </p>
      </form>
    </div>
  )
})

