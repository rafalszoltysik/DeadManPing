import { NextResponse } from 'next/server'

/**
 * Create a standardized error response
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
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Create a conflict response with latest data (for optimistic locking)
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
 * Create a not found response
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse {
  return errorResponse(`${resource} not found`, 404)
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, 401)
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return errorResponse(message, 403)
}

/**
 * Create a bad request response
 */
export function badRequestResponse(message: string, details?: any): NextResponse {
  return errorResponse(message, 400, details)
}

