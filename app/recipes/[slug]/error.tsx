'use client'

/**
 * Error boundary for recipe slug routes
 */

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RecipeError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Recipe page error:', error)
  }, [error])

  return (
    <main className='flex min-h-[60vh] flex-col items-center justify-center px-4 text-center'>
      <AlertTriangle
        className='text-primary mb-6 h-20 w-20'
        strokeWidth={1.5}
      />

      <h1 className='mb-2 text-2xl font-bold text-gray-800'>Wystąpił błąd</h1>

      <p className='mb-8 max-w-md text-gray-600'>
        Przepraszamy, wystąpił problem podczas ładowania przepisu. Spróbuj
        ponownie lub wróć do strony głównej.
      </p>

      <div className='flex flex-col gap-3 sm:flex-row'>
        <Button onClick={reset} variant='default'>
          <RotateCcw className='mr-2 h-4 w-4' />
          Spróbuj ponownie
        </Button>

        <Button asChild variant='outline'>
          <Link href='/'>
            <Home className='mr-2 h-4 w-4' />
            Strona główna
          </Link>
        </Button>
      </div>
    </main>
  )
}
