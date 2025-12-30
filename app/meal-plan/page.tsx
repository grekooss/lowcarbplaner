/**
 * MealPlanPage - Strona widoku Plan Posiłków
 * Server Component odpowiedzialny za initial data fetching
 */

import { redirect } from 'next/navigation'
import { getPlannedMeals } from '@/lib/actions/planned-meals'
import { MealPlanClient } from '@/components/meal-plan/MealPlanClient'
import { createServerClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { Enums } from '@/types/database.types'

// Force dynamic rendering because of Supabase auth (cookies)
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Plan Posiłków - LowCarbPlaner',
  description: 'Twój 7-dniowy plan posiłków niskowęglowodanowych',
}

/**
 * Główna strona widoku Plan Posiłków
 * Pobiera posiłki na 7 dni (od dziś) i przekazuje do MealPlanClient
 */
export default async function MealPlanPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Przekieruj jeśli nie zalogowany
  if (!user) {
    redirect('/auth')
  }

  // Pobierz profil użytkownika dla meal_plan_type
  const { data: profile } = await supabase
    .from('profiles')
    .select('meal_plan_type, selected_meals')
    .eq('id', user.id)
    .single()

  const mealPlanType: Enums<'meal_plan_type_enum'> =
    profile?.meal_plan_type ?? '3_main'
  const selectedMeals: Enums<'meal_type_enum'>[] | null =
    profile?.selected_meals ?? null

  // Oblicz zakres dat (dziś + 6 dni = łącznie 7 dni)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 6)

  // Format daty lokalnie (bez konwersji do UTC, która powoduje przesunięcie o 1 dzień)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const startDateStr = formatLocalDate(today)
  const endDateStr = formatLocalDate(endDate)

  // Pobierz posiłki na 7 dni
  const mealsResult = await getPlannedMeals({
    start_date: startDateStr,
    end_date: endDateStr,
  })

  const meals = mealsResult.error ? [] : mealsResult.data || []

  return (
    <div className='pb-6'>
      <MealPlanClient
        initialMeals={meals}
        startDate={startDateStr}
        mealPlanType={mealPlanType}
        selectedMeals={selectedMeals}
      />
    </div>
  )
}
