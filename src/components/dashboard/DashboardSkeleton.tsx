/**
 * Komponent Loading Spinner dla Dashboard
 *
 * Wyświetlany podczas ładowania danych (loading state).
 */

'use client'

import { Loader2 } from 'lucide-react'

/**
 * Loading Spinner UI dla Dashboard
 *
 * @example
 * ```tsx
 * {isLoading && <DashboardSkeleton />}
 * ```
 */
export function DashboardSkeleton() {
  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <Loader2 className='h-12 w-12 animate-spin text-red-600' />
    </div>
  )
}
