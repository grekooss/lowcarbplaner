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
    <div className='flex flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/40 px-6 py-16 text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl'>
      <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100'>
        <ShoppingBasket className='h-10 w-10 text-gray-400' />
      </div>
      <h3 className='mb-2 text-xl font-bold text-gray-800'>
        Brak produktów na liście
      </h3>
      <p className='mb-8 max-w-md text-gray-500'>
        Wygeneruj plan posiłków, aby stworzyć listę zakupów na nadchodzący
        tydzień.
      </p>
      <Link
        href='/dashboard'
        className='inline-flex items-center gap-2 rounded-sm bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-500/20 transition-all hover:bg-red-700'
      >
        Przejdź do planu posiłków
        <ArrowRight className='h-4 w-4' />
      </Link>
    </div>
  )
}
