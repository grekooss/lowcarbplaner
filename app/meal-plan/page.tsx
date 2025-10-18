/**
 * MealPlanPage - Strona widoku Plan Posiłków
 * Server Component odpowiedzialny za initial data fetching
 */

// import { createServerClient } from '@/lib/supabase/server'
import { getPlannedMeals } from '@/lib/actions/planned-meals'
import { MealPlanClient } from '@/components/meal-plan/MealPlanClient'
// import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plan Posiłków - LowCarbPlaner',
  description: 'Twój 7-dniowy plan posiłków niskowęglowodanowych',
}

/**
 * Główna strona widoku Plan Posiłków
 * Pobiera posiłki na 7 dni (od dziś) i przekazuje do MealPlanClient
 */
export default async function MealPlanPage() {
  // TODO: Odkomentuj po zakończeniu pracy nad UI
  // const supabase = await createServerClient()
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // // Przekieruj jeśli nie zalogowany
  // if (!user) {
  //   redirect('/login')
  // }

  // Oblicz zakres dat (dziś + 6 dni)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 6)

  const startDateStr = today.toISOString().split('T')[0] || ''
  const endDateStr = endDate.toISOString().split('T')[0] || ''

  // Pobierz posiłki na 7 dni
  const mealsResult = await getPlannedMeals({
    start_date: startDateStr,
    end_date: endDateStr,
  })

  const meals = mealsResult.error ? [] : mealsResult.data || []

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Plan Posiłków</h1>
        <p className='text-muted-foreground mt-2'>
          Twój plan na najbliższe 7 dni
        </p>
      </div>

      <MealPlanClient initialMeals={meals} startDate={startDateStr} />
    </main>
  )
}
