/**
 * Loading UI dla strony Profil
 * Wyświetla spinner podczas ładowania danych
 */

import { Loader2 } from 'lucide-react'

export default function ProfileLoading() {
  return (
    <main className='flex min-h-[60vh] items-center justify-center'>
      <Loader2 className='h-12 w-12 animate-spin text-red-600' />
    </main>
  )
}
