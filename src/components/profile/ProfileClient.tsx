/**
 * ProfileClient (client component wrapper)
 *
 * Coordinates all profile sub-components with a modern layout
 * Features: Current targets card, profile edit form with onboarding components, feedback
 */

'use client'

import { PageHeader } from './PageHeader'
import { CurrentTargetsCard } from './CurrentTargetsCard'
import { ProfileEditForm } from './ProfileEditForm'
import { FeedbackCard } from './FeedbackCard'
import type { ProfileDTO } from '@/types/dto.types'

interface ProfileClientProps {
  initialProfile: ProfileDTO
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  return (
    <>
      <PageHeader />

      <div className='space-y-6'>
        {/* Main content grid - on desktop: targets on right (sticky), form on left */}
        <div className='flex flex-col-reverse gap-6 lg:flex-row'>
          {/* Profile edit form - full width on mobile, 2/3 on desktop */}
          <div className='w-full lg:w-2/3'>
            <ProfileEditForm initialData={initialProfile} />
          </div>

          {/* Current nutrition targets - sticky on desktop */}
          <div className='w-full lg:w-1/3'>
            <div className='lg:sticky lg:top-4'>
              <CurrentTargetsCard
                targets={{
                  target_calories: initialProfile.target_calories ?? 0,
                  target_protein_g: initialProfile.target_protein_g ?? 0,
                  target_carbs_g: initialProfile.target_carbs_g ?? 0,
                  target_fats_g: initialProfile.target_fats_g ?? 0,
                  macro_ratio: initialProfile.macro_ratio,
                }}
              />
            </div>
          </div>
        </div>

        {/* Feedback form */}
        <FeedbackCard />
      </div>
    </>
  )
}
