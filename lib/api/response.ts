/**
 * Standardized API response helpers for consistent error and success formats.
 * 
 * Provides utility functions for creating HTTP responses with proper status codes
 * and error messages. Used across all API routes for consistent response formatting.
 * Supports conflict responses for optimistic locking scenarios.
 * 
 * Does not handle request processing - only response formatting.
 */

import { NextResponse } from 'next/server'

/**
 * Creates a standardized error response with optional details.
 * 
 * @param error - Error message string
 * @param status - HTTP status code (defaults to 500)
 * @param details - Optional additional error details
 * @returns NextResponse with error JSON
 */
export function errorResponse(
  error: string,
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Creates a standardized success response with data.
 * 
 * @param data - Response data payload
 * @param status - HTTP status code (defaults to 200)
 * @returns NextResponse with data JSON
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Creates a conflict response for optimistic locking scenarios.
 * 
 * Returns 409 status with latest data to allow client to resolve conflicts.
 * 
 * @param error - Conflict error message
 * @param latestData - Latest version of the resource
 * @returns NextResponse with conflict status and latest data
 */
export function conflictResponse<T>(
  error: string,
  latestData: T
): NextResponse {
  return NextResponse.json(
    {
      error,
      conflict: true,
      ...(typeof latestData === 'object' && latestData !== null
        ? latestData
        : { latestData }),
    },
    { status: 409 }
  )
}

/**
 * Creates a 404 not found response.
 * 
 * @param resource - Resource name for error message
 * @returns NextResponse with 404 status
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse {
  return errorResponse(`${resource} not found`, 404)
}

/**
 * Creates a 401 unauthorized response.
 * 
 * @param message - Unauthorized message
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, 401)
}

/**
 * Creates a 403 forbidden response.
 * 
 * @param message - Forbidden message
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return errorResponse(message, 403)
}

/**
 * Creates a 400 bad request response with optional details.
 * 
 * @param message - Bad request message
 * @param details - Optional validation error details
 * @returns NextResponse with 400 status
 */
export function badRequestResponse(message: string, details?: any): NextResponse {
  return errorResponse(message, 400, details)
}

