/**
 * Payload parsing utilities for monitor ping requests.
 * 
 * Extracts and parses payload data from HTTP requests across multiple formats
 * (GET query params, POST JSON, form-urlencoded). Enforces size limits and
 * type coercion. Used by ping endpoint to extract validation data from requests.
 * 
 * Does not validate payloads - see payload-validator.ts for validation logic.
 */

import { NextRequest, NextResponse } from 'next/server'

const MAX_PAYLOAD_SIZE = 2048 // 2KB

export interface ParsePayloadResult {
  success: true
  payload: Record<string, any>
}

export interface ParsePayloadError {
  success: false
  error: string
  details?: string
  status: number
}

export type ParsePayloadResponse = ParsePayloadResult | ParsePayloadError

/**
 * Parses payload from HTTP request based on method and content type.
 * 
 * Handles GET/HEAD (query parameters), POST/PUT (JSON body), and form-urlencoded.
 * Performs type coercion (string to number/boolean) and enforces size limits.
 * Returns structured error responses for invalid payloads.
 * 
 * @param request - Next.js request object
 * @param method - HTTP method (GET, POST, HEAD, etc.)
 * @returns Parsed payload object or error response
 */
export async function parsePayload(
  request: NextRequest,
  method: string
): Promise<ParsePayloadResponse> {
  let payload: Record<string, any> = {}

  if (method === 'GET' || method === 'HEAD') {
    // For GET/HEAD, parse query params as JSON-like structure
    const searchParams = request.nextUrl.searchParams
    searchParams.forEach((value, key) => {
      // Try to parse as number or boolean, otherwise keep as string
      if (value === 'true') payload[key] = true
      else if (value === 'false') payload[key] = false
      else if (!isNaN(Number(value)) && value !== '') payload[key] = Number(value)
      else payload[key] = value
    })
  } else {
    try {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        // Try to read body as text first to handle parsing errors better
        const bodyText = await request.text()
        if (bodyText.trim()) {
          try {
            payload = JSON.parse(bodyText)
          } catch (parseError) {
            console.error('JSON parse error:', parseError, 'Body:', bodyText)
            return {
              success: false,
              error: 'Invalid JSON payload',
              details: parseError instanceof Error ? parseError.message : 'Parse error',
              status: 400,
            }
          }
        }
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData()
        formData.forEach((value, key) => {
          const strValue = value.toString()
          if (strValue === 'true') payload[key] = true
          else if (strValue === 'false') payload[key] = false
          else if (!isNaN(Number(strValue)) && strValue !== '') payload[key] = Number(strValue)
          else payload[key] = strValue
        })
      }
    } catch (e) {
      // If request reading fails, return error
      console.error('Error reading request body:', e)
      return {
        success: false,
        error: 'Invalid request body',
        details: e instanceof Error ? e.message : 'Unknown error',
        status: 400,
      }
    }
  }

  // Validate payload size (max 2KB total)
  const payloadStr = JSON.stringify(payload)
  if (payloadStr.length > MAX_PAYLOAD_SIZE) {
    return {
      success: false,
      error: `Payload too large (max ${MAX_PAYLOAD_SIZE / 1024}KB)`,
      status: 400,
    }
  }

  return {
    success: true,
    payload,
  }
}

/**
 * Extracts only fields declared in validation rules from payload.
 * 
 * Filters payload to include only fields that are configured in monitor's
 * validation rules, ignoring all other fields. Ensures security and prevents
 * processing of unexpected data.
 * 
 * @param payload - Full payload object from request
 * @param validationRules - Monitor's validation rules configuration
 * @returns Filtered payload containing only declared fields
 */
export function extractDeclaredFields(
  payload: Record<string, any>,
  validationRules: { fields?: Array<{ name: string }> } | null | undefined
): Record<string, any> {
  const declaredFields: Record<string, any> = {}
  
  if (validationRules && validationRules.fields && Array.isArray(validationRules.fields)) {
    for (const field of validationRules.fields) {
      if (payload[field.name] !== undefined) {
        declaredFields[field.name] = payload[field.name]
      }
    }
  }

  return declaredFields
}

