/**
 * Error Boundary dla widoku przeglądarki przepisów
 *
 * Obsługuje błędy w /przepisy route.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface RecipesErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RecipesError({ error, reset }: RecipesErrorProps) {
  useEffect(() => {
    // Log błędu do error reporting service
    console.error('Recipes page error:', error)
  }, [error])

  return (
    <div className='mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center'>
      <h1 className='mb-4 text-3xl font-bold'>Coś poszło nie tak</h1>
      <p className='text-muted-foreground mb-2 text-lg'>
        Wystąpił błąd podczas ładowania przepisów.
      </p>
      {error.message && (
        <p className='text-muted-foreground mb-8 text-sm'>{error.message}</p>
      )}

      <div className='flex gap-4'>
        <Button onClick={reset} size='lg'>
          Spróbuj ponownie
        </Button>
        <Button variant='outline' size='lg' asChild>
          <Link href='/'>Wróć do strony głównej</Link>
        </Button>
      </div>
    </div>
  )
}
