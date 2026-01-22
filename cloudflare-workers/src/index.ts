/**
 * Cloudflare Worker Proxy for Supabase (Edge Functions + Auth)
 * 
 * This worker proxies requests from your custom domain (e.g., api.yourdomain.com)
 * to your Supabase project (e.g., xyzabc123.supabase.co)
 * 
 * Supports:
 * - Edge Functions: /functions/v1/*
 * - Auth endpoints: /auth/v1/*
 * - All other Supabase endpoints
 * 
 * This allows you to use a custom domain without paying for Supabase Pro tier.
 */

interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Access-Control-Max-Age': '86400',
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    try {
      const url = new URL(request.url)
      let targetPath = url.pathname
      
      // Handle different Supabase endpoints
      // If path starts with /functions/v1, /auth/v1, /rest/v1, or /storage/v1, use as-is
      // Otherwise, assume it's an Edge Function and prepend /functions/v1
      if (!targetPath.startsWith('/functions/v1') && 
          !targetPath.startsWith('/auth/v1') && 
          !targetPath.startsWith('/rest/v1') && 
          !targetPath.startsWith('/storage/v1')) {
        // Assume it's an Edge Function - prepend /functions/v1
        const functionName = targetPath.replace(/^\//, '')
        targetPath = `/functions/v1/${functionName}`
      }
      
      // Build target URL
      const targetUrl = `${env.SUPABASE_URL}${targetPath}${url.search}`

      // Prepare headers
      const headers = new Headers(request.headers)
      
      // Set Supabase API key
      headers.set('apikey', env.SUPABASE_ANON_KEY)
      
      // Preserve Authorization header if present (for authenticated requests)
      // If Authorization header exists, keep it; otherwise, set Bearer token
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${env.SUPABASE_ANON_KEY}`)
      }
      
      // Remove Host header to avoid conflicts
      headers.delete('Host')
      
      // Forward the request to Supabase
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: request.body,
      })

      // Clone response to modify headers
      const responseHeaders = new Headers(response.headers)
      
      // Add CORS headers to response
      for (const [key, value] of Object.entries(CORS_HEADERS)) {
        responseHeaders.set(key, value)
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      })
    } catch (error) {
      console.error('Proxy error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Proxy error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        }),
        { 
          status: 500, 
          headers: { 
            ...CORS_HEADERS,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
  },
}

