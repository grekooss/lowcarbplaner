/**
 * Modal prompt rejestracji/logowania
 *
 * Wyświetlany gdy niezalogowany użytkownik próbuje zobaczyć przepis.
 * Zapamiętuje recipeId i przekierowuje po loginie.
 */

'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AuthPromptModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  redirectRecipeId: number | null
}

/**
 * Komponent interaktywny modala rejestracji
 *
 * @example
 * ```tsx
 * const { isOpen, redirectRecipeId, closePrompt, getRedirectUrl } = useAuthPrompt()
 *
 * <AuthPromptModal
 *   isOpen={isOpen}
 *   onOpenChange={(open) => !open && closePrompt()}
 *   redirectRecipeId={redirectRecipeId}
 * />
 * ```
 */
export function AuthPromptModal({
  isOpen,
  onOpenChange,
  redirectRecipeId,
}: AuthPromptModalProps) {
  const router = useRouter()

  const handleSignup = () => {
    const redirectUrl = redirectRecipeId
      ? `/signup?redirect=/przepisy/${redirectRecipeId}`
      : '/signup'
    router.push(redirectUrl)
  }

  const handleLogin = () => {
    const redirectUrl = redirectRecipeId
      ? `/login?redirect=/przepisy/${redirectRecipeId}`
      : '/login'
    router.push(redirectUrl)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Zaloguj się, aby zobaczyć przepis</DialogTitle>
          <DialogDescription className='space-y-2 pt-2'>
            <p>
              Dołącz do LowCarbPlaner i uzyskaj dostęp do wszystkich przepisów
              oraz funkcji planowania diety.
            </p>
            <p className='text-sm'>
              ✨ Automatyczne planowanie posiłków
              <br />
              📊 Śledzenie makroskładników
              <br />
              🛒 Inteligentna lista zakupów
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='flex-col gap-2 sm:flex-col'>
          <Button onClick={handleSignup} className='w-full' size='lg'>
            Załóż konto
          </Button>
          <Button
            onClick={handleLogin}
            variant='outline'
            className='w-full'
            size='lg'
          >
            Zaloguj się
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
