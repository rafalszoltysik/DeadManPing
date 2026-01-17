import { createBrowserClient } from '@supabase/ssr'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()!.split(';').shift()!)
  }
  return null
}

function setCookie(name: string, value: string, options?: any): void {
  if (typeof document === 'undefined') return
  const cookieOptions = options || {}
  const expires = cookieOptions.expires 
    ? `; expires=${new Date(cookieOptions.expires).toUTCString()}`
    : cookieOptions.maxAge
    ? `; max-age=${cookieOptions.maxAge}`
    : ''
  const path = cookieOptions.path ? `; path=${cookieOptions.path}` : '; path=/'
  const domain = cookieOptions.domain ? `; domain=${cookieOptions.domain}` : ''
  const secure = cookieOptions.secure ? '; secure' : ''
  const sameSite = cookieOptions.sameSite ? `; samesite=${cookieOptions.sameSite}` : '; samesite=lax'
  
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}${path}${domain}${secure}${sameSite}`
}

function removeCookie(name: string, options?: any): void {
  if (typeof document === 'undefined') return
  setCookie(name, '', { ...options, expires: new Date(0) })
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: getCookie,
        set: setCookie,
        remove: removeCookie,
      },
      cookieOptions: {
        name: 'sb-auth-token',
        domain: undefined, // Use current domain
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }
  )
}

