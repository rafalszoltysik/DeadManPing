/**
 * New payload validation rules structure:
 * {
 *   fields: [
 *     {
 *       name: string,           // Field name in payload (e.g., "count")
 *       type: "number" | "boolean" | "string",
 *       rule: ">" | "<" | ">=" | "<=" | "==" | "!=",
 *       value: number | boolean | string,  // Value to compare against
 *       severity?: "warn" | "error"       // Optional, defaults to "error"
 *     }
 *   ]
 * }
 * 
 * Max 5 fields (MVP: 1 field)
 * Only declared fields are processed, rest is ignored
 */

export interface PayloadField {
  name: string
  type: 'number' | 'boolean' | 'string'
  rule: '>' | '<' | '>=' | '<=' | '==' | '!='
  value: number | boolean | string
  severity?: 'warn' | 'error'
}

export interface PayloadValidationRules {
  fields: PayloadField[]
}

interface PayloadData {
  [key: string]: any // User can send any JSON, we only read declared fields
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  failedFields?: string[] // Names of fields that failed validation
}

const MAX_FIELDS = 5 // Max fields per monitor (MVP can start with 1)

/**
 * Validate payload against validation rules
 * Only processes fields declared in rules, ignores everything else
 */
export function validatePayload(
  payload: PayloadData,
  rules: PayloadValidationRules | null | undefined
): ValidationResult {
  const errors: string[] = []
  const failedFields: string[] = []

  if (!rules || !rules.fields || rules.fields.length === 0) {
    return { valid: true, errors: [] }
  }

  // Process only declared fields
  for (const field of rules.fields) {
    const fieldValue = payload[field.name]

    // Check if field exists
    if (fieldValue === undefined || fieldValue === null) {
      errors.push(`Field '${field.name}' is missing`)
      failedFields.push(field.name)
      continue
    }

    // Check type
    let actualType: string
    if (typeof fieldValue === 'number') {
      actualType = 'number'
    } else if (typeof fieldValue === 'boolean') {
      actualType = 'boolean'
    } else if (typeof fieldValue === 'string') {
      actualType = 'string'
    } else {
      errors.push(`Field '${field.name}' has invalid type (expected ${field.type}, got ${typeof fieldValue})`)
      failedFields.push(field.name)
      continue
    }

    if (actualType !== field.type) {
      errors.push(`Field '${field.name}' has wrong type (expected ${field.type}, got ${actualType})`)
      failedFields.push(field.name)
      continue
    }

    // Check rule
    let rulePassed = false
    switch (field.rule) {
      case '>':
        rulePassed = (fieldValue as number) > (field.value as number)
        break
      case '<':
        rulePassed = (fieldValue as number) < (field.value as number)
        break
      case '>=':
        rulePassed = (fieldValue as number) >= (field.value as number)
        break
      case '<=':
        rulePassed = (fieldValue as number) <= (field.value as number)
        break
      case '==':
        rulePassed = fieldValue === field.value
        break
      case '!=':
        rulePassed = fieldValue !== field.value
        break
    }

    if (!rulePassed) {
      errors.push(`Field '${field.name}' (${fieldValue}) does not satisfy rule: ${field.rule} ${field.value}`)
      failedFields.push(field.name)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    failedFields: failedFields.length > 0 ? failedFields : undefined,
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

  // Check if it's the new structure
  if (!rules.fields || !Array.isArray(rules.fields)) {
    return { valid: false, error: 'Payload validation rules must have a "fields" array' }
  }

  if (rules.fields.length === 0) {
    return { valid: true, sanitized: undefined }
  }

  if (rules.fields.length > MAX_FIELDS) {
    return { valid: false, error: `Maximum ${MAX_FIELDS} fields allowed per monitor` }
  }

  const validTypes = ['number', 'boolean', 'string']
  const validRules = ['>', '<', '>=', '<=', '==', '!=']
  const validSeverities = ['warn', 'error']

  const sanitizedFields: PayloadField[] = []

  for (let i = 0; i < rules.fields.length; i++) {
    const field = rules.fields[i]

    if (!field || typeof field !== 'object') {
      return { valid: false, error: `fields[${i}] must be an object` }
    }

    // Validate name
    if (!field.name || typeof field.name !== 'string' || field.name.trim().length === 0) {
      return { valid: false, error: `fields[${i}].name is required and must be a non-empty string` }
    }
    if (field.name.length > 100) {
      return { valid: false, error: `fields[${i}].name must be 100 characters or less` }
    }

    // Validate type
    if (!validTypes.includes(field.type)) {
      return { valid: false, error: `fields[${i}].type must be one of: ${validTypes.join(', ')}` }
    }

    // Validate rule
    if (!validRules.includes(field.rule)) {
      return { valid: false, error: `fields[${i}].rule must be one of: ${validRules.join(', ')}` }
    }

    // Validate value type matches field type
    if (field.type === 'number') {
      if (typeof field.value !== 'number') {
        return { valid: false, error: `fields[${i}].value must be a number when type is "number"` }
      }
      // Only allow comparison operators for numbers
      if (!['>', '<', '>=', '<=', '==', '!='].includes(field.rule)) {
        return { valid: false, error: `fields[${i}].rule must be a comparison operator (>, <, >=, <=, ==, !=) for number type` }
      }
    } else if (field.type === 'boolean') {
      if (typeof field.value !== 'boolean') {
        return { valid: false, error: `fields[${i}].value must be a boolean when type is "boolean"` }
      }
      // Only allow equality operators for booleans
      if (!['==', '!='].includes(field.rule)) {
        return { valid: false, error: `fields[${i}].rule must be == or != for boolean type` }
      }
    } else if (field.type === 'string') {
      if (typeof field.value !== 'string') {
        return { valid: false, error: `fields[${i}].value must be a string when type is "string"` }
      }
      // Only allow equality operators for strings
      if (!['==', '!='].includes(field.rule)) {
        return { valid: false, error: `fields[${i}].rule must be == or != for string type` }
      }
    }

    // Validate severity (optional)
    if (field.severity !== undefined) {
      if (!validSeverities.includes(field.severity)) {
        return { valid: false, error: `fields[${i}].severity must be one of: ${validSeverities.join(', ')}` }
      }
    }

    // Sanitize field
    sanitizedFields.push({
      name: field.name.trim(),
      type: field.type,
      rule: field.rule,
      value: field.value,
      severity: field.severity || 'error', // Default to 'error'
    })
  }

  return {
    valid: true,
    sanitized: {
      fields: sanitizedFields,
    },
  }
}
