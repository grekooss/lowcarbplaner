/**
 * Types and ViewModels for Onboarding View
 *
 * Zawiera typy specyficzne dla widoku onboardingu, w tym:
 * - OnboardingFormData (stan formularza)
 * - OnboardingStepConfig (konfiguracja kroków)
 * - WeightLossOption (opcje tempa utraty wagi z walidacją)
 * - CalculatedTargets (obliczone cele żywieniowe)
 */

import type { Enums } from './database.types'

/**
 * Stan formularza onboardingu (client-side)
 */
export interface OnboardingFormData {
  gender: Enums<'gender_enum'> | null
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  activity_level: Enums<'activity_level_enum'> | null
  goal: Enums<'goal_enum'> | null
  weight_loss_rate_kg_week: number | null
  disclaimer_accepted: boolean
}

/**
 * Konfiguracja pojedynczego kroku
 */
export interface OnboardingStepConfig {
  id: string
  label: string
  description?: string
  isConditional?: boolean
  condition?: (formData: OnboardingFormData) => boolean
}

/**
 * Opcja tempa utraty wagi (z walidacją minimum kalorycznego)
 */
export interface WeightLossOption {
  value: number // 0.25, 0.5, 0.75, 1.0
  label: string // "0.5 kg/tydzień"
  description: string // "Umiarkowane tempo, zalecane"
  deficitPerDay: number // Deficyt kaloryczny dziennie
  isDisabled: boolean
  reasonDisabled?: string // "Ta opcja prowadzi do diety poniżej bezpiecznego minimum (1400 kcal)"
}

/**
 * Obliczone cele żywieniowe (preview w SummaryStep)
 */
export interface CalculatedTargets {
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
}

/**
 * Mapowanie activity_level na polskie nazwy
 */
export const ACTIVITY_LEVEL_LABELS: Record<
  Enums<'activity_level_enum'>,
  string
> = {
  very_low: 'Bardzo niska',
  low: 'Niska',
  moderate: 'Umiarkowana',
  high: 'Wysoka',
  very_high: 'Bardzo wysoka',
}

/**
 * Opisy poziomów aktywności
 */
export const ACTIVITY_LEVEL_DESCRIPTIONS: Record<
  Enums<'activity_level_enum'>,
  string
> = {
  very_low: 'Praca siedząca, brak aktywności fizycznej',
  low: 'Lekka aktywność 1-3 razy w tygodniu',
  moderate: 'Umiarkowana aktywność 3-5 razy w tygodniu',
  high: 'Intensywna aktywność 6-7 razy w tygodniu',
  very_high: 'Bardzo intensywna aktywność, praca fizyczna',
}

/**
 * Mapowanie goal na polskie nazwy
 */
export const GOAL_LABELS: Record<Enums<'goal_enum'>, string> = {
  weight_loss: 'Utrata wagi',
  weight_maintenance: 'Utrzymanie wagi',
}

/**
 * Opisy celów
 */
export const GOAL_DESCRIPTIONS: Record<Enums<'goal_enum'>, string> = {
  weight_loss: 'Chcę schudnąć i obniżyć wagę ciała',
  weight_maintenance: 'Chcę utrzymać obecną wagę',
}
