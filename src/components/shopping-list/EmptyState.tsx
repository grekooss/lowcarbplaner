import { ShoppingBasket, ArrowRight } from 'lucide-react'
import Link from 'next/link'

/**
 * EmptyState - Komponent wyświetlany gdy brak produktów na liście
 *
 * Wyświetlany gdy brak zaplanowanych posiłków lub wszystkie posiłki
 * bez przepisów. Zawiera CTA do generowania planu posiłków.
 */
export const EmptyState = () => {
  return (
    <div className='flex flex-col items-center justify-center rounded-md border-2 border-white bg-white/40 px-6 py-16 text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl sm:rounded-2xl'>
      <div className='bg-bg-tertiary mb-6 flex h-20 w-20 items-center justify-center rounded-2xl'>
        <ShoppingBasket className='text-text-muted h-10 w-10' />
      </div>
      <h3 className='text-text-main mb-2 text-xl font-bold'>
        Brak produktów na liście
      </h3>
      <p className='text-text-muted mb-8 max-w-md'>
        Wygeneruj plan posiłków, aby stworzyć listę zakupów na nadchodzący
        tydzień.
      </p>
      <Link
        href='/dashboard'
        className='bg-primary shadow-primary/20 hover:bg-primary-hover inline-flex items-center gap-2 rounded-sm px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all'
      >
        Przejdź do planu posiłków
        <ArrowRight className='h-4 w-4' />
      </Link>
    </div>
  )
}
