/**
 * Hook: useIngredientViewer
 *
 * Read-only version of ingredient editing - allows adjusting amounts locally
 * but without save capability. Used in Recipes browser for preview.
 */

import { useState, useCallback, useMemo } from 'react'
import type { RecipeDTO } from '@/types/dto.types'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'

interface IngredientOverride {
  ingredient_id: number
  new_amount: number
}

interface UseIngredientViewerParams {
  recipe: RecipeDTO
}

/**
 * Hook for viewing/adjusting ingredient amounts (no save capability)
 */
export function useIngredientViewer({ recipe }: UseIngredientViewerParams) {
  const ingredients = recipe.ingredients
  const [overrides, setOverrides] = useState<IngredientOverride[]>([])

  // Check if there are any changes from original
  const hasChanges = useMemo(() => {
    return overrides.length > 0
  }, [overrides])

  // Calculate adjusted nutrition based on current overrides
  const adjustedNutrition = useMemo(() => {
    return calculateRecipeNutritionWithOverrides(recipe, overrides)
  }, [recipe, overrides])

  /**
   * Get current amount for an ingredient (with override applied if exists)
   */
  const getIngredientAmount = useCallback(
    (ingredientId: number): number => {
      const override = overrides.find((o) => o.ingredient_id === ingredientId)
      if (override) return override.new_amount

      const ingredient = ingredients.find((i) => i.id === ingredientId)
      return ingredient?.amount || 0
    },
    [overrides, ingredients]
  )

  /**
   * Check if ingredient was adjusted (always false for viewer - no auto-adjust)
   */
  const isAutoAdjusted = useCallback((): boolean => {
    return false
  }, [])

  /**
   * Update ingredient amount
   * Note: amount = 0 is allowed for excluding ingredients from the recipe
   */
  const updateIngredientAmount = useCallback(
    (
      ingredientId: number,
      newAmount: number
    ): { success: boolean; error?: string } => {
      const ingredient = ingredients.find((i) => i.id === ingredientId)
      if (!ingredient) {
        return { success: false, error: 'Składnik nie znaleziony' }
      }

      if (newAmount < 0) {
        return { success: false, error: 'Ilość nie może być ujemna' }
      }

      // If new amount equals original, remove override
      if (Math.abs(newAmount - ingredient.amount) < 0.01) {
        setOverrides((prev) =>
          prev.filter((o) => o.ingredient_id !== ingredientId)
        )
      } else {
        // Add or update override (including 0 for excluded ingredients)
        setOverrides((prev) => {
          const filtered = prev.filter((o) => o.ingredient_id !== ingredientId)
          return [
            ...filtered,
            { ingredient_id: ingredientId, new_amount: newAmount },
          ]
        })
      }

      return { success: true }
    },
    [ingredients]
  )

  /**
   * Increment ingredient amount by step
   */
  const incrementAmount = useCallback(
    (ingredientId: number, step = 1) => {
      const currentAmount = getIngredientAmount(ingredientId)
      return updateIngredientAmount(ingredientId, currentAmount + step)
    },
    [getIngredientAmount, updateIngredientAmount]
  )

  /**
   * Decrement ingredient amount by step
   */
  const decrementAmount = useCallback(
    (ingredientId: number, step = 1) => {
      const currentAmount = getIngredientAmount(ingredientId)
      const newAmount = Math.max(0.1, currentAmount - step)
      return updateIngredientAmount(ingredientId, newAmount)
    },
    [getIngredientAmount, updateIngredientAmount]
  )

  /**
   * Reset all overrides to original values
   */
  const resetOverrides = useCallback(() => {
    setOverrides([])
  }, [])

  return {
    overrides,
    hasChanges,
    adjustedNutrition,
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
    resetOverrides,
  }
}
