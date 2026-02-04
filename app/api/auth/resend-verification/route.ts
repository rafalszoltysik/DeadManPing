/**
 * Email verification resend API endpoint.
 * 
 * Allows users to request a new email verification link. Applies rate limiting
 * per IP and per email to prevent abuse. Always returns success message to
 * prevent email enumeration attacks. Uses Supabase Auth to send verification emails.
 * 
 * Does not reveal whether email exists - same response for all requests.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rate-limit'
import { getAppUrl } from '@/lib/get-app-url'

/**
 * Creates Supabase client for email operations.
 * 
 * @returns Supabase client instance
 * @throws Error if environment variables not configured
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Handles email verification resend requests.
 * 
 * Validates email, applies rate limiting, and sends verification email via Supabase.
 * Always returns success to prevent email enumeration. Side effects: rate limit
 * checks, Supabase email sending.
 * 
 * @param request - HTTP request with email in JSON body
 * @returns Success response (always, for security)
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Rate limiting: 3 attempts per hour per IP and per email
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const ipKey = `resend-verification:ip:${clientIp}`
    const emailKey = `resend-verification:email:${email.toLowerCase().trim()}`
    
    const ipRateLimit = await checkRateLimit(ipKey, 3600000) // 1 hour
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification email requests. Please try again later.' },
        { status: 429 }
      )
    }

    const emailRateLimit = await checkRateLimit(emailKey, 3600000) // 1 hour
    if (!emailRateLimit.allowed) {
      // Don't reveal if email exists - same message for security
      return NextResponse.json(
        { error: 'Too many verification email requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Resend email verification
    // Supabase will send email if account exists and is not verified
    const supabase = getSupabaseClient()
    const baseUrl = getAppUrl()
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback?redirect=/dashboard`,
      },
    })

    // Log errors in development for debugging
    if (resendError && process.env.NODE_ENV === 'development') {
      console.log('Resend verification error (dev only):', resendError)
    }

    // Always return success to prevent email enumeration
    // Supabase will send email if account exists and needs verification, but we don't reveal this
    return NextResponse.json({ 
      success: true,
      message: 'If an account with this email exists and needs verification, a new verification link has been sent.'
    })
  } catch (error: any) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}

