import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

let adminClient: ReturnType<typeof createClient<Database>> | null = null

/**
 * Get or create a Supabase admin client with service role key.
 * This client bypasses Row Level Security (RLS) policies.
 * 
 * @returns Supabase admin client
 * @throws Error if required environment variables are not set
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

