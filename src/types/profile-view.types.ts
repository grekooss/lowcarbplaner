/**
 * ViewModels and helpers for Profile Settings view
 */

import type { Enums } from './database.types'

/**
 * ViewModel for profile edit form
 */
export interface ProfileEditFormData {
  weight_kg: number
  activity_level: Enums<'activity_level_enum'>
  goal: Enums<'goal_enum'>
  weight_loss_rate_kg_week?: number | null
}

/**
 * ViewModel for feedback form
 */
export interface FeedbackFormData {
  content: string
}

/**
 * Activity level labels in Polish
 */
export const ACTIVITY_LEVEL_LABELS: Record<
  Enums<'activity_level_enum'>,
  string
> = {
  very_low: 'Bardzo niska (brak ćwiczeń)',
  low: 'Niska (1-2 razy w tygodniu)',
  moderate: 'Umiarkowana (3-5 razy w tygodniu)',
  high: 'Wysoka (6-7 razy w tygodniu)',
  very_high: 'Bardzo wysoka (sport zawodowy)',
}

/**
 * Goal labels in Polish
 */
export const GOAL_LABELS: Record<Enums<'goal_enum'>, string> = {
  weight_loss: 'Utrata wagi',
  weight_maintenance: 'Utrzymanie wagi',
}

/**
 * Weight loss rate option
 */
export interface WeightLossRateOption {
  value: number
  label: string
  description: string
}

/**
 * Weight loss rate options for select
 */
export const WEIGHT_LOSS_RATE_OPTIONS: WeightLossRateOption[] = [
  {
    value: 0.25,
    label: '0.25 kg/tydzień',
    description: 'Powolne i bezpieczne tempo',
  },
  {
    value: 0.5,
    label: '0.5 kg/tydzień',
    description: 'Zalecane tempo (deficyt ~500 kcal/dzień)',
  },
  {
    value: 0.75,
    label: '0.75 kg/tydzień',
    description: 'Szybkie tempo (deficyt ~750 kcal/dzień)',
  },
  {
    value: 1.0,
    label: '1.0 kg/tydzień',
    description: 'Bardzo szybkie tempo (deficyt ~1000 kcal/dzień)',
  },
]
