/**
 * Robots.txt dla SEO
 *
 * Konfiguruje dostęp crawlerów do strony.
 * Blokuje:
 * - Strony prywatne (dashboard, profile, meal-plan, shopping-list)
 * - Strony API
 * - Strony onboarding
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowcarbplaner.pl'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/recipes', '/recipes/', '/auth'],
        disallow: [
          '/dashboard',
          '/profile',
          '/meal-plan',
          '/shopping-list',
          '/onboarding',
          '/api/',
          '/_next/',
          '/test-recipes',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/recipes', '/recipes/'],
        disallow: [
          '/dashboard',
          '/profile',
          '/meal-plan',
          '/shopping-list',
          '/onboarding',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
