/**
 * Payload validation rules structure:
 * {
 *   maxDurationMs?: number,
 *   minCount?: number,
 *   maxCount?: number,
 *   requiredFields?: Record<string, any>,
 *   customChecks?: Array<{
 *     field: string,
 *     operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'exists',
 *     value: any
 *   }>
 * }
 */

interface PayloadValidationRules {
  maxDurationMs?: number
  minCount?: number
  maxCount?: number
  requiredFields?: Record<string, any>
  customChecks?: Array<{
    field: string
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'exists'
    value: any
  }>
}

interface PayloadData {
  s?: 'ok' | 'fail'
  m?: string
  d?: number
  count?: number
  [key: string]: any // for metadata fields
}

interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Get nested value from object using dot notation (e.g., "metadata.file_exists")
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[part]
  }
  return current
}

/**
 * Validate payload against validation rules
 */
export function validatePayload(
  payload: PayloadData,
  rules: PayloadValidationRules | null | undefined
): ValidationResult {
  const errors: string[] = []

  if (!rules) {
    return { valid: true, errors: [] }
  }

  // Validate max duration
  if (rules.maxDurationMs !== undefined && payload.d !== undefined) {
    if (payload.d > rules.maxDurationMs) {
      errors.push(
        `Execution time (${payload.d}ms) exceeds maximum allowed (${rules.maxDurationMs}ms)`
      )
    }
  }

  // Validate count range
  if (rules.minCount !== undefined && payload.count !== undefined) {
    if (payload.count < rules.minCount) {
      errors.push(
        `Count (${payload.count}) is below minimum (${rules.minCount})`
      )
    }
  }

  if (rules.maxCount !== undefined && payload.count !== undefined) {
    if (payload.count > rules.maxCount) {
      errors.push(
        `Count (${payload.count}) exceeds maximum (${rules.maxCount})`
      )
    }
  }

  // Validate required fields (check in metadata or top-level)
  if (rules.requiredFields) {
    for (const [fieldName, expectedValue] of Object.entries(rules.requiredFields)) {
      const fieldValue = getNestedValue(payload, fieldName) ?? getNestedValue(payload, `metadata.${fieldName}`)
      
      if (fieldValue === undefined) {
        errors.push(`Required field '${fieldName}' is missing`)
      } else if (expectedValue !== null && fieldValue !== expectedValue) {
        errors.push(
          `Field '${fieldName}' has value '${fieldValue}' but expected '${expectedValue}'`
        )
      }
    }
  }

  // Validate custom checks
  if (rules.customChecks) {
    for (const check of rules.customChecks) {
      const fieldValue = getNestedValue(payload, check.field) ?? getNestedValue(payload, `metadata.${check.field}`)
      
      switch (check.operator) {
        case 'eq':
          if (fieldValue !== check.value) {
            errors.push(`Field '${check.field}' (${fieldValue}) is not equal to ${check.value}`)
          }
          break
        case 'gt':
          if (fieldValue === undefined || fieldValue <= check.value) {
            errors.push(`Field '${check.field}' (${fieldValue}) must be greater than ${check.value}`)
          }
          break
        case 'lt':
          if (fieldValue === undefined || fieldValue >= check.value) {
            errors.push(`Field '${check.field}' (${fieldValue}) must be less than ${check.value}`)
          }
          break
        case 'gte':
          if (fieldValue === undefined || fieldValue < check.value) {
            errors.push(`Field '${check.field}' (${fieldValue}) must be greater than or equal to ${check.value}`)
          }
          break
        case 'lte':
          if (fieldValue === undefined || fieldValue > check.value) {
            errors.push(`Field '${check.field}' (${fieldValue}) must be less than or equal to ${check.value}`)
          }
          break
        case 'in':
          if (!Array.isArray(check.value) || !check.value.includes(fieldValue)) {
            errors.push(`Field '${check.field}' (${fieldValue}) must be one of: ${check.value.join(', ')}`)
          }
          break
        case 'notIn':
          if (Array.isArray(check.value) && check.value.includes(fieldValue)) {
            errors.push(`Field '${check.field}' (${fieldValue}) must not be one of: ${check.value.join(', ')}`)
          }
          break
        case 'exists':
          if (fieldValue === undefined || fieldValue === null) {
            errors.push(`Field '${check.field}' must exist`)
          }
          break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate and sanitize payload validation rules structure
 */
export function validatePayloadRules(rules: any): {
  valid: boolean
  error?: string
  sanitized?: PayloadValidationRules
} {
  if (!rules || typeof rules !== 'object') {
    return { valid: true, sanitized: undefined }
  }

  const sanitized: PayloadValidationRules = {}

  // Validate maxDurationMs
  if (rules.maxDurationMs !== undefined) {
    if (typeof rules.maxDurationMs !== 'number' || rules.maxDurationMs < 0 || rules.maxDurationMs > 3600000) {
      return { valid: false, error: 'maxDurationMs must be a number between 0 and 3600000' }
    }
    sanitized.maxDurationMs = rules.maxDurationMs
  }

  // Validate minCount
  if (rules.minCount !== undefined) {
    if (typeof rules.minCount !== 'number' || rules.minCount < 0) {
      return { valid: false, error: 'minCount must be a non-negative number' }
    }
    sanitized.minCount = rules.minCount
  }

  // Validate maxCount
  if (rules.maxCount !== undefined) {
    if (typeof rules.maxCount !== 'number' || rules.maxCount < 0) {
      return { valid: false, error: 'maxCount must be a non-negative number' }
    }
    sanitized.maxCount = rules.maxCount
  }

  // Validate minCount <= maxCount if both are set
  if (sanitized.minCount !== undefined && sanitized.maxCount !== undefined) {
    if (sanitized.minCount > sanitized.maxCount) {
      return { valid: false, error: 'minCount cannot be greater than maxCount' }
    }
  }

  // Validate requiredFields
  if (rules.requiredFields !== undefined) {
    if (typeof rules.requiredFields !== 'object' || Array.isArray(rules.requiredFields)) {
      return { valid: false, error: 'requiredFields must be an object' }
    }
    if (Object.keys(rules.requiredFields).length > 10) {
      return { valid: false, error: 'requiredFields cannot have more than 10 fields' }
    }
    sanitized.requiredFields = rules.requiredFields
  }

  // Validate customChecks
  if (rules.customChecks !== undefined) {
    if (!Array.isArray(rules.customChecks)) {
      return { valid: false, error: 'customChecks must be an array' }
    }
    if (rules.customChecks.length > 20) {
      return { valid: false, error: 'customChecks cannot have more than 20 checks' }
    }

    const validOperators = ['eq', 'gt', 'lt', 'gte', 'lte', 'in', 'notIn', 'exists']
    for (let i = 0; i < rules.customChecks.length; i++) {
      const check = rules.customChecks[i]
      if (typeof check !== 'object' || !check.field || !check.operator) {
        return { valid: false, error: `customChecks[${i}] must have 'field' and 'operator' properties` }
      }
      if (typeof check.field !== 'string' || check.field.length > 100) {
        return { valid: false, error: `customChecks[${i}].field must be a string with max 100 characters` }
      }
      if (!validOperators.includes(check.operator)) {
        return { valid: false, error: `customChecks[${i}].operator must be one of: ${validOperators.join(', ')}` }
      }
      if (check.operator !== 'exists' && !('value' in check)) {
        return { valid: false, error: `customChecks[${i}] must have 'value' property when operator is not 'exists'` }
      }
    }
    sanitized.customChecks = rules.customChecks
  }

  return { valid: true, sanitized }
}

