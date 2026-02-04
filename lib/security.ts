/**
 * Security utilities for timing-safe secret comparison.
 * 
 * Provides timing-safe string comparison to prevent timing attacks on
 * secret/token validation. Uses constant-time comparison that always takes
 * the same amount of time regardless of string content.
 * 
 * Does not handle encryption, hashing, or token generation - only comparison.
 */

import { timingSafeEqual } from 'crypto'

/**
 * Performs timing-safe string comparison to prevent timing attacks.
 * 
 * Uses constant-time comparison for secrets, tokens, and passwords.
 * Always takes same amount of time regardless of string content.
 * 
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings match, false otherwise
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


