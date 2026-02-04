/**
 * Webhook URL validation utilities with SSRF protection.
 * 
 * Validates Slack, Discord, and custom webhook URLs to prevent SSRF attacks.
 * Blocks private IPs, localhost, and cloud metadata endpoints. Uses whitelist
 * patterns for Slack/Discord and protocol/hostname checks for custom webhooks.
 * 
 * Does not send webhooks - only validates URLs before storage.
 */

const ALLOWED_WEBHOOK_PATTERNS = {
  slack: /^https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Za-z0-9]+$/,
  discord: /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/,
  discordcdn: /^https:\/\/discordapp\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/,
}

const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254', // AWS metadata
  '192.168.',        // Private network
  '10.',             // Private network
  '172.16.',         // Private network
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
]

/**
 * Validates Slack or Discord webhook URL format and security.
 * 
 * Checks HTTPS protocol, whitelist pattern matching, and blocks private IPs.
 * Returns validation result with error message if invalid.
 * 
 * @param url - Webhook URL to validate
 * @param type - Webhook type (slack or discord)
 * @returns Validation result with error message if invalid
 */
export function validateWebhookUrl(url: string, type: 'slack' | 'discord'): { 
  valid: boolean
  error?: string 
} {
  if (!url) return { valid: true } // Allow empty (means disabled)

  try {
    const parsed = new URL(url)

    // Check protocol
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Webhook URL must use HTTPS' }
    }

    // Check for blocked hosts (SSRF protection)
    const hostname = parsed.hostname.toLowerCase()
    for (const blocked of BLOCKED_HOSTS) {
      if (hostname.includes(blocked)) {
        return { valid: false, error: 'Invalid webhook URL hostname' }
      }
    }

    // Check against whitelist pattern
    const pattern = type === 'slack' 
      ? ALLOWED_WEBHOOK_PATTERNS.slack 
      : ALLOWED_WEBHOOK_PATTERNS.discord

    if (!pattern.test(url) && !ALLOWED_WEBHOOK_PATTERNS.discordcdn.test(url)) {
      return { 
        valid: false, 
        error: `Invalid ${type} webhook URL format` 
      }
    }

    return { valid: true }
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Validates custom webhook URL with SSRF protection (Team plan only).
 * 
 * Blocks private IPs, localhost, IPv6 localhost, and cloud metadata endpoints.
 * Only allows HTTPS protocol. More permissive than Slack/Discord (no pattern matching).
 * 
 * @param url - Custom webhook URL to validate
 * @returns Validation result with error message if invalid
 */
export function validateCustomWebhookUrl(url: string): { 
  valid: boolean
  error?: string 
} {
  if (!url) return { valid: true } // Allow empty (means disabled)

  try {
    const parsed = new URL(url)

    // Check protocol - only HTTPS allowed
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Custom webhook URL must use HTTPS' }
    }

    // Check for blocked hosts (SSRF protection)
    const hostname = parsed.hostname.toLowerCase()
    for (const blocked of BLOCKED_HOSTS) {
      if (hostname.includes(blocked)) {
        return { valid: false, error: 'Invalid webhook URL hostname (private IPs and localhost are not allowed)' }
      }
    }

    // Additional checks for common SSRF vectors
    // Block IPv6 localhost
    if (hostname === '::1' || hostname === '[::1]') {
      return { valid: false, error: 'Invalid webhook URL hostname' }
    }

    // Block common cloud metadata endpoints
    const metadataPatterns = [
      'metadata.google.internal',
      'metadata.azure.com',
      '169.254.169.254', // Already in BLOCKED_HOSTS but double-check
    ]
    for (const pattern of metadataPatterns) {
      if (hostname.includes(pattern)) {
        return { valid: false, error: 'Invalid webhook URL hostname' }
      }
    }

    return { valid: true }
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' }
  }
}


