/**
 * Dashboard Page (Server Component)
 *
 * Główna strona aplikacji - widok dzienny planu posiłków.
 * Server Component odpowiedzialny za initial data fetching.
 */

// TYMCZASOWO WYŁĄCZONE - Autoryzacja
// import { redirect } from 'next/navigation'
// import { createServerClient } from '@/lib/supabase/server'
import { getPlannedMeals } from '@/lib/actions/planned-meals'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

/**
 * Dashboard - route "/dashboard"
 *
 * 1. Sprawdza autentykację użytkownika
 * 2. Pobiera profil użytkownika (cele dzienne)
 * 3. Pobiera posiłki na dziś (initial load)
 * 4. Przekazuje dane do DashboardClient
 */
export default async function DashboardPage() {
  // 1. Utworzenie Supabase client - TYMCZASOWO WYŁĄCZONE
  // const supabase = await createServerClient()

  // 2. Sprawdzenie autentykacji - TYMCZASOWO WYŁĄCZONE
  // const {
  //   data: { user },
  //   error: authError,
  // } = await supabase.auth.getUser()

  // if (authError || !user) {
  //   redirect('/login')
  // }

  // Mock user dla testów (unused but kept for reference)
  // const user = { id: 'test-user-id' }

  // 3. Pobranie profilu użytkownika - TYMCZASOWO WYŁĄCZONE
  // const { data: profile, error: profileError } = await supabase
  //   .from('profiles')
  //   .select(
  //     'target_calories, target_protein_g, target_carbs_g, target_fats_g, disclaimer_accepted_at'
  //   )
  //   .eq('id', user.id)
  //   .single()

  // // Jeśli brak profilu lub nie zaakceptowano regulaminu → onboarding
  // if (profileError || !profile || !profile.disclaimer_accepted_at) {
  //   redirect('/onboarding')
  // }

  // Mock profile dla testów
  const profile = {
    target_calories: 1800,
    target_protein_g: 120,
    target_carbs_g: 30,
    target_fats_g: 140,
    disclaimer_accepted_at: new Date().toISOString(),
  }

  // 4. Pobranie posiłków na dziś (initial data)
  const today = new Date().toISOString().split('T')[0] ?? ''
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
