/**
 * Recipe Nutrition Calculator
 *
 * Utility for calculating recipe nutritional values with support for ingredient overrides.
 * Handles adjustable ingredient quantities for personalized meal plans.
 */

import type { RecipeDTO, IngredientOverrides } from '@/types/dto.types'

/**
 * Nutritional values result type
 */
export type RecipeNutrition = {
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
}

/**
 * Calculate recipe nutrition with ingredient quantity overrides
 *
 * Recalculates nutritional values when user adjusts ingredient amounts
 * in their meal plan. Scales each ingredient's nutrition proportionally.
 *
 * @param recipe - Full recipe data with ingredients
 * @param overrides - Array of ingredient quantity adjustments (optional)
 * @returns Adjusted nutritional values
 *
 * @example
 * ```typescript
 * // Recipe with 100g chicken (200 kcal), 50g rice (180 kcal)
 * // User changes chicken to 150g
 * const adjusted = calculateRecipeNutritionWithOverrides(recipe, [
 *   { ingredient_id: 1, new_amount: 150 }
 * ])
 * // Result: chicken now 300 kcal, rice still 180 kcal
 * // Total: 480 kcal (instead of original 380 kcal)
 * ```
 */
export function calculateRecipeNutritionWithOverrides(
  recipe: RecipeDTO,
  overrides: IngredientOverrides | null
): RecipeNutrition {
  // If no ingredients, return recipe totals or zeros
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return {
      calories: recipe.total_calories ?? 0,
      protein_g: recipe.total_protein_g ?? 0,
      carbs_g: recipe.total_carbs_g ?? 0,
      fats_g: recipe.total_fats_g ?? 0,
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

      // Scale all nutritional values proportionally
      return {
        calories: acc.calories + ingredient.calories * scale,
        protein_g: acc.protein_g + ingredient.protein_g * scale,
        carbs_g: acc.carbs_g + ingredient.carbs_g * scale,
        fats_g: acc.fats_g + ingredient.fats_g * scale,
      }
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 } as RecipeNutrition
  )

  // Round to nearest integer for consistency with DB storage
  return {
    calories: Math.round(nutrition.calories),
    protein_g: Math.round(nutrition.protein_g),
    carbs_g: Math.round(nutrition.carbs_g),
    fats_g: Math.round(nutrition.fats_g),
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
