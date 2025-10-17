/**
 * Komponent Skeleton dla Dashboard
 *
 * Wyświetlany podczas ładowania danych (loading state).
 */

'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton UI dla całego widoku Dashboard
 *
 * @example
 * ```tsx
 * {isLoading && <DashboardSkeleton />}
 * ```
 */
export function DashboardSkeleton() {
  return (
    <div className='container mx-auto space-y-8 px-4 py-8'>
      {/* Nagłówek skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-9 w-64' />
        <Skeleton className='h-5 w-96' />
      </div>

      {/* Kalendarz skeleton */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-7 w-40' />
          <div className='flex gap-1'>
            <Skeleton className='h-9 w-9' />
            <Skeleton className='h-9 w-9' />
          </div>
        </div>
        <div className='flex gap-2'>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className='h-20 w-20 rounded-lg' />
          ))}
        </div>
      </div>

      {/* Paski postępu skeleton */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-7 w-40' />
          <Skeleton className='h-5 w-32' />
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-5 w-32' />
              </div>
              <Skeleton className='h-2 w-full' />
              <div className='flex justify-end'>
                <Skeleton className='h-4 w-12' />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista posiłków skeleton */}
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-7 w-28' />
          <Skeleton className='h-5 w-32' />
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-3'>
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-5 w-20' />
              </CardHeader>
              <CardContent className='space-y-4'>
                <Skeleton className='aspect-video w-full rounded-lg' />
                <Skeleton className='h-6 w-full' />
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-5 w-16' />
                    <Skeleton className='h-5 w-20' />
                  </div>
                  <Skeleton className='h-4 w-full' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
