/**
 * Hook: useIngredientEditor
 *
 * Manages ingredient quantity editing state and validation.
 * Allows flexible ingredient quantity adjustments with warning at >±15% change.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { IngredientOverrides, RecipeDTO } from '@/types/dto.types'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'

interface UseIngredientEditorParams {
  mealId: number
  recipe: RecipeDTO
  initialOverrides: IngredientOverrides | null
}

/**
 * Hook for managing ingredient editing
 */
export function useIngredientEditor({
  mealId,
  recipe,
  initialOverrides,
}: UseIngredientEditorParams) {
  const ingredients = recipe.ingredients
  const queryClient = useQueryClient()
  const [overrides, setOverrides] = useState<IngredientOverrides>(
    initialOverrides || []
  )

  // Sync overrides when initialOverrides changes (e.g., after save or navigation)
  useEffect(() => {
    setOverrides(initialOverrides || [])
  }, [initialOverrides])

  // Check if there are any changes from initial state
  const hasChanges = useMemo(() => {
    if (!initialOverrides && overrides.length === 0) return false
    if (!initialOverrides && overrides.length > 0) return true
    if (initialOverrides && overrides.length === 0) return true

    return JSON.stringify(overrides) !== JSON.stringify(initialOverrides)
  }, [overrides, initialOverrides])

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
   * Validate ingredient amount and return warning if change > ±15%
   */
  const validateAmount = useCallback(
    (
      ingredientId: number,
      newAmount: number
    ): { valid: boolean; error?: string; warning?: string } => {
      const ingredient = ingredients.find((i) => i.id === ingredientId)
      if (!ingredient) {
        return { valid: false, error: 'Składnik nie znaleziony' }
      }

      if (!ingredient.is_scalable) {
        return { valid: false, error: 'Ten składnik nie może być skalowany' }
      }

      if (newAmount <= 0) {
        return { valid: false, error: 'Ilość musi być większa od 0' }
      }

      const originalAmount = ingredient.amount
      const diffPercent =
        Math.abs((newAmount - originalAmount) / originalAmount) * 100

      // Show warning if change > ±15%
      if (diffPercent > 15) {
        return {
          valid: true,
          warning: `⚠️ Duża zmiana (${diffPercent.toFixed(1)}%) - może to zaburzyć proporcje przepisu`,
        }
      }

      return { valid: true }
    },
    [ingredients]
  )

  /**
   * Update ingredient amount
   */
  const updateIngredientAmount = useCallback(
    (
      ingredientId: number,
      newAmount: number
    ): { success: boolean; error?: string; warning?: string } => {
      const validation = validateAmount(ingredientId, newAmount)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      const ingredient = ingredients.find((i) => i.id === ingredientId)
      if (!ingredient) {
        return { success: false, error: 'Składnik nie znaleziony' }
      }

      // If new amount equals original, remove override
      if (Math.abs(newAmount - ingredient.amount) < 0.01) {
        setOverrides((prev) =>
          prev.filter((o) => o.ingredient_id !== ingredientId)
        )
      } else {
        // Add or update override
        setOverrides((prev) => {
          const filtered = prev.filter((o) => o.ingredient_id !== ingredientId)
          return [
            ...filtered,
            { ingredient_id: ingredientId, new_amount: newAmount },
          ]
        })
      }

      return { success: true, warning: validation.warning }
    },
    [ingredients, validateAmount]
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
      const newAmount = Math.max(0, currentAmount - step)
      return updateIngredientAmount(ingredientId, newAmount)
    },
    [getIngredientAmount, updateIngredientAmount]
  )

  /**
   * Save changes to server
   */
  const { mutate: saveChanges, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/planned-meals/${mealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'modify_ingredients',
          ingredient_overrides: overrides,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Błąd podczas zapisywania')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['planned-meals'] })
      queryClient.invalidateQueries({ queryKey: ['daily-macros'] })
    },
  })

  return {
    overrides,
    hasChanges,
    adjustedNutrition,
    getIngredientAmount,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
    validateAmount,
    saveChanges,
    isSaving,
  }
}
