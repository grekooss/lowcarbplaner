import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { MealPrepPageClient, MealPrepSkeleton } from '@/components/meal-prep'

export const metadata = {
  title: 'Gotowanie | LowCarb Planer',
  description: 'Sesje przygotowania posiłków i batch cooking',
}

export default async function CookingPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/meal-prep/cooking')
  }

  return (
    <div className='container mx-auto max-w-5xl px-4 py-6'>
      <Suspense fallback={<MealPrepSkeleton />}>
        <MealPrepPageClient userId={user.id} />
      </Suspense>
    </div>
  )
}
