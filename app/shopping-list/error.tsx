'use client'

import { AsyncErrorFallback } from '@/components/shared/ErrorBoundary'

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
    <AsyncErrorFallback
      error={error}
      reset={reset}
      featureName='Lista Zakupów'
    />
  )
}
