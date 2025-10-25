/**
 * Loading skeleton for Profile page
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ProfileLoading() {
  return (
    <div className='container mx-auto max-w-4xl px-4 py-8'>
      {/* PageHeader skeleton */}
      <div className='mb-8'>
        <Skeleton className='mb-2 h-10 w-64' />
        <Skeleton className='h-5 w-96' />
      </div>

      <div className='space-y-6'>
        {/* CurrentTargetsCard skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className='mb-2 h-6 w-48' />
            <Skeleton className='h-4 w-64' />
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className='h-24' />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ProfileEditForm skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-10 w-full' />
                </div>
              ))}
              <Skeleton className='h-10 w-full' />
            </div>
          </CardContent>
        </Card>

        {/* FeedbackCard skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className='mb-2 h-6 w-56' />
            <Skeleton className='h-4 w-72' />
          </CardHeader>
          <CardContent>
            <Skeleton className='mb-2 h-32 w-full' />
            <Skeleton className='mb-4 h-4 w-full' />
            <Skeleton className='h-10 w-full' />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
