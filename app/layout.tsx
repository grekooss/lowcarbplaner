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

export const metadata: Metadata = {
  title: 'LowCarbPlaner - Planowanie diety niskowęglowodanowej',
  description:
    'Automatyczne planowanie posiłków i śledzenie makroskładników dla diety low-carb',
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
