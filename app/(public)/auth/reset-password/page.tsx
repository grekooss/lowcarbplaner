/**
 * Reset Password Page (Server Component)
 *
 * Page for setting new password after clicking reset link from email
 */

import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal'
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
  return <ResetPasswordModal />
}
