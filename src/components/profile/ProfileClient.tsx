/**
 * ProfileClient (client component wrapper)
 *
 * Coordinates all profile sub-components and manages their interactions
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
        {/* Current nutrition targets + Profile edit form - side by side on desktop */}
        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Current nutrition targets - 1/3 width */}
          <div className='lg:col-span-1'>
            <CurrentTargetsCard
              targets={{
                target_calories: initialProfile.target_calories,
                target_protein_g: initialProfile.target_protein_g,
                target_carbs_g: initialProfile.target_carbs_g,
                target_fats_g: initialProfile.target_fats_g,
              }}
            />
          </div>

          {/* Profile edit form - 2/3 width */}
          <div className='lg:col-span-2'>
            <ProfileEditForm initialData={initialProfile} />
          </div>
        </div>

        {/* Feedback form */}
        <FeedbackCard />
      </div>
    </>
  )
}
