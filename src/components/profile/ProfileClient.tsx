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
        {/* Current nutrition targets */}
        <CurrentTargetsCard
          targets={{
            target_calories: initialProfile.target_calories,
            target_protein_g: initialProfile.target_protein_g,
            target_carbs_g: initialProfile.target_carbs_g,
            target_fats_g: initialProfile.target_fats_g,
          }}
        />

        {/* Profile edit form */}
        <ProfileEditForm initialData={initialProfile} />

        {/* Feedback form */}
        <FeedbackCard />
      </div>
    </>
  )
}
