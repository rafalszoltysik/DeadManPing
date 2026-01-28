// Injected by Sentry
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimize package imports for better tree-shaking
  experimental: {
    optimizePackageImports: ['react-icons', 'react-icons/fa'],
    // Enable more aggressive code splitting
    // optimizeCss: true, // Disabled due to critters module resolution issues in Next.js 15
  },
  
  // Performance optimizations
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Remove console.log in production for smaller bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Exclude Supabase functions from Next.js build (they use Deno)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    config.module.rules.push({
      test: /supabase\/functions\/.*\.ts$/,
      use: 'ignore-loader',
    })
    return config
  },
  
  // Security headers
  async headers() {
    // Allow 'unsafe-eval' only in development (needed for webpack HMR and source maps)
    // In production, this is disabled for security
    const isDevelopment = process.env.NODE_ENV === 'development'
    const scriptSrc = isDevelopment
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com"
      : "script-src 'self' 'unsafe-inline' https://js.stripe.com"
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-eval' only in development (webpack HMR requires it)
              // 'unsafe-inline' kept only for Stripe compatibility (Stripe.js requires it)
              // TODO: Consider implementing nonces for better security
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.pwnedpasswords.com https://api.stripe.com https://*.posthog.com https://eu.i.posthog.com https://us.i.posthog.com https://*.sentry.io https://*.ingest.sentry.io",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "frame-ancestors 'none'",
              // Additional security
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

// Dynamic Sentry configuration based on environment
const isProduction = process.env.NODE_ENV === 'production'

// Wrap with Sentry
module.exports = withSentryConfig(
  nextConfig,
  {
    // Sentry options
    silent: true,
    org: process.env.SENTRY_ORG || 'deadmanping',
    project: process.env.SENTRY_PROJECT || 'deadmanping',
    
    // Only upload source maps in production
    widenClientFileUpload: isProduction,
    hideSourceMaps: isProduction,
    // Disable Sentry plugins in development (faster builds)
    disableServerWebpackPlugin: !isProduction,
    disableClientWebpackPlugin: !isProduction,
  },
  {
    // Sentry webpack plugin options
    hideSourceMaps: isProduction,
  }
)

