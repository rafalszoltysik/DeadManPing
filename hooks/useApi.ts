import { useState, useCallback } from 'react'

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  transform?: (data: any) => T
}

export interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (url: string, options?: RequestInit) => Promise<T | null>
  reset: () => void
}

/**
 * Generic hook for making API calls
 * Handles loading state, error handling, and data transformation
 */
export function useApi<T = any>(
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

