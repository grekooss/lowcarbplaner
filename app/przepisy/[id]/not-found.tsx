/**
 * Not Found page dla szczegółów przepisu
 *
 * Wyświetlana gdy przepis o danym ID nie istnieje.
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function RecipeNotFound() {
  return (
    <div className='mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center'>
      <h1 className='text-muted-foreground mb-4 text-6xl font-bold'>404</h1>
      <h2 className='mb-4 text-3xl font-bold'>Przepis nie znaleziony</h2>
      <p className='text-muted-foreground mb-8 text-lg'>
        Przepis, którego szukasz, nie istnieje lub został usunięty.
      </p>

      <Button size='lg' asChild>
        <Link href='/przepisy' className='flex items-center gap-2'>
          <ArrowLeft className='h-4 w-4' />
          Wróć do przepisów
        </Link>
      </Button>
    </div>
  )
}
