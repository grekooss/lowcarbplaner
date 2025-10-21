/**
 * Reset Password Page (Server Component)
 *
 * Page for setting new password after clicking reset link from email
 */

import { ResetPasswordClient } from './ResetPasswordClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ustaw nowe hasło | LowCarbPlaner',
  description: 'Ustaw nowe hasło dla swojego konta LowCarbPlaner.',
}

/**
 * Strona ustawiania nowego hasła
 *
 * Dostęp przez link z email reset password
 * Token automatycznie obsługiwany przez Supabase
 */
export default function ResetPasswordPage() {
  return (
    <main className='flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-6'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Ustaw nowe hasło
          </h1>
          <p className='text-muted-foreground'>
            Wprowadź nowe hasło dla swojego konta.
          </p>
        </div>

        {/* Form */}
        <ResetPasswordClient />
      </div>
    </main>
  )
}
