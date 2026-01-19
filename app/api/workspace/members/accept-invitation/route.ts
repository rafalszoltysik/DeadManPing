import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { createClient } from '@supabase/supabase-js'

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

export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { workspaceId } = await request.json()

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      )
    }

    // Find pending invitation for this user and workspace
    const { data: invitation, error: searchError } = await supabaseAdmin
      .from('workspace_members')
      .select('id, workspace_id, user_id, status')
      .eq('workspace_id', workspaceId)
      .or(`user_id.eq.${user.id},invite_email.eq.${user.email?.toLowerCase().trim()}`)
      .eq('status', 'pending')
      .maybeSingle()

    if (searchError) {
      console.error('Error searching for invitation:', searchError)
      return NextResponse.json(
        { error: 'Failed to find invitation' },
        { status: 500 }
      )
    }

    if (!invitation) {
      // Check if user is already a member
      const { data: existingMember } = await supabaseAdmin
        .from('workspace_members')
        .select('id, status')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingMember) {
        // Already a member, just update status if needed
        if (existingMember.status === 'pending') {
          const { error: updateError } = await supabaseAdmin
            .from('workspace_members')
            .update({
              status: 'accepted',
              joined_at: new Date().toISOString(),
            })
            .eq('id', existingMember.id)

          if (updateError) {
            console.error('Error updating invitation status:', updateError)
            return NextResponse.json(
              { error: 'Failed to update invitation status' },
              { status: 500 }
            )
          }
        }
        return NextResponse.json({ success: true, message: 'Invitation already accepted' })
      }

      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Update invitation to accepted
    const updateData: any = {
      status: 'accepted',
      joined_at: new Date().toISOString(),
    }

    // If user_id is not set, set it and clear invite_email
    if (!invitation.user_id) {
      updateData.user_id = user.id
      updateData.invite_email = null
    }

    const { error: updateError } = await supabaseAdmin
      .from('workspace_members')
      .update(updateData)
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error accepting invitation:', updateError)
      return NextResponse.json(
        { error: 'Failed to accept invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation accepted successfully' 
    })
  } catch (error: any) {
    console.error('Error in accept invitation:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

