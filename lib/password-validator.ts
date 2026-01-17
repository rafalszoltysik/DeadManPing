export interface PasswordValidation {
  valid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check for common passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password123',
    'admin123', 'letmein', 'welcome', 'monkey', 'dragon',
    'password1', 'Password1', 'Password1!', 'Qwerty123',
  ]
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common')
  }

  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    errors.push('Password contains sequential characters')
  }

  if (/(?:012|123|234|345|456|567|678|789)/.test(password)) {
    errors.push('Password contains sequential numbers')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Check if password has been compromised in a data breach
 * Uses haveibeenpwned API with k-anonymity (only sends first 5 chars of hash)
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    const crypto = await import('crypto')
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
    const prefix = hash.substring(0, 5)
    const suffix = hash.substring(5)

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { 
        headers: { 'Add-Padding': 'true' },
        signal: AbortSignal.timeout(5000) 
      }
    )

    if (!response.ok) return false // Fail open

    const text = await response.text()
    return text.includes(suffix) // true = breached
  } catch {
    return false // Fail open on error
  }
}

/**
 * Get password strength score (0-4)
 * 0 = very weak, 4 = very strong
 */
export function getPasswordStrength(password: string): {
  score: number
  feedback: string
} {
  let score = 0
  const feedback: string[] = []

  // Length bonus
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++

  // Complexity bonus
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  // Variety bonus
  const uniqueChars = new Set(password).size
  if (uniqueChars > password.length * 0.5) score++

  // Cap at 4
  score = Math.min(score, 4)

  // Feedback
  if (score === 0) feedback.push('Very weak password')
  if (score === 1) feedback.push('Weak password')
  if (score === 2) feedback.push('Fair password')
  if (score === 3) feedback.push('Strong password')
  if (score === 4) feedback.push('Very strong password')

  return {
    score,
    feedback: feedback.join('. ')
  }
}

