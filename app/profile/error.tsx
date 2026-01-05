/**
 * Error boundary for Profile page
 */

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { logErrorLevel } from '@/lib/error-logger'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logErrorLevel(error, { source: 'page.profile.error' })
  }, [error])

  return (
    <div className='container mx-auto max-w-4xl px-4 py-8'>
      <Card className='border-destructive'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <AlertCircle className='text-destructive h-5 w-5' />
            <CardTitle className='text-destructive'>
              Błąd ładowania profilu
            </CardTitle>
          </div>
          <CardDescription>
            Wystąpił problem podczas ładowania Twojego profilu
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground text-sm'>
            {error.message || 'Nieoczekiwany błąd serwera'}
          </p>
          <Button onClick={reset} variant='outline'>
            Spróbuj ponownie
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
