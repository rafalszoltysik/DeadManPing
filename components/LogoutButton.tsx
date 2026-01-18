'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      // Use fetch to POST to logout route
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important: include cookies
      })

      if (response.ok) {
        // Force a hard refresh to clear any cached state
        window.location.href = '/'
      } else {
        console.error('Logout failed')
        // Still redirect even if there's an error
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if there's an error
      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-smooth text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  )
}

