/**
 * Contact form component for support requests.
 * 
 * Handles contact form submission with email, subject, and message fields.
 * Supports both authenticated and public users, includes honeypot spam
 * protection, and sends messages via Resend API. Used on contact page.
 * 
 * Does not handle support ticket management - only sends emails.
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/**
 * Renders contact form with spam protection and user email detection.
 * 
 * Fetches user email if authenticated, validates form, and sends support
 * message. Side effects: API calls, email sending via Resend.
 */
export function ContactForm() {
  const [email, setEmail] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('') // Honeypot field for spam protection
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const isLoggedIn = !!userEmail

  // Fetch user email client-side after mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch('/api/user/email')
        if (response.ok) {
          const data = await response.json()
          if (data.email) {
            setUserEmail(data.email)
          }
        }
      } catch (err) {
        // Silently fail - user can still use the form
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUserEmail()
  }, [])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return false
    }
    
    // Additional validation: check for suspicious patterns
    const suspiciousPatterns = [
      /^.{0,2}@/, // Very short local part
      /@.{0,2}\./, // Very short domain
      /\.{2,}/, // Multiple consecutive dots
      /[^\w.@-]/, // Invalid characters
    ]
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(email)) {
        return false
      }
    }
    
    // Check email length (reasonable limit)
    if (email.length > 254) {
      return false
    }
    
    // Basic validation - don't block disposable emails as they might be legitimate
    // Rate limiting will handle abuse
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      // Silently fail - don't reveal it's a honeypot
      return
    }

    // Validate email if user is not logged in
    if (!isLoggedIn) {
      if (!email.trim()) {
        setError('Email address is required')
        return
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address')
        return
      }
    }

    if (!subject.trim()) {
      setError('Subject is required')
      return
    }

    if (subject.trim().length < 3) {
      setError('Subject must be at least 3 characters long')
      return
    }

    if (!message.trim()) {
      setError('Message is required')
      return
    }

    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters long')
      return
    }

    if (subject.length > 200) {
      setError('Subject must be less than 200 characters')
      return
    }

    if (message.length > 5000) {
      setError('Message must be less than 5000 characters')
      return
    }

    // Check for spam patterns in message (basic protection)
    const urlPattern = /(http|https|www\.)/gi
    const urlMatches = message.match(urlPattern)
    if (urlMatches && urlMatches.length > 3) {
      setError('Your message contains too many links. Please limit links in your message or contact us directly.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: isLoggedIn ? undefined : email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSuccess(true)
      setSubject('')
      setMessage('')
      setHoneypot('')
      if (!isLoggedIn) {
        setEmail('')
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot field - hidden from users but visible to bots */}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <label htmlFor="website">Website (leave blank)</label>
        <input
          type="text"
          id="website"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {!isLoggedIn && !isLoadingUser && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address <span className="text-error">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            maxLength={254}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            We'll use this email to respond to your inquiry.
          </p>
        </div>
      )}

      {isLoggedIn && userEmail && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={userEmail}
            disabled
            className="w-full px-3 py-2 border border-input rounded-lg bg-muted opacity-50 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            We'll respond to your account email address.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-2">
          Subject <span className="text-error">*</span>
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What can we help you with?"
          maxLength={200}
          minLength={3}
          required
          className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {subject.length}/200 characters (minimum 3)
        </p>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message <span className="text-error">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please describe your question or issue in detail..."
          rows={6}
          maxLength={5000}
          minLength={10}
          required
          className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30 resize-y"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {message.length}/5000 characters (minimum 10)
        </p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm animate-fade-in">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm animate-fade-in">
          Your message has been sent successfully. We will get back to you soon{isLoggedIn && userEmail ? ` at ${userEmail}` : email ? ` at ${email}` : ''}.
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <button
          type="submit"
          disabled={loading || isLoadingUser || !subject.trim() || !message.trim() || (!isLoggedIn && !email.trim())}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-lift active:scale-95"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Your message will be sent to our support inbox. We'll get back to you as soon as possible.
      </p>

      {isLoggedIn && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            You can also access the contact form from your{' '}
            <Link href="/dashboard/settings#support" className="text-primary hover:underline">
              dashboard settings
            </Link>
            .
          </p>
        </div>
      )}
    </form>
  )
}

