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
      weight_kg: initialProfile.weight_kg ?? undefined,
      height_cm: initialProfile.height_cm ?? undefined,
      age: initialProfile.age ?? undefined,
      activity_level: initialProfile.activity_level ?? undefined,
      goal: initialProfile.goal ?? undefined,
      weight_loss_rate_kg_week:
        initialProfile.weight_loss_rate_kg_week ?? undefined,
      meal_plan_type: initialProfile.meal_plan_type,
      eating_start_time: initialProfile.eating_start_time,
      eating_end_time: initialProfile.eating_end_time,
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

  const handleSubmit = form.handleSubmit(onSubmit, (errors) => {
    console.error('Form validation errors:', errors)
    const firstError = Object.values(errors)[0]
    if (firstError?.message) {
      toast.error('Błąd walidacji', {
        description: firstError.message as string,
      })
    }
  })

  return {
    form,
    isSubmitting,
    onSubmit: handleSubmit,
  }
}
