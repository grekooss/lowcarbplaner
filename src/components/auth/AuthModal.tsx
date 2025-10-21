/**
 * Modal z formularzem uwierzytelniania
 * Wyświetlany nad stroną /recipes przy nawigacji do /auth
 */

'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { AuthClient } from './AuthClient'
import type { AuthMode } from '@/types/auth-view.types'

interface AuthModalProps {
  /** Initial tab (login or register) */
  initialTab?: AuthMode
  /** Optional redirect path after successful login */
  redirectTo?: string
}

/**
 * Modal wyświetlający formularze logowania/rejestracji
 * Używany w intercepting route /recipes/(.)auth
 */
export function AuthModal({
  initialTab = 'login',
  redirectTo,
}: AuthModalProps) {
  const router = useRouter()

  const handleClose = (open: boolean) => {
    if (!open) {
      router.back()
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] max-w-md overflow-y-auto p-6'>
        <VisuallyHidden>
          <DialogTitle>
            {initialTab === 'login' ? 'Logowanie' : 'Rejestracja'}
          </DialogTitle>
        </VisuallyHidden>
        <AuthClient initialTab={initialTab} redirectTo={redirectTo} />
      </DialogContent>
    </Dialog>
  )
}
