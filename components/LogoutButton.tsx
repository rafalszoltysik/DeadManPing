'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LogoutButtonProps {
  variant?: 'default' | 'compact'
}

export function LogoutButton({ variant = 'default' }: LogoutButtonProps) {
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

      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        // If response is not JSON, try to get text
        const text = await response.text()
        console.error('Logout response is not JSON:', text)
        responseData = { success: false, error: 'Invalid response format' }
      }

      if (response.ok && responseData.success) {
        console.log('Logout successful')
        // Force a hard refresh to clear any cached state
        window.location.href = '/'
      } else {
        const errorMessage = responseData.error || `HTTP ${response.status}: ${response.statusText}`
        console.error('Logout failed:', {
          status: response.status,
          statusText: response.statusText,
          response: responseData,
        })
        
        // In development, show alert with full details
        if (process.env.NODE_ENV === 'development') {
          const details = responseData.details ? `\n\nDetails: ${JSON.stringify(responseData.details, null, 2)}` : ''
          alert(`Logout failed: ${errorMessage}${details}\n\nCheck console for full details.`)
          // Wait a bit so user can read the error
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
        // Still redirect even if there's an error (cookies might still be cleared)
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout fetch error:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      })
      
      // In development, show alert with full error details
      if (process.env.NODE_ENV === 'development') {
        const errorMsg = error instanceof Error 
          ? `${error.name}: ${error.message}`
          : String(error)
        const stack = error instanceof Error ? error.stack : undefined
        alert(`Logout fetch error: ${errorMsg}${stack ? `\n\nStack:\n${stack}` : ''}\n\nCheck console for full details.`)
        // Wait a bit so user can read the error
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
      // Still redirect even if there's an error
      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="text-sm text-muted-foreground hover:text-foreground px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-accent transition-smooth disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        title="Logout"
      >
        {loading ? '...' : 'Logout'}
      </button>
    )
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

