import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/react-query/query-provider'
import { Toaster } from '@/components/ui/sonner'
import { AppShell } from '@/components/layout/AppShell'

const poppins = Poppins({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '900'],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='pl'>
      <body className={`${poppins.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  )
}
