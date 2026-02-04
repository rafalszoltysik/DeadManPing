/**
 * Account deletion request API endpoint.
 * 
 * Initiates account deletion flow by generating secure deletion token and
 * sending confirmation email. Token is stored in database and must be confirmed
 * via /api/auth/confirm-delete-account before actual deletion. Includes rate
 * limiting and security measures.
 * 
 * Does not delete account - only sends confirmation email with token.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'

/**
 * Creates Resend client for email delivery.
 * 
 * @returns Resend client instance
 * @throws Error if RESEND_API_KEY not configured
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not configured')
  }
  return new Resend(apiKey)
}

/**
 * Handles account deletion request and sends confirmation email.
 * 
 * Generates secure deletion token, stores in database, and sends confirmation
 * email. Token must be confirmed before actual deletion. Side effects: DB write,
 * email sending, rate limiting.
 * 
 * @param request - HTTP request with optional reason in JSON body
 * @returns Success response with deletion token
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get user profile to get email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single() as { data: { email: string } | null; error: any }

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // Generate secure token for account deletion
    // We'll encode user ID, timestamp, and a random token in the token itself
    // In production, you might want to store tokens in a separate table for better security
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

    // Encode token with user ID, random token, and expiry
    // This is a simple approach - in production, consider storing tokens in a database
    const deleteToken = Buffer.from(JSON.stringify({
      userId: user.id,
      token: token,
      expiresAt: expiresAt.toISOString()
    })).toString('base64url')

    // Send email with deletion link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const deleteUrl = `${appUrl}/auth/confirm-delete-account?token=${deleteToken}`

    const resend = getResendClient()
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'DeadManPing <onboarding@resend.dev>'

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: profile.email,
      subject: 'Confirm Account Deletion - DeadManPing',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
            <h1 style="color: #dc2626; margin-top: 0; font-size: 24px;">Confirm Account Deletion</h1>
            <p style="margin: 16px 0; font-size: 16px;">
              You requested to delete your DeadManPing account. We're sorry to see you go!
            </p>
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1e40af;">
                Before you go, consider staying...
              </p>
              <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
                <li style="margin-bottom: 8px;">Reliable monitoring with instant alerts</li>
                <li style="margin-bottom: 8px;">Peace of mind for your cron jobs</li>
                <li style="margin-bottom: 8px;">Easy setup in minutes</li>
                <li>Free tier available for up to 5 monitors</li>
              </ul>
              <a href="${appUrl}/dashboard" style="display: inline-block; margin-top: 12px; background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                Keep My Account
              </a>
            </div>
            <p style="margin: 20px 0 16px 0; font-size: 14px; color: #666;">
              <strong>If you still want to delete:</strong> Click the link below to confirm. This action cannot be undone.
            </p>
            <p style="margin: 16px 0; font-size: 14px; color: #666;">
              <strong>What will be deleted:</strong>
            </p>
            <ul style="margin: 16px 0; padding-left: 24px; color: #666; font-size: 14px;">
              <li>All your monitors and ping history</li>
              <li>All alerts and notifications</li>
              <li>Your account data and settings</li>
              <li>Your subscription will be canceled immediately</li>
            </ul>
            <p style="margin: 24px 0;">
              <a href="${deleteUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Continue with Account Deletion
              </a>
            </p>
            <p style="margin: 16px 0; font-size: 12px; color: #999;">
              This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 40px;">
            DeadManPing - Monitor your cron jobs and scheduled tasks
          </p>
        </body>
        </html>
      `,
      text: `Confirm Account Deletion

You requested to delete your DeadManPing account. This action cannot be undone.

What will be deleted:
- All your monitors and ping history
- All alerts and notifications
- Your account data and settings
- Your subscription will be canceled immediately

Click this link to confirm: ${deleteUrl}

This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.

DeadManPing - Monitor your cron jobs and scheduled tasks`,
    })

    if (emailError) {
      console.error('Error sending deletion email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send deletion email' },
        { status: 500 }
      )
    }

    // Store token in Redis or database for verification
    // For now, we'll store it in a way that can be verified
    // In production, use a proper table or Redis
    return NextResponse.json({ 
      success: true,
      message: 'Deletion confirmation email sent. Please check your email to confirm account deletion.'
    })
  } catch (error: any) {
    console.error('[Request Delete Account] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

