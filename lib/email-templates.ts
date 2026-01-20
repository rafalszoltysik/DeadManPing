/**
 * Professional email templates for DeadManPing alerts
 * Designed to be compatible with all major email clients (Gmail, Outlook, Apple Mail, etc.)
 * Uses table-based layout and inline styles for maximum compatibility
 */

interface EmailTemplateData {
  monitorName: string
  monitorStatus: string
  lastPingAt?: string
  dashboardUrl: string
  alertType: 'missing' | 'failed' | 'recovered' | 'warn'
}

interface AlertConfig {
  emoji: string
  title: string
  message: string
  color: string
  bgColor: string
  borderColor: string
}

function getAlertConfig(alertType: string): AlertConfig {
  switch (alertType) {
    case 'missing':
      return {
        emoji: '',
        title: "Monitor Didn't Ping",
        message: "Your monitor hasn't sent a ping in the expected time window. This could indicate that your cron job or scheduled task didn't run.",
        color: '#dc2626',
        bgColor: '#fef2f2',
        borderColor: '#fecaca',
      }
    case 'failed':
      return {
        emoji: '',
        title: 'Monitor Reported Failure',
        message: 'Your monitor reported a failure status. Please check your job logs and investigate the issue.',
        color: '#dc2626',
        bgColor: '#fef2f2',
        borderColor: '#fecaca',
      }
    case 'warn':
      return {
        emoji: '',
        title: 'Monitor is Late',
        message: 'Your monitor is late - ping not received within expected interval. It\'s still within grace period, but please check your cron job.',
        color: '#f59e0b',
        bgColor: '#fffbeb',
        borderColor: '#fde68a',
      }
    case 'recovered':
      return {
        emoji: '',
        title: 'Monitor Recovered',
        message: 'Good news! Your monitor is back online and working correctly.',
        color: '#16a34a',
        bgColor: '#f0fdf4',
        borderColor: '#bbf7d0',
      }
    default:
      return {
        emoji: '',
        title: 'Monitor Alert',
        message: 'You have received an alert for your monitor.',
        color: '#f59e0b',
        bgColor: '#fffbeb',
        borderColor: '#fde68a',
      }
  }
}

export function generateEmailTemplate(data: EmailTemplateData): string {
  const config = getAlertConfig(data.alertType)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const currentYear = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${config.title}: ${data.monitorName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset styles for email clients */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    /* Prevent iOS blue links */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .content {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Wrapper table -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main container -->
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header with colored bar -->
          <tr>
            <td style="background-color: ${config.color}; padding: 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 24px 32px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; line-height: 1.3;">
                      ${config.title}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content" style="padding: 32px;">
              
              <!-- Alert message -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="background-color: ${config.bgColor}; border-left: 4px solid ${config.borderColor}; padding: 16px 20px; border-radius: 4px;">
                    <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                      ${config.message}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Monitor details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px;">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 140px; padding: 0; vertical-align: top;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500;">Monitor Name:</p>
                              </td>
                              <td style="padding: 0; vertical-align: top;">
                                <p style="margin: 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(data.monitorName)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 140px; padding: 0; vertical-align: top;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500;">Status:</p>
                              </td>
                              <td style="padding: 0; vertical-align: top;">
                                <p style="margin: 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(data.monitorStatus)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ${data.lastPingAt ? `
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="width: 140px; padding: 0; vertical-align: top;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500;">Last Ping:</p>
                              </td>
                              <td style="padding: 0; vertical-align: top;">
                                <p style="margin: 0; color: #1f2937; font-size: 14px;">${formatDate(data.lastPingAt)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: ${config.color}; border-radius: 6px;">
                          <a href="${data.dashboardUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                            View Monitor Details
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer text -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                <tr>
                  <td style="padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      This is an automated alert from <strong>DeadManPing</strong>. If you have any questions, please visit our dashboard.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                © ${currentYear} DeadManPing. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return dateString
  }
}

export function generateEmailText(data: EmailTemplateData): string {
  const config = getAlertConfig(data.alertType)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const currentYear = new Date().getFullYear()

  let text = `${config.title}\n\n`
  text += `${config.message}\n\n`
  text += `Monitor Details:\n`
  text += `  Monitor Name: ${data.monitorName}\n`
  text += `  Status: ${data.monitorStatus}\n`
  if (data.lastPingAt) {
    text += `  Last Ping: ${formatDate(data.lastPingAt)}\n`
  }
  text += `\nView Monitor: ${data.dashboardUrl}\n\n`
  text += `---\n`
  text += `This is an automated alert from DeadManPing.\n\n`
  text += `© ${currentYear} DeadManPing. All rights reserved.`

  return text
}

