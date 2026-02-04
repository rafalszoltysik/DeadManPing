/**
 * Supabase admin client singleton for elevated database access.
 * 
 * Provides a cached Supabase client with service role key that bypasses
 * Row Level Security (RLS) policies. Used for administrative operations,
 * cron jobs, and operations requiring elevated permissions.
 * 
 * Does not handle user sessions - see server.ts for user-scoped clients.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

let adminClient: ReturnType<typeof createClient<Database>> | null = null

/**
 * Gets or creates singleton Supabase admin client with service role key.
 * 
 * Bypasses RLS policies for administrative operations. Client is cached
 * for performance across multiple calls.
 * 
 * @returns Supabase admin client instance
 * @throws Error if environment variables are missing
 */
export function getSupabaseAdmin() {
  if (adminClient) {
    return adminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set')
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
  }

  adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}

