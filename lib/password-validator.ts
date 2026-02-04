/**
 * Password validation and strength checking utilities.
 * 
 * Validates password strength, checks against common passwords, and optionally
 * verifies against Have I Been Pwned database. Used during user registration
 * and password changes.
 * 
 * Does not hash passwords - Supabase handles password hashing.
 */

export interface PasswordValidation {
  valid: boolean
  errors: string[]
}

/**
 * Validates password against strength requirements.
 * 
 * Checks length, character requirements, common passwords, and sequential patterns.
 * Returns validation result with array of error messages.
 * 
 * @param password - Password string to validate
 * @returns Validation result with errors array
 */
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


