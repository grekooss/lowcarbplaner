import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

// CSP is now managed by middleware.ts for nonce-based security
// See middleware.ts for the full CSP configuration

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // Enable compression for better performance
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pkjdgaqwdletfkvniljx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers (CSP is managed by middleware.ts for nonce support)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)
