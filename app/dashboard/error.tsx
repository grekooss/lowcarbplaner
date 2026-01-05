'use client'

import { AsyncErrorFallback } from '@/components/shared/ErrorBoundary'

/**
 * DashboardError - Error boundary dla strony Dashboard
 *
 * Wyświetla komunikat błędu z możliwością ponownego spróbowania.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <AsyncErrorFallback error={error} reset={reset} featureName='Dashboard' />
  )
}
