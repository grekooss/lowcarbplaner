/**
 * Loading UI dla strony Plan Posiłków
 * Skeleton placeholder podczas ładowania danych
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

/**
 * Skeleton dla WeekTable (desktop)
 */
const WeekTableSkeleton = () => {
  return (
    <div className='hidden overflow-x-auto md:block'>
      <table className='w-full border-collapse'>
        <thead>
          <tr>
            <th className='bg-muted/50 border-border min-w-[120px] border-b-2 p-2 text-left text-sm font-semibold'>
              <Skeleton className='h-4 w-20' />
            </th>
            {[...Array(7)].map((_, i) => (
              <th
                key={i}
                className='bg-muted/50 border-border min-w-[200px] border-b-2 p-2 text-center text-sm font-semibold'
              >
                <div className='flex flex-col items-center gap-1'>
                  <Skeleton className='h-3 w-16' />
                  <Skeleton className='h-4 w-12' />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(3)].map((_, rowIndex) => (
            <tr key={rowIndex} className='border-border border-b'>
              <td className='bg-muted/30 p-2'>
                <Skeleton className='h-4 w-16' />
              </td>
              {[...Array(7)].map((_, colIndex) => (
                <td key={colIndex} className='p-2'>
                  <Card className='flex h-32 flex-col justify-end p-3'>
                    <Skeleton className='mb-2 h-4 w-full' />
                    <Skeleton className='h-3 w-16' />
                  </Card>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Skeleton dla DayList (mobile)
 */
const DayListSkeleton = () => {
  return (
    <div className='block flex flex-col gap-6 md:hidden'>
      {[...Array(7)].map((_, dayIndex) => (
        <Card key={dayIndex} className='p-4'>
          <div className='mb-4'>
            <Skeleton className='h-6 w-40' />
          </div>
          <div className='space-y-3'>
            {[...Array(3)].map((_, mealIndex) => (
              <Card key={mealIndex} className='p-4'>
                <Skeleton className='mb-3 h-4 w-20' />
                <div className='flex gap-4'>
                  <Skeleton className='h-24 w-24 flex-shrink-0 rounded-lg' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-3 w-3/4' />
                    <div className='mt-3 flex gap-2'>
                      <Skeleton className='h-8 flex-1' />
                      <Skeleton className='h-8 w-20' />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

/**
 * Loading component dla całej strony
 */
export default function MealPlanLoading() {
  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <Skeleton className='mb-2 h-9 w-48' />
        <Skeleton className='h-5 w-64' />
      </div>

      {/* Desktop skeleton */}
      <WeekTableSkeleton />

      {/* Mobile skeleton */}
      <DayListSkeleton />
    </main>
  )
}
