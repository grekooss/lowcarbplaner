/**
 * Modal z formularzem ustawiania nowego hasła
 * Używa tego samego Dialog co AuthModal dla spójnego pozycjonowania
 */

'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { ResetPasswordForm } from './ResetPasswordForm'
import { useAuth } from '@/hooks/useAuth'

/**
 * Modal wyświetlający formularz ustawiania nowego hasła
 * Pozycjonowanie identyczne jak AuthModal
 */
export function ResetPasswordModal() {
  const router = useRouter()
  const { updatePassword, isLoading, error } = useAuth()

  const handleClose = (open: boolean) => {
    if (!open) {
      router.push('/auth')
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent
        coverMainPanelOnMobile
        className='max-h-[90vh] overflow-y-auto rounded-lg border-2 border-[var(--glass-border)] bg-white/40 p-0 shadow-[var(--shadow-elevated)] backdrop-blur-[20px] sm:max-w-sm sm:rounded-2xl lg:rounded-3xl'
      >
        <VisuallyHidden>
          <DialogTitle>Ustaw nowe hasło</DialogTitle>
        </VisuallyHidden>
        <div className='space-y-3 p-4 sm:space-y-6 sm:p-6'>
          {/* Header */}
          <div className='space-y-1 sm:space-y-2'>
            <h1 className='text-xl font-bold tracking-tight sm:text-3xl'>
              Ustaw nowe hasło
            </h1>
            <p className='text-muted-foreground text-xs sm:text-base'>
              Wprowadź nowe hasło dla swojego konta.
            </p>
          </div>

          {/* Form */}
          <ResetPasswordForm
            onSubmit={updatePassword}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
