/**
 * Forgot Password Page (Server Component)
 *
 * Page for requesting password reset email
 */

import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resetowanie hasła | LowCarbPlaner',
  description: 'Zresetuj swoje hasło do LowCarbPlaner.',
}

/**
 * Strona resetowania hasła (wysyłka email)
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordModal />
}
