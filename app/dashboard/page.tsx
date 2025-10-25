/**
 * Dashboard Page (Server Component)
 *
 * Główna strona aplikacji - widok dzienny planu posiłków.
 * Server Component odpowiedzialny za initial data fetching.
 */

import { getPlannedMeals } from '@/lib/actions/planned-meals'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Force dynamic rendering because of Supabase auth (cookies)
export const dynamic = 'force-dynamic'

/**
 * Dashboard - route "/dashboard"
 *
 * 1. Sprawdza autentykację użytkownika
 * 2. Pobiera profil użytkownika (cele dzienne)
 * 3. Pobiera posiłki na dziś (initial load)
 * 4. Przekazuje dane do DashboardClient
 */
export default async function DashboardPage() {
  // 1. Utworzenie Supabase client
  const supabase = await createServerClient()

  // 2. Sprawdzenie autentykacji
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth')
  }

  // 3. Pobranie profilu użytkownika
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      'target_calories, target_protein_g, target_carbs_g, target_fats_g, disclaimer_accepted_at'
    )
    .eq('id', user.id)
    .single()

  // Jeśli brak profilu lub nie zaakceptowano regulaminu → onboarding
  if (profileError || !profile || !profile.disclaimer_accepted_at) {
    redirect('/onboarding')
  }

  // 4. Pobranie posiłków na dziś (initial data)
  // Format daty lokalnie (bez konwersji do UTC)
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const today = formatLocalDate(todayDate)
  const mealsResult = await getPlannedMeals({
    start_date: today,
    end_date: today,
  })

  const initialMeals =
    mealsResult.error || !mealsResult.data ? [] : mealsResult.data

  // 5. Przygotowanie target macros
  const targetMacros = {
    target_calories: profile.target_calories || 1800,
    target_protein_g: profile.target_protein_g || 120,
    target_carbs_g: profile.target_carbs_g || 30,
    target_fats_g: profile.target_fats_g || 140,
  }

  return (
    <DashboardClient
      initialMeals={initialMeals}
      targetMacros={targetMacros}
      initialDate={today}
    />
  )
}
