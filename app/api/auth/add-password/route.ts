/**
 * Add password to OAuth-only account API endpoint.
 * 
 * Allows users with Google OAuth accounts to add a password for email/password
 * authentication. Validates password strength and updates user via Supabase Auth.
 * Requires authenticated session.
 * 
 * Does not handle password changes - see /api/auth/change-password for that.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { validatePassword } from '@/lib/password-validator'
import { createClient } from '@/lib/supabase/server'

/**
 * Adds password to authenticated user's account.
 * 
 * Validates password strength and updates user via Supabase Auth. Side effects:
 * password update in Supabase, session refresh.
 * 
 * @param request - HTTP request with password in JSON body
 * @returns Success or error response
 */
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
      // Translate common Supabase error messages to English
      let errorMessage = updateError.message || 'Failed to add password'
      if (errorMessage.includes('Password')) {
        errorMessage = 'Invalid password. Please check your password requirements.'
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      }
      return NextResponse.json(
        { error: errorMessage },
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

