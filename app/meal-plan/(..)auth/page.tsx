/**
 * Intercepting Route - Modal z uwierzytelnianiem
 *
 * Ten route przechwytuje nawigację z /meal-plan do /auth
 * i wyświetla modal zamiast pełnej strony.
 *
 * Wzorzec: (..)auth oznacza przechwycenie jeden poziom wyżej
 * (z app/meal-plan/ do app/(public)/auth/)
 */

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { AuthModal } from '@/components/auth/AuthModal'
import type { AuthMode } from '@/types/auth-view.types'

interface PageProps {
  searchParams: Promise<{
    tab?: string
    redirect?: string
  }>
}

/**
 * Intercepting route page - Modal z logowaniem/rejestracją
 */
export default async function AuthModalPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Check if user is already authenticated
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // If user is authenticated, check profile and redirect
  if (user && !authError) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('disclaimer_accepted_at')
      .eq('id', user.id)
      .maybeSingle()

    // Redirect based on profile completion
    if (!profile?.disclaimer_accepted_at) {
      redirect('/onboarding')
    } else {
      // Use redirect param or default to meal-plan
      const redirectTo = params.redirect || '/meal-plan'
      redirect(redirectTo)
    }
  }

  // Determine initial tab (default: login)
  const initialTab: AuthMode = params.tab === 'register' ? 'register' : 'login'

  // Get redirect param for after login
  const redirectTo = params.redirect

  return <AuthModal initialTab={initialTab} redirectTo={redirectTo} />
}
