/**
 * Hook: useDailyMacros
 *
 * Oblicza zagregowane wartości makroskładników z posiłków oznaczonych jako zjedzonych.
 * Używa useMemo dla optymalizacji wydajności.
 */

import { useMemo } from 'react'
import type { PlannedMealDTO } from '@/types/dto.types'
import type { DailyMacrosViewModel } from '@/types/viewmodels'

interface UseDailyMacrosParams {
  meals: PlannedMealDTO[]
  targetCalories: number
  targetProteinG: number
  targetCarbsG: number
  targetFatsG: number
}

/**
 * Oblicza consumed i target macros na podstawie posiłków
 *
 * @param params - Parametry wejściowe (posiłki i cele dzienne)
 * @returns DailyMacrosViewModel z consumed i target
 *
 * @example
 * ```tsx
 * const macros = useDailyMacros({
 *   meals: plannedMeals,
 *   targetCalories: 1800,
 *   targetProteinG: 120,
 *   targetCarbsG: 30,
 *   targetFatsG: 140
 * })
 *
 * // macros.consumed.calories - suma z posiłków is_eaten: true
 * // macros.target.calories - 1800
 * ```
 */
export function useDailyMacros({
  meals,
  targetCalories,
  targetProteinG,
  targetCarbsG,
  targetFatsG,
}: UseDailyMacrosParams): DailyMacrosViewModel {
  return useMemo(() => {
    // Oblicz consumed z posiłków oznaczonych jako zjedzonych
    const consumed = meals
      .filter((meal) => meal.is_eaten)
      .reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.recipe.total_calories || 0),
          protein_g: acc.protein_g + (meal.recipe.total_protein_g || 0),
          carbs_g: acc.carbs_g + (meal.recipe.total_carbs_g || 0),
          fats_g: acc.fats_g + (meal.recipe.total_fats_g || 0),
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 }
      )

    // Zapewnij, że consumed nie jest ujemne (edge case)
    const safeConsumed = {
      calories: Math.max(0, consumed.calories),
      protein_g: Math.max(0, consumed.protein_g),
      carbs_g: Math.max(0, consumed.carbs_g),
      fats_g: Math.max(0, consumed.fats_g),
    }

    return {
      consumed: safeConsumed,
      target: {
        calories: targetCalories,
        protein_g: targetProteinG,
        carbs_g: targetCarbsG,
        fats_g: targetFatsG,
      },
    }
  }, [meals, targetCalories, targetProteinG, targetCarbsG, targetFatsG])
}
