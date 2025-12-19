/**
 * Onboarding Page (Server Component)
 *
 * Multi-step wizard for new users to complete profile setup
 * Redirects to dashboard if profile already exists
 */

import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { OnboardingClient } from '@/components/onboarding/OnboardingClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rozpocznij swoją podróż | LowCarbPlaner',
  description:
    'Uzupełnij swoje dane, aby otrzymać spersonalizowany plan żywieniowy niskowęglowodanowy dostosowany do Twoich celów i stylu życia.',
}

export default async function OnboardingPage() {
  // Check authentication
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Redirect to auth if not authenticated
  if (authError || !user) {
    redirect('/auth')
  }

  // Check if user has completed onboarding (has accepted disclaimer)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('disclaimer_accepted_at')
    .eq('id', user.id)
    .maybeSingle()

  // If onboarding completed, redirect to dashboard
  if (profile?.disclaimer_accepted_at && !profileError) {
    redirect('/dashboard')
  }

  return <OnboardingClient />
}
