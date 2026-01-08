import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Spiżarnia | LowCarb Planer',
  description: 'Zarządzaj dostępnymi składnikami w spiżarni i lodówce',
}

function PantrySkeleton() {
  return (
    <div className='space-y-6'>
      <div className='h-8 w-48 animate-pulse rounded-lg bg-white/40' />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className='h-32 animate-pulse rounded-xl border-2 border-white bg-white/40'
          />
        ))}
      </div>
    </div>
  )
}

export default async function PantryPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/pantry')
  }

  return (
    <div className='container mx-auto max-w-5xl px-4 py-6'>
      <Suspense fallback={<PantrySkeleton />}>
        <div className='space-y-6'>
          <div className='rounded-2xl border-2 border-white bg-white/40 p-6 backdrop-blur-xl'>
            <h2 className='text-text-main mb-4 text-xl font-bold'>Spiżarnia</h2>
            <p className='text-text-secondary'>
              Tutaj będziesz mógł zarządzać składnikami, które masz w domu.
              Funkcjonalność w przygotowaniu.
            </p>
          </div>
        </div>
      </Suspense>
    </div>
  )
}
