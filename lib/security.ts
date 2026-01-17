import { timingSafeEqual } from 'crypto'

/**
 * Timing-safe string comparison to prevent timing attacks
 * Use this for comparing secrets, tokens, passwords, etc.
 */
export function compareSecrets(a: string, b: string): boolean {
  try {
    if (!a || !b) return false
    
    // Ensure both strings are the same length
    if (a.length !== b.length) {
      // Still perform a comparison to prevent timing attacks on length check
      const dummyEqual = timingSafeEqual(
        Buffer.from(a),
        Buffer.from(a)
      )
      return false
    }

    const bufA = Buffer.from(a, 'utf8')
    const bufB = Buffer.from(b, 'utf8')
    
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/**
 * Generate cryptographically secure random string
 */
export function generateSecureToken(bytes: number = 32): string {
  const crypto = require('crypto')
  return crypto.randomBytes(bytes).toString('hex')
}

