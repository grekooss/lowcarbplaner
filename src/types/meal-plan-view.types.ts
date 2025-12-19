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
  lunch: PlannedMealDTO | null
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
 * Mapowanie typu posiłku na polską nazwę
 */
export const MEAL_TYPE_LABELS: Record<
  'breakfast' | 'lunch' | 'dinner',
  string
> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
}

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
