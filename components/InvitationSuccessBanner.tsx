'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatedItem } from './AnimatedSection'

interface InvitationSuccessBannerProps {
  workspaceName?: string
}

export function InvitationSuccessBanner({ workspaceName }: InvitationSuccessBannerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Remove the invited parameter from URL after showing the message
    if (searchParams.get('invited') === 'true') {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('invited')
      newUrl.searchParams.delete('workspace')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  if (!isVisible) {
    return null
  }

  return (
    <AnimatedItem delay={0} direction="up" duration={600}>
      <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-6 animate-scale-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium mb-1">
              Successfully joined workspace!
            </p>
            <p className="text-sm">
              {workspaceName 
                ? `You've been added to "${workspaceName}" workspace. You now have access to all monitors and team features.`
                : "You've been successfully added to the workspace. You now have access to all monitors and team features."}
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-success hover:text-success/80 transition-smooth flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </AnimatedItem>
  )
}

