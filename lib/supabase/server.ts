/**
 * Supabase server client factory for user-scoped database access.
 * 
 * Creates Supabase client for Server Components with cookie-based session
 * management. Respects Row Level Security (RLS) policies based on authenticated user.
 * Used in Server Components and Server Actions for database queries.
 * 
 * Does not bypass RLS - see admin.ts for elevated permissions.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

/**
 * Creates Supabase client for Server Components with session management.
 * 
 * Uses Next.js cookies() API to read and write session cookies. Handles
 * session refresh automatically. Respects RLS policies.
 * 
 * @returns Supabase client instance with user session
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

