/**
 * ResetPasswordClient Component
 *
 * Client wrapper for reset password form
 */

'use client'

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { useAuth } from '@/hooks/useAuth'

/**
 * Client component wrapper dla ResetPasswordForm
 * Integruje form z hookiem useAuth
 */
export function ResetPasswordClient() {
  const { updatePassword, isLoading, error } = useAuth()

  return (
    <ResetPasswordForm
      onSubmit={updatePassword}
      isLoading={isLoading}
      error={error}
    />
  )
}
