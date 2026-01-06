import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Montserrat } from 'next/font/google'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/react-query/query-provider'
import { Toaster } from '@/components/ui/sonner'
import { AppShell } from '@/components/layout/AppShell'
import { NonceProvider } from '@/lib/csp/nonce-context'

const montserrat = Montserrat({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowcarbplaner.pl'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'LowCarbPlaner - Planowanie diety niskowęglowodanowej',
    template: '%s | LowCarbPlaner',
  },
  description:
    'Automatyczne planowanie posiłków i śledzenie makroskładników dla diety low-carb i keto. Odkryj setki przepisów niskowęglowodanowych, oblicz swoje zapotrzebowanie kaloryczne i zaplanuj jadłospis na cały tydzień.',
  keywords: [
    'dieta niskowęglowodanowa',
    'dieta keto',
    'low-carb',
    'przepisy keto',
    'planowanie posiłków',
    'makroskładniki',
    'kalorie',
    'dieta odchudzająca',
    'przepisy niskowęglowodanowe',
    'jadłospis keto',
    'kalkulacja kalorii',
    'BMR',
    'TDEE',
  ],
  authors: [{ name: 'LowCarbPlaner' }],
  creator: 'LowCarbPlaner',
  publisher: 'LowCarbPlaner',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: siteUrl,
    siteName: 'LowCarbPlaner',
    title: 'LowCarbPlaner - Planowanie diety niskowęglowodanowej',
    description:
      'Automatyczne planowanie posiłków i śledzenie makroskładników dla diety low-carb i keto. Odkryj setki przepisów niskowęglowodanowych.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LowCarbPlaner - Planowanie diety niskowęglowodanowej',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LowCarbPlaner - Planowanie diety niskowęglowodanowej',
    description:
      'Automatyczne planowanie posiłków i śledzenie makroskładników dla diety low-carb i keto.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Dodaj po weryfikacji w Google Search Console:
    // google: 'your-google-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'food',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get the nonce from middleware headers
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') ?? undefined

  return (
    <html lang='pl'>
      <body
        className={`${montserrat.variable} ${geistMono.variable} antialiased`}
      >
        <NonceProvider nonce={nonce}>
          <QueryProvider>
            <AppShell>{children}</AppShell>
          </QueryProvider>
          <Toaster />
        </NonceProvider>
      </body>
    </html>
  )
}
