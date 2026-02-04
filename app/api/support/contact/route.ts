import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { checkRateLimit } from '@/lib/rate-limit'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not configured')
  }
  return new Resend(apiKey)
}

// Support email - use Resend receiving address (e.g., support@yourdomain.resend.app)
// Configure this in Resend Dashboard -> Receiving
// REQUIRED: Set RESEND_RECEIVING_EMAIL environment variable
// No fallback - this must be configured in your environment

export async function POST(request: NextRequest) {
  try {
    // Validate required environment variable
    const SUPPORT_INBOUND_EMAIL = process.env.RESEND_RECEIVING_EMAIL
    if (!SUPPORT_INBOUND_EMAIL) {
      console.error('RESEND_RECEIVING_EMAIL environment variable is not configured')
      return NextResponse.json(
        { error: 'Support email is not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    const user = await getSupabaseUser()
    const { subject, message, email } = await request.json()

    // If user is not logged in, email is required
    let userEmail: string
    let userId: string | null = null
    
    if (!user) {
      // Public contact form - email is required
      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        )
      }

      // Additional email validation
      const emailLower = email.trim().toLowerCase()
      
      // Check for suspicious patterns
      if (emailLower.length > 254) {
        return NextResponse.json(
          { error: 'Email address is too long' },
          { status: 400 }
        )
      }
      
      // Check for multiple consecutive dots or invalid characters
      if (/\.{2,}/.test(emailLower) || /[^\w.@-]/.test(emailLower)) {
        return NextResponse.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        )
      }

      userEmail = emailLower
      
      // Rate limiting for public users: 3 messages per hour per email and per IP (more restrictive)
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                       request.headers.get('x-real-ip') || 
                       'unknown'
      const emailKey = `support-contact:email:${userEmail}`
      const ipKey = `support-contact:ip:${clientIp}`
      
      const emailRateLimit = await checkRateLimit(emailKey, 3600000) // 1 hour
      if (!emailRateLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many contact requests from this email. Please try again later.' },
          { status: 429 }
        )
      }

      const ipRateLimit = await checkRateLimit(ipKey, 3600000) // 1 hour
      if (!ipRateLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many contact requests from this IP address. Please try again later.' },
          { status: 429 }
        )
      }
    } else {
      // Authenticated user - use their email
      if (!user.email) {
        return NextResponse.json(
          { error: 'User email not found' },
          { status: 400 }
        )
      }
      userEmail = user.email
      userId = user.id
      
      // Rate limiting: 5 messages per hour per user
      const rateLimitKey = `support-contact:user:${user.id}`
      const rateLimit = await checkRateLimit(rateLimitKey, 3600000) // 1 hour
      
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many contact requests. Please try again later.' },
          { status: 429 }
        )
      }
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Validate length
    if (subject.length > 200) {
      return NextResponse.json(
        { error: 'Subject must be less than 200 characters' },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be less than 5000 characters' },
        { status: 400 }
      )
    }

    // Use verified Resend domain as sender
    // The email will be sent to Resend receiving address configured in RESEND_RECEIVING_EMAIL
    // which will appear in Resend Inbox
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'DeadManPing <onboarding@resend.dev>'
    const supportEmail = SUPPORT_INBOUND_EMAIL

    // Create email content - simple format that will work well in Resend Inbox
    const emailSubject = `[Support Request] ${subject.trim()}`
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Support Request
        </h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>From:</strong> ${userEmail}</p>
          ${userId ? `<p style="margin: 5px 0;"><strong>User ID:</strong> ${userId}</p>` : '<p style="margin: 5px 0;"><strong>Type:</strong> Public Contact Form (Not logged in)</p>'}
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject.trim()}</p>
        </div>
        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Message:</h3>
          <div style="white-space: pre-wrap; color: #555; line-height: 1.6;">
${message.trim()}
          </div>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
          This message was sent from the DeadManPing${userId ? ' dashboard' : ' public'} contact form.
        </p>
      </div>
    `

    const emailText = `
New Support Request

From: ${userEmail}
${userId ? `User ID: ${userId}` : 'Type: Public Contact Form (Not logged in)'}
Subject: ${subject.trim()}

Message:
${message.trim()}

---
This message was sent from the DeadManPing${userId ? ' dashboard' : ' public'} contact form.
    `.trim()

    // Send email to Resend receiving address
    // This email will appear in Resend Inbox (Receiving section)
    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: supportEmail,
      reply_to: userEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    })

    if (error) {
      console.error('Error sending support email:', error)
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.' 
    })
  } catch (error: any) {
    console.error('Support contact error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}

