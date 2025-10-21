/**
 * Root Page - Przekierowanie
 *
 * Logika przekierowań:
 * - Niezalogowani → /recipes (publiczne przepisy)
 * - Zalogowani bez onboardingu → /onboarding
 * - Zalogowani po onboardingu → /dashboard
 */

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Niezalogowany → recipes (publiczne przepisy)
  if (!user) {
    redirect('/recipes')
  }

  // Zalogowany → sprawdź czy ukończył onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('disclaimer_accepted_at')
    .eq('id', user.id)
    .maybeSingle()

  const hasCompletedOnboarding = !!profile?.disclaimer_accepted_at

  // Przekieruj w zależności od statusu onboardingu
  redirect(hasCompletedOnboarding ? '/dashboard' : '/onboarding')
}
