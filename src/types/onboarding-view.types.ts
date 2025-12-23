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
  meal_plan_type: Enums<'meal_plan_type_enum'> | null
  macro_ratio: Enums<'macro_ratio_enum'> | null
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

/**
 * Mapowanie meal_plan_type na polskie nazwy
 */
export const MEAL_PLAN_TYPE_LABELS: Record<
  Enums<'meal_plan_type_enum'>,
  string
> = {
  '3_main_2_snacks': '3 główne + 2 przekąski',
  '3_main_1_snack': '3 główne + 1 przekąska',
  '3_main': '3 główne posiłki',
  '2_main': '2 główne posiłki',
}

/**
 * Opisy typów planu posiłków
 */
export const MEAL_PLAN_TYPE_DESCRIPTIONS: Record<
  Enums<'meal_plan_type_enum'>,
  string
> = {
  '3_main_2_snacks': 'Śniadanie, przekąska, obiad, przekąska, kolacja',
  '3_main_1_snack': 'Śniadanie, obiad, przekąska, kolacja',
  '3_main': 'Śniadanie, obiad, kolacja',
  '2_main': 'Obiad i kolacja (bez śniadania)',
}

/**
 * Mapowanie macro_ratio na polskie nazwy
 */
export const MACRO_RATIO_LABELS: Record<Enums<'macro_ratio_enum'>, string> = {
  '70_25_5': '70% tłuszcz / 25% białko / 5% węglowodany',
  '60_35_5': '60% tłuszcz / 35% białko / 5% węglowodany',
  '60_25_15': '60% tłuszcz / 25% białko / 15% węglowodany',
  '50_30_20': '50% tłuszcz / 30% białko / 20% węglowodany',
  '40_40_20': '40% tłuszcz / 40% białko / 20% węglowodany',
}

/**
 * Opisy proporcji makroskładników
 */
export const MACRO_RATIO_DESCRIPTIONS: Record<
  Enums<'macro_ratio_enum'>,
  string
> = {
  '70_25_5': 'Bardzo restrykcyjne keto - maksymalna ketoza',
  '60_35_5': 'Keto wysokobiałkowe - ketoza + budowa mięśni',
  '60_25_15': 'Standardowe keto - zalecane dla początkujących',
  '50_30_20': 'Umiarkowane low-carb - elastyczne podejście',
  '40_40_20': 'Wysokobiałkowe low-carb - dla aktywnych sportowo',
}

/**
 * Parsuje wartość enum macro_ratio na wartości procentowe
 */
export function parseMacroRatio(ratio: Enums<'macro_ratio_enum'>): {
  fats: number
  protein: number
  carbs: number
} {
  const parts = ratio.split('_').map(Number)
  const fats = parts[0] ?? 60
  const protein = parts[1] ?? 25
  const carbs = parts[2] ?? 15
  return {
    fats: fats / 100,
    protein: protein / 100,
    carbs: carbs / 100,
  }
}
