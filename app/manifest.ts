/**
 * Web App Manifest (PWA)
 *
 * Konfiguruje aplikację jako Progressive Web App.
 * Umożliwia instalację na urządzeniach mobilnych.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LowCarbPlaner - Planowanie diety niskowęglowodanowej',
    short_name: 'LowCarbPlaner',
    description:
      'Automatyczne planowanie posiłków i śledzenie makroskładników dla diety low-carb i keto. Odkryj setki przepisów niskowęglowodanowych.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#dc2626',
    orientation: 'portrait-primary',
    categories: ['food', 'health', 'lifestyle'],
    lang: 'pl',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
      },
    ],
  }
}
