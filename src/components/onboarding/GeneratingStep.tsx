'use client'

/**
 * GeneratingStep Component
 *
 * Step 10: Meal plan generation
 * Displays loading state while generating 7-day meal plan
 */

import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface GeneratingStepProps {
  isError?: boolean
  errorMessage?: string
}

export function GeneratingStep({
  isError = false,
  errorMessage,
}: GeneratingStepProps) {
  if (isError) {
    return (
      <div className='space-y-6'>
        <div className='space-y-2'>
          <h2 className='text-foreground text-2xl font-semibold'>
            Wystąpił błąd
          </h2>
          <p className='text-muted-foreground text-sm'>
            Nie udało się wygenerować planu żywieniowego.
          </p>
        </div>

        <Alert variant='destructive'>
          <AlertDescription>
            {errorMessage ||
              'Wystąpił nieznany błąd. Spróbuj ponownie później.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h2 className='text-foreground text-2xl font-semibold'>
          Generujemy Twój plan żywieniowy
        </h2>
        <p className='text-muted-foreground text-sm'>
          To może potrwać kilka sekund...
        </p>
      </div>

      <div className='flex flex-col items-center justify-center space-y-4 py-12'>
        <Loader2 className='text-primary h-12 w-12 animate-spin' />
        <div className='space-y-1 text-center'>
          <p className='text-sm font-medium'>Tworzenie profilu</p>
          <p className='text-muted-foreground text-xs'>
            Analizujemy Twoje dane i dobieramy posiłki
          </p>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          Za chwilę zostaniesz przekierowany do kokpitu, gdzie będziesz mógł
          przeglądać swój spersonalizowany plan żywieniowy na najbliższe 7 dni.
        </AlertDescription>
      </Alert>
    </div>
  )
}
