import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { MealPrepPageClient } from '@/components/meal-prep/MealPrepPageClient'
import { MealPrepSkeleton } from '@/components/meal-prep/MealPrepSkeleton'

export const metadata = {
  title: 'Sesje gotowania | LowCarb Planer',
  description: 'Planuj i zarządzaj sesjami batch cooking',
}

export default async function MealPrepPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/meal-prep')
  }

  return (
    <div className='container mx-auto max-w-5xl px-4 py-6'>
      <Suspense fallback={<MealPrepSkeleton />}>
        <MealPrepPageClient userId={user.id} />
      </Suspense>
    </div>
  )
}
