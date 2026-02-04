/**
 * Account linking success banner component.
 * 
 * Displays success message when Google account is linked to existing email
 * account. Shown once per user (stored in localStorage) and auto-dismisses after
 * 5 seconds. Removes accountLinked query parameter from URL.
 * 
 * Does not handle account linking - only displays success message.
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const ACCOUNT_LINKED_BANNER_KEY = 'accountLinkedBannerShown'

/**
 * Renders account linking success banner.
 * 
 * Checks URL parameter and localStorage to show banner once. Side effects:
 * localStorage read/write, URL parameter removal.
 */
export function AccountLinkedBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accountLinked = searchParams.get('accountLinked')
    if (accountLinked === 'true') {
      // Check if banner was already shown (stored in localStorage)
      const bannerShown = localStorage.getItem(ACCOUNT_LINKED_BANNER_KEY)
      
      if (!bannerShown) {
        // First time showing banner - mark it as shown
        localStorage.setItem(ACCOUNT_LINKED_BANNER_KEY, 'true')
        setShow(true)
        
        // Hide after 5 seconds
        const timer = setTimeout(() => setShow(false), 5000)
        
        // Remove query parameter from URL
        const url = new URL(window.location.href)
        url.searchParams.delete('accountLinked')
        router.replace(url.pathname + url.search, { scroll: false })
        
        return () => clearTimeout(timer)
      } else {
        // Banner was already shown - just remove the parameter
        const url = new URL(window.location.href)
        url.searchParams.delete('accountLinked')
        router.replace(url.pathname + url.search, { scroll: false })
      }
    }
  }, [searchParams, router])

  if (!show) return null

  return (
    <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-6">
      <p className="font-medium mb-1">
        Accounts linked successfully
      </p>
      <p className="text-sm">
        Your Google account has been linked to your existing account. You can now sign in with either your email and password or Google.
      </p>
    </div>
  )
}

