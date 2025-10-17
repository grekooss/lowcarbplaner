/**
 * ViewModels dla widoku Dashboard
 *
 * Typy pomocnicze do reprezentowania danych w UI,
 * transformowane z DTO na potrzeby komponentów.
 */

import type { PlannedMealDTO } from './dto.types'

/**
 * Model danych dla sekcji pasków postępu makroskładników
 *
 * @example
 * ```tsx
 * const macros: DailyMacrosViewModel = {
 *   consumed: { calories: 1200, protein_g: 80, carbs_g: 20, fats_g: 85 },
 *   target: { calories: 1800, protein_g: 120, carbs_g: 30, fats_g: 140 }
 * }
 * ```
 */
export interface DailyMacrosViewModel {
  consumed: {
    calories: number
    protein_g: number
    carbs_g: number
    fats_g: number
  }
  target: {
    calories: number
    protein_g: number
    carbs_g: number
    fats_g: number
  }
}

/**
 * Model danych dla posiłków pogrupowanych według typu
 *
 * Ułatwia renderowanie posiłków w widoku dziennym,
 * gdzie każdy typ posiłku jest osobno wyświetlany.
 *
 * @example
 * ```tsx
 * const dailyMeals: DailyMealsViewModel = {
 *   date: '2025-10-15',
 *   breakfast: plannedMealDTO,
 *   lunch: plannedMealDTO,
 *   dinner: null
 * }
 * ```
 */
export interface DailyMealsViewModel {
  date: string // YYYY-MM-DD
  breakfast: PlannedMealDTO | null
  lunch: PlannedMealDTO | null
  dinner: PlannedMealDTO | null
}

/**
 * Model pojedynczego dnia w kalendarzu
 *
 * Zawiera wszystkie informacje potrzebne do renderowania
 * przycisku dnia w komponencie CalendarStrip.
 *
 * @example
 * ```tsx
 * const day: CalendarDayViewModel = {
 *   date: new Date('2025-10-15'),
 *   dayName: 'Śr',
 *   dayNumber: 15,
 *   monthName: 'Paź',
 *   isToday: true,
 *   isSelected: false
 * }
 * ```
 */
export interface CalendarDayViewModel {
  date: Date
  dayName: string // 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'
  dayNumber: number
  monthName: string // 'Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'
  isToday: boolean
  isSelected: boolean
}

/**
 * Stałe dla nazw dni tygodnia (polska lokalizacja)
 */
export const DAY_NAMES = ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'] as const

/**
 * Stałe dla nazw miesięcy (polska lokalizacja, skrócone)
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
] as const

/**
 * Helper function: Transformuje listę PlannedMealDTO na DailyMealsViewModel
 *
 * @param meals - Lista zaplanowanych posiłków z API
 * @param date - Data w formacie YYYY-MM-DD
 * @returns Pogrupowane posiłki według typu
 */
export function transformToDailyMeals(
  meals: PlannedMealDTO[],
  date: string
): DailyMealsViewModel {
  const breakfast = meals.find((m) => m.meal_type === 'breakfast') || null
  const lunch = meals.find((m) => m.meal_type === 'lunch') || null
  const dinner = meals.find((m) => m.meal_type === 'dinner') || null

  return {
    date,
    breakfast,
    lunch,
    dinner,
  }
}
