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
  /** When true, closing navigates to home instead of back */
  isStandalonePage?: boolean
}

/**
 * Modal wyświetlający formularze logowania/rejestracji
 * Używany w intercepting route /recipes/(.)auth
 */
export function AuthModal({
  initialTab = 'login',
  redirectTo,
  isStandalonePage = false,
}: AuthModalProps) {
  const router = useRouter()

  const handleClose = (open: boolean) => {
    if (!open) {
      if (isStandalonePage) {
        router.push('/')
      } else {
        router.back()
      }
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent
        coverMainPanelOnMobile
        className='max-h-[90vh] overflow-y-auto rounded-lg border-2 border-[var(--glass-border)] bg-white/40 p-0 shadow-[var(--shadow-elevated)] backdrop-blur-[20px] sm:max-w-sm sm:rounded-2xl lg:rounded-3xl'
        // Zamykanie tylko przez X, nie przez kliknięcie poza modalem
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>
            {initialTab === 'login' ? 'Logowanie' : 'Rejestracja'}
          </DialogTitle>
        </VisuallyHidden>
        <div className='p-4 sm:p-6'>
          <AuthClient initialTab={initialTab} redirectTo={redirectTo} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
