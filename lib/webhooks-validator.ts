// Walidator webhook URLs - ochrona przed SSRF

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

// Optional: Test webhook before saving
export async function testWebhookUrl(
  url: string, 
  type: 'slack' | 'discord',
  timeout: number = 5000
): Promise<{ success: boolean; error?: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const testPayload = type === 'slack' 
      ? { text: '🧪 DeadManPing webhook test' }
      : { content: '🧪 DeadManPing webhook test' }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return { 
        success: false, 
        error: `Webhook returned status ${response.status}` 
      }
    }

    return { success: true }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Webhook request timed out' }
    }
    return { success: false, error: error.message }
  }
}

