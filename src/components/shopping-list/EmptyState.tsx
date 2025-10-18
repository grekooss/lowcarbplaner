import { ShoppingBasket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * EmptyState - Komponent wyświetlany gdy brak produktów na liście
 *
 * Wyświetlany gdy brak zaplanowanych posiłków lub wszystkie posiłki
 * bez przepisów. Zawiera CTA do generowania planu posiłków.
 */
export const EmptyState = () => {
  return (
    <div className='flex flex-col items-center justify-center px-4 py-16 text-center'>
      <div className='bg-muted mb-6 rounded-full p-6'>
        <ShoppingBasket className='text-muted-foreground h-12 w-12' />
      </div>
      <h3 className='mb-2 text-xl font-semibold'>Brak produktów na liście</h3>
      <p className='text-muted-foreground mb-6 max-w-md'>
        Wygeneruj plan posiłków, aby stworzyć listę zakupów na nadchodzący
        tydzień.
      </p>
      <Button asChild>
        <Link href='/dashboard'>Przejdź do planu posiłków</Link>
      </Button>
    </div>
  )
}
