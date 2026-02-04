/**
 * Generic React hook for making API calls with state management.
 * 
 * Handles loading states, error handling, data transformation, and automatic
 * error tracking to Sentry. Provides execute function for making requests and
 * reset function for clearing state.
 * 
 * Does not handle authentication - redirects to login on 401 responses.
 */

import { useState, useCallback } from 'react'
import { captureApiError } from '@/lib/sentry/client'

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  transform?: (data: unknown) => T
}

export interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (url: string, options?: RequestInit) => Promise<T | null>
  reset: () => void
}

/**
 * Executes API calls with loading state, error handling, and data transformation.
 * 
 * Tracks errors to Sentry, handles 401 redirects, and supports optional data
 * transformation and success/error callbacks.
 * 
 * @param options - Configuration including callbacks and data transformer
 * @returns API state (data, loading, error) and execute/reset functions
 */
export function useApi<T = unknown>(
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (url: string, requestOptions?: RequestInit): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, {
          ...requestOptions,
          headers: {
            'Content-Type': 'application/json',
            ...requestOptions?.headers,
          },
        })

        // Handle 401 redirects
        if (response.status === 401) {
          window.location.href = '/auth/login'
          return null
        }

        const responseData = await response.json()

        if (!response.ok) {
          const errorMessage = responseData.error || 'An error occurred'
          setError(errorMessage)
          
          // Track API errors (4xx/5xx) to Sentry
          captureApiError(
            url,
            response.status,
            errorMessage,
            {
              action: 'api_call',
            }
          )
          
          options.onError?.(errorMessage)
          return null
        }

        const transformedData = options.transform
          ? options.transform(responseData)
          : (responseData as T)

        setData(transformedData)
        options.onSuccess?.(transformedData)
        return transformedData
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        
        // Track network/fetch errors to Sentry
        if (err instanceof Error) {
          captureApiError(
            url,
            0, // Network error, no status code
            err,
            {
              action: 'api_call',
            }
          )
        }
        
        options.onError?.(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

