/**
 * Custom hook for profile edit form management
 *
 * Manages form state, validation, and submission for profile updates
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateMyProfile } from '@/lib/actions/profile'
import { toast } from 'sonner'
import type { ProfileDTO } from '@/types/dto.types'
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/lib/validation/profile'

export function useProfileForm(initialProfile: ProfileDTO) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      weight_kg: initialProfile.weight_kg,
      height_cm: initialProfile.height_cm,
      age: initialProfile.age,
      activity_level: initialProfile.activity_level,
      goal: initialProfile.goal,
      weight_loss_rate_kg_week:
        initialProfile.weight_loss_rate_kg_week ?? undefined,
      macro_ratio: initialProfile.macro_ratio,
    },
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsSubmitting(true)
    try {
      const result = await updateMyProfile(data)

      if (result.error) {
        toast.error('Błąd', {
          description: result.error,
        })
        return
      }

      toast.success('Sukces', {
        description:
          'Profil został zaktualizowany. Twoje cele żywieniowe zostały przeliczone. Plan posiłków zostanie wygenerowany ponownie.',
      })

      // Reload page to show updated targets
      window.location.reload()
    } catch {
      toast.error('Błąd', {
        description: 'Nie udało się zaktualizować profilu',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
