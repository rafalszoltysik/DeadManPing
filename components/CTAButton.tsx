/**
 * Call-to-action button component with authentication-aware routing.
 * 
 * Checks user authentication status and routes to dashboard (if logged in)
 * or signup page (if not). Tracks CTA clicks for analytics. Used throughout
 * marketing pages for primary conversion actions.
 * 
 * Does not handle authentication - only checks session and routes.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { captureCTAClicked } from '@/lib/posthog/client'
import { logger } from '@/lib/logger'

interface CTAButtonProps {
  children: React.ReactNode
  className?: string
}

/**
 * Renders CTA button with auth-aware navigation.
 * 
 * Checks Supabase session, routes to dashboard or signup, tracks analytics.
 * Side effects: session check, navigation, PostHog event.
 * 
 * @param children - Button label/content
 * @param className - Additional CSS classes
 */
export function CTAButton({ children, className = '' }: CTAButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Zalogowany - idź do dashboard (intencja: create_heartbeat)
        captureCTAClicked({ cta: 'create_heartbeat' })
        router.push('/dashboard')
      } else {
        // Niezalogowany - idź do signup
        captureCTAClicked({ cta: 'signup' })
        router.push('/auth/signup')
      }
    } catch (error) {
      logger.error('Error checking session:', error)
      // W razie błędu, przekieruj do signup
      router.push('/auth/signup')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${className} disabled:opacity-50`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}

