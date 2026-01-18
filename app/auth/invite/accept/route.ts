import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const tokenHash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const workspaceId = requestUrl.searchParams.get('workspace')

    // Supabase invite emails use token_hash and type=invite
    // But they might also redirect to the standard callback with code
    // Handle both cases

    // Create redirect response for cookie handling
    const redirectUrl = new URL('/dashboard?invited=true', request.url)
    let response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    let userId: string | null = null
    let userEmail: string | null = null

    // Try token_hash first (direct invite link)
    if (tokenHash && type === 'invite') {
      const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'invite',
      })

      if (sessionError || !sessionData.user) {
        console.error('Error verifying invitation token:', sessionError)
        return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url))
      }

      userId = sessionData.user.id
      userEmail = sessionData.user.email ?? null
    } else {
      // Try code (OAuth-style callback)
      const code = requestUrl.searchParams.get('code')
      if (code) {
        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError || !sessionData.user) {
          console.error('Error exchanging code for session:', exchangeError)
          return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url))
        }

        userId = sessionData.user.id
        userEmail = sessionData.user.email ?? null
      } else {
        return NextResponse.redirect(new URL('/auth/login?error=invalid_invitation', request.url))
      }
    }

    if (!userId || !userEmail) {
      return NextResponse.redirect(new URL('/auth/login?error=no_email', request.url))
    }

    // If workspace_id is provided in URL or in user metadata, link the invitation
    const finalWorkspaceId = workspaceId || (await supabase.auth.getUser()).data.user?.user_metadata?.workspace_id

    if (finalWorkspaceId) {
      // Find pending invitation by email and workspace
      const { data: invitation } = await supabaseAdmin
        .from('workspace_members')
        .select('id, workspace_id, role, invited_by')
        .eq('workspace_id', finalWorkspaceId)
        .eq('invite_email', userEmail.toLowerCase())
        .eq('status', 'pending')
        .maybeSingle()

      if (invitation) {
        // Update invitation to accepted and link user_id
        const { error: updateError } = await supabaseAdmin
          .from('workspace_members')
          .update({
            user_id: userId,
            status: 'accepted',
            joined_at: new Date().toISOString(),
            invite_email: null, // Clear invite_email since we now have user_id
          })
          .eq('id', invitation.id)

        if (updateError) {
          console.error('Error accepting invitation:', updateError)
          // Don't fail - user is logged in, they can manually join later
        }
      } else {
        // No pending invitation found - maybe user was already added or invitation expired
        // Check if they're already a member
        const { data: existingMember } = await supabaseAdmin
          .from('workspace_members')
          .select('id')
          .eq('workspace_id', finalWorkspaceId)
          .eq('user_id', userId)
          .maybeSingle()

        if (!existingMember) {
          // Auto-add them if they're not already a member (fallback)
          await supabaseAdmin
            .from('workspace_members')
            .insert({
              workspace_id: finalWorkspaceId,
              user_id: userId,
              role: 'member',
              status: 'accepted',
              joined_at: new Date().toISOString(),
            })
        }
      }
    }

    // Return response with cookies set
    return response
  } catch (error: any) {
    console.error('Error in invitation acceptance:', error)
    return NextResponse.redirect(new URL('/auth/login?error=invitation_failed', request.url))
  }
}

