'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export function AccountLinkedBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accountLinked = searchParams.get('accountLinked')
    if (accountLinked === 'true') {
      setShow(true)
      // Remove query parameter from URL
      const url = new URL(window.location.href)
      url.searchParams.delete('accountLinked')
      router.replace(url.pathname + url.search, { scroll: false })
      
      // Hide after 5 seconds
      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
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

