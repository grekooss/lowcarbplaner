'use client'

import { AsyncErrorFallback } from '@/components/shared/ErrorBoundary'

/**
 * MealPlanError - Error boundary dla strony Plan Posiłków
 *
 * Wyświetla komunikat błędu z możliwością ponownego spróbowania.
 */
export default function MealPlanError({
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
      featureName='Plan Posiłków'
    />
  )
}
