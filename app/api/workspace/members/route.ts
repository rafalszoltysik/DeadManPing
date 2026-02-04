/**
 * Workspace members management API endpoint.
 * 
 * Handles listing, adding, and removing workspace members. Supports both
 * existing users (immediate addition) and invitations (via Supabase Auth).
 * Enforces member limits, role-based permissions, and rate limiting.
 * 
 * Does not handle invitation acceptance - see members/accept-invitation route.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { checkMemberLimit } from '@/lib/limits'
import { getAppUrl } from '@/lib/get-app-url'
import { checkRateLimit } from '@/lib/rate-limit'

/**
 * Creates Supabase admin client for database operations.
 * 
 * @returns Supabase client with service role key
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Lists all workspace members and pending invitations.
 * 
 * Returns members with their roles, status, and profile information.
 * Side effects: DB read (workspace_members, profiles).
 * 
 * @param request - HTTP request (unused)
 * @returns Array of workspace members
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace (check both ownership and membership)
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .single()

    // If not owner, check if user is a member
    let workspaceId: string | null = null
    if (workspace) {
      workspaceId = workspace.id
    } else {
      // Check if user is a member of any workspace
      const { data: membership } = await supabaseAdmin
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .limit(1)
        .single()

      if (membership) {
        workspaceId = membership.workspace_id
      }
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Get all members and pending invitations of this workspace
    const { data: members, error } = await supabaseAdmin
      .from('workspace_members')
      .select(`
        id,
        role,
        status,
        invited_at,
        joined_at,
        invite_email,
        profiles:user_id (
          id,
          email
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('invited_at', { ascending: false })

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    // Transform the data to match the Member interface
    // Supabase returns profiles as an array, but we need a single object or null
    const transformedMembers = (members || []).map((member: any) => ({
      ...member,
      profiles: Array.isArray(member.profiles) 
        ? (member.profiles.length > 0 ? member.profiles[0] : null)
        : member.profiles
    }))

    return NextResponse.json({ members: transformedMembers })
  } catch (error: any) {
    console.error('Error in GET /api/workspace/members:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Adds member to workspace or sends invitation.
 * 
 * If user exists, adds immediately. If not, sends invitation email via Supabase Auth.
 * Checks member limits, validates permissions, and applies rate limiting.
 * Side effects: DB write, email delivery (if invitation), rate limiting.
 * 
 * @param request - HTTP request with email in body
 * @returns Created member or invitation record
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 10 invitations per hour per user
    const rateLimitKey = `workspace:invite:${user.id}`
    const rateLimit = await checkRateLimit(rateLimitKey, 3600000) // 1 hour
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many invitation attempts. Please wait before trying again.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get user's workspace (check both ownership and membership)
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id, name, subscription_tier')
      .eq('owner_id', user.id)
      .limit(1)
      .single()

    // If not owner, check if user is a member
    let workspaceId: string | null = null
    if (workspace) {
      workspaceId = workspace.id
    } else {
      // Check if user is a member of any workspace
      const { data: membership } = await supabaseAdmin
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .limit(1)
        .single()

      if (membership) {
        workspaceId = membership.workspace_id
        // Get workspace details
        const { data: memberWorkspace } = await supabaseAdmin
          .from('workspaces')
          .select('id, name, subscription_tier')
          .eq('id', workspaceId)
          .single()
        if (memberWorkspace) {
          Object.assign(workspace || {}, memberWorkspace)
        }
      }
    }

    if (!workspaceId || !workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Check if user is owner or admin
    const { data: userMembership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return NextResponse.json({ error: 'Only owners and admins can add members' }, { status: 403 })
    }

    // Check member limit
    const memberLimit = await checkMemberLimit(workspace.id)
    if (!memberLimit.allowed) {
      return NextResponse.json(
        { error: `Member limit reached (${memberLimit.current}/${memberLimit.limit}). Upgrade your plan to add more members.` },
        { status: 403 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check for existing invitation by invite_email
    const { data: existingInvitationByEmail } = await supabaseAdmin
      .from('workspace_members')
      .select('id, status, user_id, invite_email')
      .eq('workspace_id', workspaceId)
      .eq('invite_email', normalizedEmail)
      .maybeSingle()

    if (existingInvitationByEmail) {
      if (existingInvitationByEmail.status === 'pending') {
        return NextResponse.json({ error: 'An invitation has already been sent to this email' }, { status: 400 })
      }
      return NextResponse.json({ error: 'User is already a member of this workspace' }, { status: 400 })
    }

    // Find user by email
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (userProfile) {
      // Check if user is already a member
      const { data: existingMember } = await supabaseAdmin
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userProfile.id)
        .maybeSingle()

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a member of this workspace' }, { status: 400 })
      }

      // User exists - add them immediately
      const { data: newMember, error: insertError } = await supabaseAdmin
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: userProfile.id,
          role: 'member',
          status: 'accepted',
          invited_by: user.id,
          joined_at: new Date().toISOString(),
        })
        .select(`
          id,
          role,
          status,
          invited_at,
          joined_at,
          profiles:user_id (
            id,
            email
          )
        `)
        .single()

      if (insertError) {
        console.error('Error adding member:', insertError)
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
      }

      // Transform the data to match the Member interface
      const transformedMember = {
        ...newMember,
        profiles: Array.isArray(newMember?.profiles) 
          ? (newMember.profiles.length > 0 ? newMember.profiles[0] : null)
          : newMember?.profiles
      }

      return NextResponse.json({ member: transformedMember }, { status: 201 })
    } else {
      // User doesn't exist - send invitation via Supabase Auth
      const appUrl = getAppUrl()
      // Redirect through callback first to handle token properly, then to set password page
      // This ensures token from hash fragment is properly processed
      const redirectTo = `${appUrl}/auth/callback?redirect=${encodeURIComponent(`/auth/invite/set-password?workspace=${workspace.id}${workspace.name ? `&workspace_name=${encodeURIComponent(workspace.name)}` : ''}`)}`

      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        normalizedEmail,
        {
          redirectTo,
          data: {
            workspace_id: workspace.id,
            workspace_name: workspace.name,
          },
        }
      )

      if (inviteError) {
        console.error('Error sending invitation:', inviteError)
        return NextResponse.json(
          { error: inviteError.message || 'Failed to send invitation' },
          { status: 500 }
        )
      }

      // Supabase creates a user with UUID when inviting, even if they haven't accepted yet
      // We can link the user_id immediately
      const invitedUserId = inviteData.user?.id
      
      console.log('Invitation created by Supabase:', {
        userId: invitedUserId,
        email: normalizedEmail,
        workspaceId: workspace.id
      })

      // Create pending invitation record with user_id if available
      // If user_id is set, we don't need invite_email (per database constraint)
      const invitationData: any = {
        workspace_id: workspace.id,
        role: 'member',
        status: 'pending',
        invited_by: user.id,
      }

      if (invitedUserId) {
        // Link user_id immediately - Supabase already created the user
        invitationData.user_id = invitedUserId
        // Don't set invite_email when user_id is set (per database constraint)
      } else {
        // Fallback: if Supabase didn't return user_id, use invite_email
        invitationData.invite_email = normalizedEmail
      }

      const { data: newInvitation, error: insertError } = await supabaseAdmin
        .from('workspace_members')
        .insert(invitationData)
        .select(`
          id,
          role,
          status,
          invite_email,
          user_id,
          invited_at
        `)
        .single()

      if (insertError) {
        console.error('Error creating invitation record:', insertError)
        // Don't fail if we can't create the record - the invitation email was sent
        return NextResponse.json(
          { 
            member: {
              id: invitedUserId || 'pending',
              invite_email: invitedUserId ? null : normalizedEmail,
              user_id: invitedUserId || null,
              status: 'pending',
              role: 'member',
            },
            message: 'Invitation sent successfully'
          },
          { status: 201 }
        )
      }

      console.log('Invitation record created:', {
        id: newInvitation.id,
        user_id: newInvitation.user_id,
        invite_email: newInvitation.invite_email,
        status: newInvitation.status
      })

      return NextResponse.json(
        { 
          member: newInvitation,
          message: 'Invitation sent successfully'
        },
        { status: 201 }
      )
    }
  } catch (error: any) {
    console.error('Error in POST /api/workspace/members:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Removes member from workspace.
 * 
 * Validates permissions (owner/admin only), prevents removing owner or last admin,
 * and applies rate limiting. Side effects: DB delete, rate limiting.
 * 
 * @param request - HTTP request with memberId query parameter
 * @returns Success status
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 20 removals per hour per user
    const rateLimitKey = `workspace:remove:${user.id}`
    const rateLimit = await checkRateLimit(rateLimitKey, 3600000) // 1 hour
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many removal attempts. Please wait before trying again.' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Get user's workspace (check both ownership and membership)
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .single()

    // If not owner, check if user is a member
    let workspaceId: string | null = null
    if (workspace) {
      workspaceId = workspace.id
    } else {
      // Check if user is a member of any workspace
      const { data: membership } = await supabaseAdmin
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .limit(1)
        .single()

      if (membership) {
        workspaceId = membership.workspace_id
      }
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Check if user is owner or admin
    const { data: userMembership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return NextResponse.json({ error: 'Only owners and admins can remove members' }, { status: 403 })
    }

    // Get member to remove
    const { data: member } = await supabaseAdmin
      .from('workspace_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Prevent removing owner
    if (member.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove workspace owner' }, { status: 400 })
    }

    // Prevent removing yourself if you're the only admin
    if (member.user_id === user.id && userMembership.role === 'admin') {
      const { count } = await supabaseAdmin
        .from('workspace_members')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .in('role', ['owner', 'admin'])

      if ((count || 0) <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 })
      }
    }

    // Remove member
    const { error: deleteError } = await supabaseAdmin
      .from('workspace_members')
      .delete()
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/workspace/members:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


