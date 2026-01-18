import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Parse all cookies from document.cookie
          // IMPORTANT: Don't decode cookie names - Supabase stores them encoded
          if (typeof document === 'undefined') return []
          const cookies: Array<{ name: string; value: string }> = []
          const cookieString = document.cookie
          if (!cookieString) return cookies
          
          cookieString.split(';').forEach((cookie) => {
            const [name, ...rest] = cookie.trim().split('=')
            if (name) {
              // Keep name as-is (encoded), decode only value
              cookies.push({
                name: name.trim(), // Don't decode - Supabase uses encoded names
                value: decodeURIComponent(rest.join('=') || ''),
              })
            }
          })
          return cookies
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          // Set all cookies
          if (typeof document === 'undefined') return
          cookiesToSet.forEach(({ name, value, options }) => {
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
            
            document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}${path}${domain}${secure}${sameSite}`
          })
        },
      },
    }
  )
}

