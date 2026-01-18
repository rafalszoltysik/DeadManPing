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

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const validation = validatePassword(password)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join('. ') },
        { status: 400 }
      )
    }

    // Use Supabase client with cookie-based session
    // This allows us to update the password for the authenticated user
    const supabase = await createClient()

    // Update user password
    // Supabase allows adding password to OAuth accounts
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Failed to add password' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Password added successfully. You can now sign in with your email and password.'
    })
  } catch (error: any) {
    console.error('Add password error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add password' },
      { status: 500 }
    )
  }
}

