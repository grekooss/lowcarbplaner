/**
 * Onboarding Helper Functions
 *
 * Utility functions for onboarding flow validation and logic
 */

import type { OnboardingFormData } from '@/types/onboarding-view.types'

/**
 * Validates if all required fields for a given step are filled
 */
export function validateStep(
  step: number,
  formData: Partial<OnboardingFormData>
): boolean {
  switch (step) {
    case 1:
      return formData.gender !== null && formData.gender !== undefined
    case 2:
      return (
        formData.age !== null &&
        formData.age !== undefined &&
        formData.age >= 18 &&
        formData.age <= 100
      )
    case 3:
      return (
        formData.weight_kg !== null &&
        formData.weight_kg !== undefined &&
        formData.weight_kg >= 40 &&
        formData.weight_kg <= 300
      )
    case 4:
      return (
        formData.height_cm !== null &&
        formData.height_cm !== undefined &&
        formData.height_cm >= 140 &&
        formData.height_cm <= 250
      )
    case 5:
      return (
        formData.activity_level !== null &&
        formData.activity_level !== undefined
      )
    case 6:
      return formData.goal !== null && formData.goal !== undefined
    case 7:
      // Conditional step - only for weight loss
      if (formData.goal !== 'weight_loss') return true
      return (
        formData.weight_loss_rate_kg_week !== null &&
        formData.weight_loss_rate_kg_week !== undefined
      )
    case 8:
      return true // Summary step is always valid
    case 9:
      return formData.disclaimer_accepted === true
    default:
      return false
  }
}

/**
 * Gets the error message for an invalid step
 */
export function getStepError(
  step: number,
  formData: Partial<OnboardingFormData>
): string | undefined {
  if (validateStep(step, formData)) return undefined

  switch (step) {
    case 2:
      if (!formData.age) return 'Podaj swój wiek'
      if (formData.age < 18) return 'Musisz mieć co najmniej 18 lat'
      if (formData.age > 100) return 'Wiek nie może przekraczać 100 lat'
      return 'Nieprawidłowy wiek'
    case 3:
      if (!formData.weight_kg) return 'Podaj swoją wagę'
      if (formData.weight_kg < 40) return 'Waga musi wynosić co najmniej 40 kg'
      if (formData.weight_kg > 300) return 'Waga nie może przekraczać 300 kg'
      return 'Nieprawidłowa waga'
    case 4:
      if (!formData.height_cm) return 'Podaj swój wzrost'
      if (formData.height_cm < 140)
        return 'Wzrost musi wynosić co najmniej 140 cm'
      if (formData.height_cm > 250) return 'Wzrost nie może przekraczać 250 cm'
      return 'Nieprawidłowy wzrost'
    default:
      return 'To pole jest wymagane'
  }
}

/**
 * Calculates the next step number, skipping conditional steps if needed
 */
export function getNextStep(
  currentStep: number,
  goal: OnboardingFormData['goal']
): number {
  // Skip step 7 (weight loss rate) if goal is not weight loss
  if (currentStep === 6 && goal === 'weight_maintenance') {
    return 8
  }
  return currentStep + 1
}

/**
 * Calculates the previous step number, skipping conditional steps if needed
 */
export function getPreviousStep(
  currentStep: number,
  goal: OnboardingFormData['goal']
): number {
  // Skip step 7 (weight loss rate) when going back if goal is not weight loss
  if (currentStep === 8 && goal === 'weight_maintenance') {
    return 6
  }
  return currentStep - 1
}

/**
 * Gets the total number of steps based on the user's goal
 */
export function getTotalSteps(goal: OnboardingFormData['goal']): number {
  return goal === 'weight_loss' ? 10 : 9
}
