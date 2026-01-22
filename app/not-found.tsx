import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="max-w-md w-full space-y-8 p-8 bg-card border border-border rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-foreground">404 - Page Not Found</h2>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-smooth"
        >
          Go Back
        </Link>
      </div>
    </div>
  )
}

