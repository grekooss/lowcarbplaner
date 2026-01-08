/**
 * 404 Not Found page for recipe slug routes
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChefHat, Home, Search } from 'lucide-react'

export default function RecipeNotFound() {
  return (
    <main className='flex min-h-[60vh] flex-col items-center justify-center px-4 text-center'>
      <ChefHat className='mb-6 h-20 w-20 text-gray-300' strokeWidth={1.5} />

      <h1 className='mb-2 text-2xl font-bold text-gray-800'>
        Przepis nie znaleziony
      </h1>

      <p className='mb-8 max-w-md text-gray-600'>
        Niestety nie udało się znaleźć tego przepisu. Możliwe, że został
        usunięty lub adres URL jest nieprawidłowy.
      </p>

      <div className='flex flex-col gap-3 sm:flex-row'>
        <Button asChild variant='default'>
          <Link href='/recipes'>
            <Search className='mr-2 h-4 w-4' />
            Przeglądaj przepisy
          </Link>
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
