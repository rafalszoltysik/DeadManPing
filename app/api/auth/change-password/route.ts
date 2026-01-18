import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { validatePassword } from '@/lib/password-validator'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      )
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    // Validate new password strength
    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join('. ') },
        { status: 400 }
      )
    }

    // Use Supabase client with cookie-based session
    const supabase = await createClient()

    // First, verify the current password by attempting to sign in
    // We need to get the user's email to verify the password
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Re-authenticate to get fresh session after sign in
    // Then update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Failed to change password' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Password changed successfully.'
    })
  } catch (error: any) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: 500 }
    )
  }
}

