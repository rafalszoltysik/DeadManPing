import { useState, useCallback, FormEvent } from 'react'
import { useApi } from './useApi'

export interface UseFormOptions<T> {
  onSubmit: (data: T) => Promise<Response>
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  validate?: (data: T) => string | null
  resetOnSuccess?: boolean
}

export interface UseFormResult<T> {
  loading: boolean
  error: string | null
  success: boolean
  submit: (data: T) => Promise<void>
  handleSubmit: (e: FormEvent<HTMLFormElement>, getFormData: () => T) => Promise<void>
  reset: () => void
}

/**
 * Hook for handling form submissions with loading, error, and success states
 */
export function useForm<T = any>(
  options: UseFormOptions<T>
): UseFormResult<T> {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submit = useCallback(
    async (data: T) => {
      // Validate if validator provided
      if (options.validate) {
        const validationError = options.validate(data)
        if (validationError) {
          setError(validationError)
          setSuccess(false)
          options.onError?.(validationError)
          return
        }
      }

      setError(null)
      setSuccess(false)

      try {
        const response = await options.onSubmit(data)

        if (response.status === 401) {
          window.location.href = '/auth/login'
          return
        }

        const responseData = await response.json()

        if (!response.ok) {
          // Handle conflict responses (optimistic locking)
          if (response.status === 409 && responseData.conflict) {
            const errorMessage =
              responseData.error || 'Resource was modified. Please refresh and try again.'
            setError(errorMessage)
            setSuccess(false)
            options.onError?.(errorMessage)
            return
          }

          const errorMessage = responseData.error || 'An error occurred'
          setError(errorMessage)
          setSuccess(false)
          options.onError?.(errorMessage)
          return
        }

        setSuccess(true)
        setError(null)
        options.onSuccess?.(responseData)

        // Reset success message after delay if resetOnSuccess is true
        if (options.resetOnSuccess) {
          setTimeout(() => {
            setSuccess(false)
          }, 3000)
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        setSuccess(false)
        options.onError?.(errorMessage)
      }
    },
    [options]
  )

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>, getFormData: () => T) => {
      e.preventDefault()
      const data = getFormData()
      await submit(data)
    },
    [submit]
  )

  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  // Determine loading state from the submit function
  // We'll track this with a separate state since we can't easily determine
  // when the async operation completes from outside
  const [loading, setLoading] = useState(false)

  const submitWithLoading = useCallback(
    async (data: T) => {
      setLoading(true)
      try {
        await submit(data)
      } finally {
        setLoading(false)
      }
    },
    [submit]
  )

  const handleSubmitWithLoading = useCallback(
    async (e: FormEvent<HTMLFormElement>, getFormData: () => T) => {
      e.preventDefault()
      setLoading(true)
      try {
        const data = getFormData()
        await submit(data)
      } finally {
        setLoading(false)
      }
    },
    [submit]
  )

  return {
    loading,
    error,
    success,
    submit: submitWithLoading,
    handleSubmit: handleSubmitWithLoading,
    reset,
  }
}

