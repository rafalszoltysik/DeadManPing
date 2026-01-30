'use client'

import dynamic from 'next/dynamic'

// Client-side only wrapper for DashboardPreview
const LazyDashboardPreview = dynamic(() => import('@/components/DashboardPreview').then(mod => ({ default: mod.DashboardPreview })), {
  loading: () => null, // No skeleton loader - component appears when ready
  ssr: false, // Client-side only to reduce initial bundle
})

export default function LazyDashboardPreviewWrapper() {
  return <LazyDashboardPreview />
}

