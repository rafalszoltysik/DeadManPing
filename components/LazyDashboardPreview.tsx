'use client'

import dynamic from 'next/dynamic'

// Client-side only wrapper for DashboardPreview
const LazyDashboardPreview = dynamic(() => import('@/components/DashboardPreview').then(mod => ({ default: mod.DashboardPreview })), {
  loading: () => (
    <div className="max-w-5xl mx-auto px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Monitor Everything in One Place</h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Real-time status updates and instant alerts for all your cron jobs
        </p>
      </div>
      <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-xl animate-pulse h-96"></div>
    </div>
  ),
  ssr: false, // Client-side only to reduce initial bundle
})

export default function LazyDashboardPreviewWrapper() {
  return <LazyDashboardPreview />
}

