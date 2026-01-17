'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card border border-border rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Something went wrong!</h2>
          <p className="mt-2 text-muted-foreground">{error.message || 'An unexpected error occurred'}</p>
          <button
            onClick={reset}
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-smooth"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}

