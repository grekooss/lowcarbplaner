/**
 * Recipe Nutrition Calculator
 *
 * Utility for calculating recipe nutritional values with support for ingredient overrides.
 * Handles adjustable ingredient quantities for personalized meal plans.
 *
 * Includes fiber, polyols and net carbs calculations for keto/low-carb diets.
 * Net Carbs = Total Carbs - Fiber - Polyols
 *
 * Also includes saturated fat tracking for cardiovascular health monitoring.
 */

import type { RecipeDTO, IngredientOverrides } from '@/types/dto.types'

/**
 * Nutritional values result type
 * Includes fiber_g, polyols_g and net_carbs_g for keto/low-carb support.
 * Also includes saturated_fat_g for cardiovascular health monitoring.
 */
export type RecipeNutrition = {
  calories: number
  protein_g: number
  /** Węglowodany całkowite (Total Carbs) */
  carbs_g: number
  /** Błonnik pokarmowy */
  fiber_g: number
  /** Poliole (alkohole cukrowe: erytrytol, ksylitol, maltitol, sorbitol) */
  polyols_g: number
  /** Węglowodany netto (Net Carbs = carbs_g - fiber_g - polyols_g) - kluczowe dla keto */
  net_carbs_g: number
  fats_g: number
  /** Tłuszcze nasycone - ważne dla monitorowania zdrowia sercowo-naczyniowego */
  saturated_fat_g: number
}

/**
 * Calculate recipe nutrition with ingredient quantity overrides
 *
 * Recalculates nutritional values when user adjusts ingredient amounts
 * in their meal plan. Scales each ingredient's nutrition proportionally.
 *
 * Now includes fiber, polyols and net carbs calculations essential for keto/low-carb diets.
 *
 * @param recipe - Full recipe data with ingredients
 * @param overrides - Array of ingredient quantity adjustments (optional)
 * @returns Adjusted nutritional values including fiber, polyols and net carbs
 *
 * @example
 * ```typescript
 * // Recipe with avocado (8.5g carbs, 6.7g fiber, 0g polyols = 1.8g net carbs)
 * // Recipe with erythritol (100g carbs, 0g fiber, 100g polyols = 0g net carbs)
 * const adjusted = calculateRecipeNutritionWithOverrides(recipe, null)
 * // Result includes:
 * // - carbs_g: total carbs
 * // - fiber_g: fiber
 * // - polyols_g: polyols (sugar alcohols)
 * // - net_carbs_g: net carbs for keto tracking (carbs - fiber - polyols)
 * ```
 */
export function calculateRecipeNutritionWithOverrides(
  recipe: RecipeDTO,
  overrides: IngredientOverrides | null
): RecipeNutrition {
  // If no ingredients, return recipe totals or zeros
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    const totalCarbs = recipe.total_carbs_g ?? 0
    const totalFiber = recipe.total_fiber_g ?? 0
    const totalPolyols = recipe.total_polyols_g ?? 0

    return {
      calories: recipe.total_calories ?? 0,
      protein_g: recipe.total_protein_g ?? 0,
      carbs_g: totalCarbs,
      fiber_g: totalFiber,
      polyols_g: totalPolyols,
      net_carbs_g:
        recipe.total_net_carbs_g ??
        Math.max(0, totalCarbs - totalFiber - totalPolyols),
      fats_g: recipe.total_fats_g ?? 0,
      saturated_fat_g: recipe.total_saturated_fat_g ?? 0,
    }
  }

  // Calculate nutrition for each ingredient with adjusted amounts
  const nutrition = recipe.ingredients.reduce(
    (acc, ingredient) => {
      // Check if this ingredient has an override
      const override = overrides?.find((o) => o.ingredient_id === ingredient.id)

      // Calculate scaling factor based on override
      const originalAmount = ingredient.amount
      const adjustedAmount = override?.new_amount ?? originalAmount

      // Prevent division by zero
      if (originalAmount === 0) {
        return acc
      }

      const scale = adjustedAmount / originalAmount

      // Scale all nutritional values proportionally (including fiber, polyols, saturated fat)
      return {
        calories: acc.calories + ingredient.calories * scale,
        protein_g: acc.protein_g + ingredient.protein_g * scale,
        carbs_g: acc.carbs_g + ingredient.carbs_g * scale,
        fiber_g: acc.fiber_g + ingredient.fiber_g * scale,
        polyols_g: acc.polyols_g + ingredient.polyols_g * scale,
        net_carbs_g: acc.net_carbs_g + ingredient.net_carbs_g * scale,
        fats_g: acc.fats_g + ingredient.fats_g * scale,
        saturated_fat_g:
          acc.saturated_fat_g + ingredient.saturated_fat_g * scale,
      }
    },
    {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fiber_g: 0,
      polyols_g: 0,
      net_carbs_g: 0,
      fats_g: 0,
      saturated_fat_g: 0,
    } as RecipeNutrition
  )

  // Round to nearest integer for consistency with DB storage
  // Net carbs can be 0 but never negative
  return {
    calories: Math.round(nutrition.calories),
    protein_g: Math.round(nutrition.protein_g),
    carbs_g: Math.round(nutrition.carbs_g),
    fiber_g: Math.round(nutrition.fiber_g),
    polyols_g: Math.round(nutrition.polyols_g),
    net_carbs_g: Math.max(0, Math.round(nutrition.net_carbs_g)),
    fats_g: Math.round(nutrition.fats_g),
    saturated_fat_g: Math.round(nutrition.saturated_fat_g),
  }
}

/**
 * Check if a meal has any ingredient overrides applied
 *
 * @param overrides - Ingredient overrides array or null
 * @returns True if overrides exist and contain items
 */
export function hasIngredientOverrides(
  overrides: IngredientOverrides | null
): boolean {
  return overrides !== null && overrides.length > 0
}

/**
 * Get adjusted amount for a specific ingredient
 *
 * @param ingredientId - ID of the ingredient to check
 * @param originalAmount - Original amount from recipe
 * @param overrides - Array of overrides or null
 * @returns Adjusted amount if override exists, otherwise original amount
 */
export function getAdjustedIngredientAmount(
  ingredientId: number,
  originalAmount: number,
  overrides: IngredientOverrides | null
): number {
  if (!overrides) return originalAmount

  const override = overrides.find((o) => o.ingredient_id === ingredientId)
  return override?.new_amount ?? originalAmount
}

/**
 * Calculate net carbs from total carbs, fiber, and polyols
 *
 * Essential for keto/low-carb diet tracking where users count
 * net carbs (digestible carbohydrates) rather than total carbs.
 *
 * Net Carbs = Total Carbs - Fiber - Polyols
 *
 * Polyols (sugar alcohols like erythritol, xylitol, maltitol, sorbitol)
 * are subtracted because they have minimal impact on blood sugar.
 *
 * @param totalCarbs - Total carbohydrates in grams
 * @param fiber - Dietary fiber in grams
 * @param polyols - Polyols (sugar alcohols) in grams (default: 0)
 * @returns Net carbs (always >= 0)
 */
export function calculateNetCarbs(
  totalCarbs: number,
  fiber: number,
  polyols: number = 0
): number {
  return Math.max(0, totalCarbs - fiber - polyols)
}
