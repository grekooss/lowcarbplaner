/**
 * Modal z formularzem resetowania hasła
 * Używa tego samego Dialog co AuthModal dla spójnego pozycjonowania
 */

'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { useAuth } from '@/hooks/useAuth'

/**
 * Modal wyświetlający formularz resetowania hasła
 * Pozycjonowanie identyczne jak AuthModal
 */
export function ForgotPasswordModal() {
  const router = useRouter()
  const { resetPassword, isLoading, error } = useAuth()

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
          <DialogTitle>Resetowanie hasła</DialogTitle>
        </VisuallyHidden>
        <div className='space-y-6 p-6'>
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
          <ForgotPasswordForm
            onSubmit={resetPassword}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
