import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { checkMemberLimit } from '@/lib/limits'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// GET: List workspace members
export async function GET(request: NextRequest) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .single()

    if (!workspace) {
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
      .eq('workspace_id', workspace.id)
      .order('invited_at', { ascending: false })

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({ members: members || [] })
  } catch (error: any) {
    console.error('Error in GET /api/workspace/members:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Add member to workspace
export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get user's workspace
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id, name, subscription_tier')
      .eq('owner_id', user.id)
      .limit(1)
      .single()

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Check if user is owner or admin
    const { data: userMembership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspace.id)
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
      .eq('workspace_id', workspace.id)
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
        .eq('workspace_id', workspace.id)
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

      return NextResponse.json({ member: newMember }, { status: 201 })
    } else {
      // User doesn't exist - send invitation via Supabase Auth
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deadmanping.com'
      const redirectTo = `${siteUrl}/auth/invite/accept?workspace=${workspace.id}`

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

      // Create pending invitation record
      const { data: newInvitation, error: insertError } = await supabaseAdmin
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          invite_email: normalizedEmail,
          role: 'member',
          status: 'pending',
          invited_by: user.id,
        })
        .select(`
          id,
          role,
          status,
          invite_email,
          invited_at
        `)
        .single()

      if (insertError) {
        console.error('Error creating invitation record:', insertError)
        // Don't fail if we can't create the record - the invitation email was sent
        return NextResponse.json(
          { 
            member: {
              id: inviteData.user?.id || 'pending',
              invite_email: normalizedEmail,
              status: 'pending',
              role: 'member',
            },
            message: 'Invitation sent successfully'
          },
          { status: 201 }
        )
      }

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

// DELETE: Remove member from workspace
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Get user's workspace
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .single()

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Check if user is owner or admin
    const { data: userMembership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspace.id)
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
      .eq('workspace_id', workspace.id)
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
        .eq('workspace_id', workspace.id)
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
      .eq('workspace_id', workspace.id)

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


