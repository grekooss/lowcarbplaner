'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function MealPrepSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <Skeleton className='h-9 w-48' />
        <Skeleton className='h-10 w-40' />
      </div>

      {/* Stats cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className='border-2 border-white/30 bg-white/20 backdrop-blur-md'
          >
            <CardContent className='p-4'>
              <Skeleton className='mb-2 h-4 w-24' />
              <Skeleton className='h-8 w-16' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sessions list */}
      <Card className='border-2 border-white/30 bg-white/20 backdrop-blur-md'>
        <CardHeader>
          <Skeleton className='h-6 w-40' />
        </CardHeader>
        <CardContent className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='flex items-center justify-between rounded-lg border border-white/20 p-4'
            >
              <div className='space-y-2'>
                <Skeleton className='h-5 w-32' />
                <Skeleton className='h-4 w-48' />
              </div>
              <Skeleton className='h-9 w-24' />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* New session planner */}
      <Card className='border-2 border-white/30 bg-white/20 backdrop-blur-md'>
        <CardHeader>
          <Skeleton className='h-6 w-56' />
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <div className='grid grid-cols-2 gap-4'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='flex items-center gap-3 rounded-lg border border-white/20 p-3'
                >
                  <Skeleton className='h-12 w-12 rounded' />
                  <div className='space-y-1'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-3 w-16' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
