/**
 * Root Page - Przekierowanie
 *
 * Logika przekierowań:
 * - Niezalogowani → /recipes (publiczne przepisy)
 * - Zalogowani → /dashboard
 */

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  redirect(user ? '/dashboard' : '/recipes')
}
