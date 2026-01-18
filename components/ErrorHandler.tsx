'use client'

import { useEffect } from 'react'

export function ErrorHandler() {
  useEffect(() => {
    // Check for OTP expired errors in URL hash and query params (Supabase redirects with hash)
    if (typeof window === 'undefined') return
    
    const checkAndRedirect = () => {
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)
      
      let errorCode: string | null = null
      let errorDescription: string | null = null
      
      // Check hash first (Supabase often uses hash for errors)
      if (hash && hash.length > 1) {
        try {
          // Hash format: #error=access_denied&error_code=otp_expired&error_description=...
          const hashString = hash.substring(1) // Remove #
          const hashParams = new URLSearchParams(hashString)
          errorCode = hashParams.get('error_code')
          errorDescription = hashParams.get('error_description')
          
          if (process.env.NODE_ENV === 'development') {
            console.log('ErrorHandler: Hash params:', { errorCode, errorDescription, hashString })
          }
        } catch (e) {
          console.error('ErrorHandler: Failed to parse hash:', e)
        }
      }
      
      // Fallback to query params if hash didn't have error_code
      if (!errorCode) {
        errorCode = searchParams.get('error_code')
        errorDescription = searchParams.get('error_description')
      }
      
      // Check if it's an expired OTP error
      const isExpired = errorCode === 'otp_expired' || 
                       errorDescription?.toLowerCase().includes('expired') ||
                       errorDescription?.toLowerCase().includes('invalid')
      
      if (isExpired) {
        // Use window.location.href for immediate redirect (router.push might not work in all cases)
        const loginUrl = new URL('/auth/login', window.location.origin)
        loginUrl.searchParams.set('error', 'verification_link_expired')
        loginUrl.searchParams.set('action', 'resend_verification')
        
        // Redirect immediately
        window.location.href = loginUrl.toString()
        return
      }
    }
    
    // Check immediately
    checkAndRedirect()
    
    // Also check after a small delay in case URL changes
    const timeout = setTimeout(checkAndRedirect, 100)
    
    return () => clearTimeout(timeout)
  }, [])

  return null
}

