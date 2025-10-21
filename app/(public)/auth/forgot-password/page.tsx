/**
 * Forgot Password Page (Server Component)
 *
 * Page for requesting password reset email
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ForgotPasswordClient } from './ForgotPasswordClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resetowanie hasła | LowCarbPlaner',
  description: 'Zresetuj swoje hasło do LowCarbPlaner.',
}

/**
 * Strona resetowania hasła (wysyłka email)
 */
export default function ForgotPasswordPage() {
  return (
    <main className='flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-6'>
        {/* Back link */}
        <Link
          href='/auth'
          className='text-muted-foreground hover:text-foreground focus:ring-ring inline-flex items-center gap-2 rounded text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none'
        >
          <ArrowLeft className='h-4 w-4' />
          Powrót do logowania
        </Link>

        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Resetowanie hasła
          </h1>
          <p className='text-muted-foreground'>
            Podaj swój email, a wyślemy Ci link do zresetowania hasła.
          </p>
        </div>

        {/* Form */}
        <ForgotPasswordClient />
      </div>
    </main>
  )
}
