/**
 * ViewModels i typy dla widoku Plan Posiłków
 */

import type { PlannedMealDTO, RecipeDTO } from './dto.types'

/**
 * Model całego tygodniowego planu posiłków
 */
export interface WeekPlanViewModel {
  days: DayPlanViewModel[]
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

/**
 * Model planu posiłków dla pojedynczego dnia
 */
export interface DayPlanViewModel {
  date: string // YYYY-MM-DD
  dayName: string // 'Poniedziałek', 'Wtorek', 'Środa', etc.
  dayNumber: number // 1-31
  monthName: string // 'Sty', 'Lut', 'Mar', etc.
  isToday: boolean
  breakfast: PlannedMealDTO | null
  snack_morning: PlannedMealDTO | null
  lunch: PlannedMealDTO | null
  snack_afternoon: PlannedMealDTO | null
  dinner: PlannedMealDTO | null
}

/**
 * Stan modala z przepisem
 */
export interface RecipeModalState {
  isOpen: boolean
  recipe: RecipeDTO | null
}

/**
 * Typ posiłku (wszystkie możliwe wartości)
 */
export type MealType =
  | 'breakfast'
  | 'snack_morning'
  | 'lunch'
  | 'snack_afternoon'
  | 'dinner'

/**
 * Mapowanie typu posiłku na polską nazwę
 */
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Śniadanie',
  snack_morning: 'Przekąska poranna',
  lunch: 'Obiad',
  snack_afternoon: 'Przekąska popołudniowa',
  dinner: 'Kolacja',
}

/**
 * Kolejność posiłków w ciągu dnia
 */
export const MEAL_ORDER: MealType[] = [
  'breakfast',
  'snack_morning',
  'lunch',
  'snack_afternoon',
  'dinner',
]

/**
 * Mapowanie dni tygodnia na polskie nazwy
 */
export const DAY_NAMES = [
  'Niedziela',
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
]

/**
 * Mapowanie miesięcy na polskie skróty
 */
export const MONTH_NAMES = [
  'Sty',
  'Lut',
  'Mar',
  'Kwi',
  'Maj',
  'Cze',
  'Lip',
  'Sie',
  'Wrz',
  'Paź',
  'Lis',
  'Gru',
]
