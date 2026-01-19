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

    // First, check if user already has a session (e.g., from login page handling hash fragment)
    const { data: { user: existingUser } } = await supabase.auth.getUser()
    if (existingUser) {
      userId = existingUser.id
      userEmail = existingUser.email ?? null
    }

    // If no existing session, try to verify token
    if (!userId || !userEmail) {
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
    }

    if (!userId || !userEmail) {
      return NextResponse.redirect(new URL('/auth/login?error=no_email', request.url))
    }

    const normalizedEmail = userEmail.toLowerCase().trim()
    console.log('Processing invitation acceptance:', { 
      userId, 
      userEmail, 
      normalizedEmail, 
      workspaceIdFromUrl: workspaceId,
      hasTokenHash: !!tokenHash,
      hasType: type
    })
    
    // Try to get workspace_id from URL, user metadata, or find by email
    let finalWorkspaceId = workspaceId || (await supabase.auth.getUser()).data.user?.user_metadata?.workspace_id
    
    console.log('Workspace ID lookup:', { 
      fromUrl: workspaceId, 
      fromMetadata: (await supabase.auth.getUser()).data.user?.user_metadata?.workspace_id,
      finalWorkspaceId 
    })
    
    // If no workspace_id provided, try to find pending invitation by email
    if (!finalWorkspaceId) {
      console.log('No workspace_id found, searching by email:', normalizedEmail)
      const { data: pendingInvitation, error: searchError } = await supabaseAdmin
        .from('workspace_members')
        .select('workspace_id, invite_email')
        .eq('invite_email', normalizedEmail)
        .eq('status', 'pending')
        .limit(1)
        .maybeSingle()
      
      if (searchError) {
        console.error('Error searching for pending invitation:', searchError)
      }
      
      if (pendingInvitation) {
        finalWorkspaceId = pendingInvitation.workspace_id
        console.log('Found pending invitation by email:', { 
          email: normalizedEmail, 
          workspaceId: finalWorkspaceId,
          foundInviteEmail: pendingInvitation.invite_email
        })
      } else {
        console.log('No pending invitation found by email:', normalizedEmail)
      }
    }

    let invitationAccepted = false
    let workspaceName: string | null = null

    if (finalWorkspaceId) {
      // Get workspace name for success message
      const { data: workspaceData } = await supabaseAdmin
        .from('workspaces')
        .select('name')
        .eq('id', finalWorkspaceId)
        .maybeSingle()
      
      if (workspaceData) {
        workspaceName = workspaceData.name
      }

      // Find pending invitation by email and workspace
      // Try multiple methods to find the invitation
      console.log('Searching for invitation:', { 
        workspaceId: finalWorkspaceId, 
        email: normalizedEmail,
        originalEmail: userEmail
      })
      
      // First, try to find invitation by user_id (if user was already created by Supabase)
      // Then fallback to email search
      let { data: invitation, error: invitationSearchError } = await supabaseAdmin
        .from('workspace_members')
        .select('id, workspace_id, role, invited_by, invite_email, status, user_id')
        .eq('workspace_id', finalWorkspaceId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle()

      // If not found by user_id, try by email
      if (!invitation) {
        const { data: emailInvitation, error: emailSearchError } = await supabaseAdmin
          .from('workspace_members')
          .select('id, workspace_id, role, invited_by, invite_email, status, user_id')
          .eq('workspace_id', finalWorkspaceId)
          .eq('invite_email', normalizedEmail)
          .eq('status', 'pending')
          .maybeSingle()
        
        if (emailSearchError) {
          console.error('Error searching for invitation by email:', emailSearchError)
        }
        
        invitation = emailInvitation || invitation
        invitationSearchError = emailSearchError || invitationSearchError
      }

      if (invitationSearchError) {
        console.error('Error searching for invitation (exact match):', invitationSearchError)
      }

      // If not found, try case-insensitive search
      if (!invitation) {
        console.log('Exact match not found, trying case-insensitive search')
        const { data: caseInsensitiveInvitation, error: caseInsensitiveError } = await supabaseAdmin
          .from('workspace_members')
          .select('id, workspace_id, role, invited_by, invite_email, status, user_id')
          .eq('workspace_id', finalWorkspaceId)
          .ilike('invite_email', normalizedEmail)
          .eq('status', 'pending')
          .maybeSingle()
        
        if (caseInsensitiveError) {
          console.error('Error searching for invitation (case-insensitive):', caseInsensitiveError)
        }
        
        if (caseInsensitiveInvitation) {
          invitation = caseInsensitiveInvitation
          console.log('Found invitation with case-insensitive search:', {
            id: invitation.id,
            invite_email: invitation.invite_email,
            normalizedEmail
          })
        }
      }

      // If still not found, try to find any pending invitation for this workspace and email (fuzzy match)
      if (!invitation) {
        console.log('Case-insensitive match not found, trying fuzzy search')
        const { data: allPending, error: allPendingError } = await supabaseAdmin
          .from('workspace_members')
          .select('id, workspace_id, role, invited_by, invite_email, status, user_id')
          .eq('workspace_id', finalWorkspaceId)
          .eq('status', 'pending')
        
        if (allPendingError) {
          console.error('Error fetching all pending invitations:', allPendingError)
        } else {
          console.log('All pending invitations for workspace:', allPending)
          // Try to find by email similarity (contains or similar)
          const fuzzyMatch = allPending?.find(inv => 
            inv.invite_email?.toLowerCase().trim() === normalizedEmail ||
            inv.invite_email?.toLowerCase().includes(normalizedEmail) ||
            normalizedEmail.includes(inv.invite_email?.toLowerCase() || '')
          )
          
          if (fuzzyMatch) {
            invitation = fuzzyMatch
            console.log('Found invitation with fuzzy match:', {
              id: invitation.id,
              invite_email: invitation.invite_email,
              normalizedEmail
            })
          }
        }
      }

      console.log('Final invitation search result:', { 
        found: !!invitation, 
        invitation: invitation ? {
          id: invitation.id,
          workspace_id: invitation.workspace_id,
          invite_email: invitation.invite_email,
          status: invitation.status
        } : null
      })

      if (invitation) {
        // Update invitation to accepted
        // If user_id is already set (from when invitation was created), we just need to update status
        // If user_id is not set, we need to set it and clear invite_email
        console.log('Updating invitation:', { 
          invitationId: invitation.id, 
          currentUserId: invitation.user_id || null,
          loggedInUserId: userId, 
          workspaceId: finalWorkspaceId 
        })
        
        const updateData: any = {
          status: 'accepted',
          joined_at: new Date().toISOString(),
        }

        // If invitation already has user_id, verify it matches the logged-in user
        if (invitation.user_id) {
          if (invitation.user_id !== userId) {
            console.error('User ID mismatch:', {
              invitationUserId: invitation.user_id,
              loggedInUserId: userId
            })
            // Still accept the invitation, but log the mismatch
          }
          // user_id is already set, just update status
        } else {
          // user_id not set, set it and clear invite_email
          updateData.user_id = userId
          updateData.invite_email = null
        }
        
        const { data: updateResult, error: updateError } = await supabaseAdmin
          .from('workspace_members')
          .update(updateData)
          .eq('id', invitation.id)
          .select()

        if (updateError) {
          console.error('Error accepting invitation:', {
            error: updateError,
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            invitationId: invitation.id,
            userId,
            workspaceId: finalWorkspaceId
          })
          // Don't fail - user is logged in, they can manually join later
        } else {
          invitationAccepted = true
          console.log('Invitation accepted successfully:', { 
            userId, 
            workspaceId: finalWorkspaceId, 
            email: normalizedEmail,
            updatedRecord: updateResult
          })
        }
      } else {
        // No pending invitation found - maybe user was already added or invitation expired
        // Let's check what invitations exist for debugging
        const { data: allInvitations, error: allInvitationsError } = await supabaseAdmin
          .from('workspace_members')
          .select('id, workspace_id, invite_email, status, user_id')
          .eq('workspace_id', finalWorkspaceId)
          .or(`invite_email.eq.${normalizedEmail},user_id.eq.${userId}`)
        
        console.log('All invitations for workspace/email:', {
          workspaceId: finalWorkspaceId,
          email: normalizedEmail,
          userId,
          invitations: allInvitations,
          error: allInvitationsError
        })
        
        // Check if they're already a member
        const { data: existingMember } = await supabaseAdmin
          .from('workspace_members')
          .select('id')
          .eq('workspace_id', finalWorkspaceId)
          .eq('user_id', userId)
          .maybeSingle()

        if (existingMember) {
          console.log('User is already a member of this workspace:', { userId, workspaceId: finalWorkspaceId })
          invitationAccepted = true // They're already a member, treat as success
        } else {
          // Try to find invitation with slightly different email matching (case-insensitive)
          const { data: caseInsensitiveInvitation } = await supabaseAdmin
            .from('workspace_members')
            .select('id, workspace_id, invite_email, status')
            .eq('workspace_id', finalWorkspaceId)
            .eq('status', 'pending')
            .ilike('invite_email', normalizedEmail)
            .maybeSingle()
          
          if (caseInsensitiveInvitation) {
            console.log('Found invitation with case-insensitive search:', caseInsensitiveInvitation)
            // Update this invitation
            const { error: updateError2 } = await supabaseAdmin
              .from('workspace_members')
              .update({
                user_id: userId,
                status: 'accepted',
                joined_at: new Date().toISOString(),
                invite_email: null,
              })
              .eq('id', caseInsensitiveInvitation.id)
            
            if (updateError2) {
              console.error('Error updating case-insensitive invitation:', updateError2)
            } else {
              invitationAccepted = true
              console.log('Invitation accepted (case-insensitive match):', { userId, workspaceId: finalWorkspaceId })
            }
          } else {
            // Auto-add them if they're not already a member (fallback)
            console.log('Auto-adding user to workspace (fallback):', { userId, workspaceId: finalWorkspaceId })
            const { error: insertError } = await supabaseAdmin
              .from('workspace_members')
              .insert({
                workspace_id: finalWorkspaceId,
                user_id: userId,
                role: 'member',
                status: 'accepted',
                joined_at: new Date().toISOString(),
              })
            
            if (insertError) {
              console.error('Error auto-adding user to workspace:', {
                error: insertError,
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint
              })
            } else {
              invitationAccepted = true
              console.log('User auto-added to workspace:', { userId, workspaceId: finalWorkspaceId })
            }
          }
        }
      }
    } else {
      console.warn('No workspace_id found for invitation:', { userId, email: normalizedEmail })
      // Redirect with warning but don't fail
      redirectUrl.searchParams.set('invited', 'no_workspace')
    }

    // Add success parameters to redirect URL
    if (invitationAccepted) {
      redirectUrl.searchParams.set('invited', 'true')
      if (workspaceName) {
        redirectUrl.searchParams.set('workspace', encodeURIComponent(workspaceName))
      }
    }

    // Update response URL with the modified redirect URL
    response.headers.set('Location', redirectUrl.toString())

    // Return response with cookies set
    return response
  } catch (error: any) {
    console.error('Error in invitation acceptance:', error)
    return NextResponse.redirect(new URL('/auth/login?error=invitation_failed', request.url))
  }
}

