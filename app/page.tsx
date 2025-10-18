/**
 * Landing Page - Strona Główna
 *
 * Prosta strona powitalna z przekierowaniem do dashboard
 */

// TYMCZASOWO WYŁĄCZONE - Autoryzacja
// import { redirect } from 'next/navigation'
// import { createServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function HomePage() {
  // TYMCZASOWO WYŁĄCZONE - Sprawdź czy użytkownik jest zalogowany
  // const supabase = await createServerClient()
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // // Jeśli zalogowany → przekieruj do dashboard
  // if (user) {
  //   redirect('/dashboard')
  // }

  // Landing page dla niezalogowanych
  return (
    <div className='container mx-auto flex min-h-screen flex-col items-center justify-center px-4'>
      <div className='max-w-2xl space-y-8 text-center'>
        {/* Header */}
        <div className='space-y-4'>
          <h1 className='text-5xl font-bold tracking-tight'>
            LowCarb<span className='text-primary'>Planer</span>
          </h1>
          <p className='text-muted-foreground text-xl'>
            Planowanie diety niskowęglowodanowej stało się prostsze
          </p>
        </div>

        {/* Features */}
        <div className='grid gap-6 sm:grid-cols-3'>
          <div className='space-y-2'>
            <div className='text-3xl'>📊</div>
            <h3 className='font-semibold'>Śledź Makra</h3>
            <p className='text-muted-foreground text-sm'>
              Monitoruj kalorie, białko, węglowodany i tłuszcze
            </p>
          </div>
          <div className='space-y-2'>
            <div className='text-3xl'>🍽️</div>
            <h3 className='font-semibold'>Planuj Posiłki</h3>
            <p className='text-muted-foreground text-sm'>
              Twórz spersonalizowany plan żywieniowy
            </p>
          </div>
          <div className='space-y-2'>
            <div className='text-3xl'>📱</div>
            <h3 className='font-semibold'>Dostęp Wszędzie</h3>
            <p className='text-muted-foreground text-sm'>
              Korzystaj na komputerze i urządzeniach mobilnych
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
          <Button size='lg' asChild>
            <Link href='/login'>Zaloguj się</Link>
          </Button>
          <Button size='lg' variant='outline' asChild>
            <Link href='/recipes'>Przeglądaj Przepisy</Link>
          </Button>
        </div>

        {/* Footer Info */}
        <p className='text-muted-foreground text-sm'>
          Rozpocznij swoją podróż ku zdrowszemu życiu już dziś
        </p>
      </div>
    </div>
  )
}
