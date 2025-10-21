/**
 * ForgotPasswordClient Component
 *
 * Client wrapper for forgot password form
 */

'use client'

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { useAuth } from '@/hooks/useAuth'

/**
 * Client component wrapper dla ForgotPasswordForm
 * Integruje form z hookiem useAuth
 */
export function ForgotPasswordClient() {
  const { resetPassword, isLoading, error } = useAuth()

  return (
    <ForgotPasswordForm
      onSubmit={resetPassword}
      isLoading={isLoading}
      error={error}
    />
  )
}
