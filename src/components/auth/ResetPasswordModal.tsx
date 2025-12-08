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
        constrainToMainPanel
        className='max-h-[90vh] max-w-md overflow-y-auto rounded-[20px] border-2 border-[var(--glass-border)] bg-white/40 p-0 shadow-[var(--shadow-elevated)] backdrop-blur-[20px]'
      >
        <VisuallyHidden>
          <DialogTitle>Ustaw nowe hasło</DialogTitle>
        </VisuallyHidden>
        <div className='space-y-6 p-6'>
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
