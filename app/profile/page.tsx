/**
 * Profile Settings Page (Server Component)
 *
 * Fetches user profile data and renders ProfileClient
 */

import { createServerClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/actions/profile'
import { ProfileClient } from '@/components/profile/ProfileClient'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profil i Ustawienia - LowCarbPlaner',
  description: 'Zarządzaj swoim profilem i ustawieniami aplikacji',
}

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Fetch user profile
  const profileResult = await getMyProfile()

  if (profileResult.error) {
    // If profile doesn't exist, redirect to onboarding
    if (profileResult.code === 'PROFILE_NOT_FOUND') {
      redirect('/onboarding')
    }
    // Other errors handled by error boundary
    throw new Error(profileResult.error)
  }

  // TypeScript narrowing - at this point we know data exists
  if (!profileResult.data) {
    throw new Error('Profile data is missing')
  }

  return (
    <main className='container mx-auto max-w-4xl px-4 py-8'>
      <ProfileClient initialProfile={profileResult.data} />
    </main>
  )
}
