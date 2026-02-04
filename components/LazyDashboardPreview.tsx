/**
 * Lazy-loaded dashboard preview wrapper for performance.
 * 
 * Dynamically imports DashboardPreview component to reduce initial bundle size.
 * Client-side only (no SSR) since it's a marketing preview. Used on landing
 * page to defer loading of preview component until needed.
 * 
 * Does not render preview immediately - loads on demand.
 */

'use client'

import dynamic from 'next/dynamic'

// Client-side only wrapper for DashboardPreview
const LazyDashboardPreview = dynamic(() => import('@/components/DashboardPreview').then(mod => ({ default: mod.DashboardPreview })), {
  loading: () => null, // No skeleton loader - component appears when ready
  ssr: false, // Client-side only to reduce initial bundle
})

/**
 * Wraps lazy-loaded dashboard preview component.
 * 
 * @returns Lazy-loaded DashboardPreview component
 */
export default function LazyDashboardPreviewWrapper() {
  return <LazyDashboardPreview />
}

