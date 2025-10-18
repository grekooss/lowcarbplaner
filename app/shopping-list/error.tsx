'use client'

import { Button } from '@/components/ui/button'

/**
 * ShoppingListError - Error boundary dla strony Lista Zakupów
 *
 * Wyświetla komunikat błędu z możliwością ponownego spróbowania.
 */
export default function ShoppingListError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className='container mx-auto px-4 py-16 text-center'>
      <h1 className='mb-4 text-2xl font-bold'>
        Nie udało się załadować listy zakupów
      </h1>
      <p className='text-muted-foreground mb-8'>{error.message}</p>
      <Button onClick={reset}>Spróbuj ponownie</Button>
    </div>
  )
}
