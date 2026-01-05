/**
 * Hook: useDailyMacros
 *
 * Oblicza zagregowane wartości makroskładników z posiłków oznaczonych jako zjedzonych.
 * Używa useMemo dla optymalizacji wydajności.
 *
 * IMPORTANT: Uwzględnia ingredient_overrides - dostosowane gramatury składników
 * w zaplanowanych posiłkach, co zapewnia dokładne obliczanie spożytych kalorii i makroskładników.
 */

import { useMemo } from 'react'
import type { PlannedMealDTO } from '@/types/dto.types'
import type { DailyMacrosViewModel } from '@/types/viewmodels'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'

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
    // WAŻNE: Używamy calculateRecipeNutritionWithOverrides aby uwzględnić
    // zmienione gramatury składników (ingredient_overrides)
    const consumed = meals
      .filter((meal) => meal.is_eaten)
      .reduce(
        (acc, meal) => {
          // Przelicz wartości odżywcze z uwzględnieniem ingredient_overrides
          const adjustedNutrition = calculateRecipeNutritionWithOverrides(
            meal.recipe,
            meal.ingredient_overrides
          )

          return {
            calories: acc.calories + adjustedNutrition.calories,
            protein_g: acc.protein_g + adjustedNutrition.protein_g,
            // Używamy net_carbs_g zamiast carbs_g dla diety keto/low-carb
            carbs_g: acc.carbs_g + adjustedNutrition.net_carbs_g,
            fats_g: acc.fats_g + adjustedNutrition.fats_g,
          }
        },
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
