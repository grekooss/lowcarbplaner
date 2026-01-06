/**
 * Loading UI dla strony Lista Zakupów
 * Przezroczysty overlay ze spinnerem - nie zasłania całkowicie treści.
 */

import { Loader2 } from 'lucide-react'

export default function ShoppingListLoading() {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm'>
      <div className='rounded-2xl border-2 border-white bg-white/80 p-6 shadow-lg backdrop-blur-xl'>
        <Loader2 className='text-primary h-10 w-10 animate-spin' />
      </div>
    </div>
  )
}
