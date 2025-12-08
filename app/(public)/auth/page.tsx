/**
 * Auth Page (Server Component)
 *
 * Main authentication page with login and registration
 * Redirects authenticated users to dashboard or onboarding
 */

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { AuthModal } from '@/components/auth/AuthModal'
import type { Metadata } from 'next'
import type { AuthMode } from '@/types/auth-view.types'

export const metadata: Metadata = {
  title: 'Logowanie | LowCarbPlaner',
  description:
    'Zaloguj się do LowCarbPlaner lub utwórz nowe konto, aby rozpocząć swoją niskowęglowodanową podróż.',
}

interface AuthPageProps {
  searchParams: Promise<{
    tab?: string
    redirect?: string
  }>
}

/**
 * Strona uwierzytelniania z logowaniem i rejestracją
 *
 * Funkcje:
 * - Sprawdzenie czy użytkownik jest zalogowany
 * - Redirect zalogowanych użytkowników (dashboard lub onboarding)
 * - Renderowanie AuthClient z odpowiednim tabem
 * - Obsługa redirect param z URL
 */
export default async function AuthPage({ searchParams }: AuthPageProps) {
  // Await searchParams in Next.js 15+
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
      // Use redirect param or default to dashboard
      const redirectTo = params.redirect || '/'
      redirect(redirectTo)
    }
  }

  // Determine initial tab (default: login)
  const initialTab: AuthMode = params.tab === 'register' ? 'register' : 'login'

  // Get redirect param for after login
  const redirectTo = params.redirect

  return (
    <AuthModal
      initialTab={initialTab}
      redirectTo={redirectTo}
      isStandalonePage
    />
  )
}
