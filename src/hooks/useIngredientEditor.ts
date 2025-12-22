/**
 * Hook: useIngredientEditor
 *
 * Manages ingredient quantity editing state and validation.
 * Allows flexible ingredient quantity adjustments with warning at >±15% change.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { IngredientOverrides, RecipeDTO } from '@/types/dto.types'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'

interface UseIngredientEditorParams {
  mealId: number
  recipe: RecipeDTO
  initialOverrides: IngredientOverrides | null
  /** Optional key to force re-sync when data changes from server */
  _overridesKey?: string
}

/**
 * Hook for managing ingredient editing
 */
export function useIngredientEditor({
  mealId,
  recipe,
  initialOverrides,
  _overridesKey,
}: UseIngredientEditorParams) {
  const ingredients = recipe.ingredients
  const queryClient = useQueryClient()
  const [overrides, setOverrides] = useState<IngredientOverrides>(
    initialOverrides || []
  )
  // Track if we're waiting for data sync after save (prevents flash of "Zapisz" button)
  const [isWaitingForSync, setIsWaitingForSync] = useState(false)

  // Sync overrides when initialOverrides changes (e.g., after save or navigation)
  // Using _overridesKey to detect actual data changes from server
  const prevOverridesKeyRef = useRef(_overridesKey)
  useEffect(() => {
    prevOverridesKeyRef.current = _overridesKey
    setOverrides(initialOverrides || [])
    // Data synced from server - clear waiting state
    setIsWaitingForSync(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_overridesKey])

  // Check if there are any changes from initial state
  const hasChanges = useMemo(() => {
    // Normalize both arrays for consistent comparison
    const normalize = (arr: IngredientOverrides | null) =>
      [...(arr || [])]
        .map((item) => ({
          ingredient_id: item.ingredient_id,
          new_amount: item.new_amount,
        }))
        .sort((a, b) => a.ingredient_id - b.ingredient_id)

    const initialStr = JSON.stringify(normalize(initialOverrides))
    const currentStr = JSON.stringify(normalize(overrides))
    return initialStr !== currentStr
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
   * Check if ingredient change was auto-adjusted by algorithm
   */
  const isAutoAdjusted = useCallback(
    (ingredientId: number): boolean => {
      const override = overrides.find((o) => o.ingredient_id === ingredientId)
      return override?.auto_adjusted === true
    },
    [overrides]
  )

  /**
   * Validate ingredient amount and return warning if change > ±15%
   * Note: amount = 0 is allowed for excluding ingredients from the recipe
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

      // Non-scalable ingredients: allow only 0 (excluded) or original amount (restored)
      if (!ingredient.is_scalable && newAmount !== 0) {
        // Allow restoring to original amount
        if (Math.abs(newAmount - ingredient.amount) > 0.01) {
          return { valid: false, error: 'Ten składnik nie może być skalowany' }
        }
      }

      if (newAmount < 0) {
        return { valid: false, error: 'Ilość nie może być ujemna' }
      }

      // Amount = 0 means excluded ingredient - no warning needed
      if (newAmount === 0) {
        return { valid: true }
      }

      const originalAmount = ingredient.amount
      const diffPercent =
        Math.abs((newAmount - originalAmount) / originalAmount) * 100

      // Show warning if change > ±15%
      if (diffPercent > 15) {
        return {
          valid: true,
          warning: `Duża zmiana (${diffPercent.toFixed(1)}%) - może to zaburzyć proporcje przepisu`,
        }
      }

      return { valid: true }
    },
    [ingredients]
  )

  /**
   * Update ingredient amount
   * Note: amount = 0 is allowed for excluding ingredients from the recipe
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
        // Add or update override (including 0 for excluded ingredients)
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
      // Mark that we're waiting for data sync (prevents flash of "Zapisz" button)
      setIsWaitingForSync(true)
      // Invalidate queries to refresh data - this will sync local state with server
      queryClient.invalidateQueries({ queryKey: ['planned-meals'] })
      queryClient.invalidateQueries({ queryKey: ['daily-macros'] })
    },
  })

  // hasChanges should be hidden while waiting for sync after successful save
  // This prevents the flash of "Zapisz" button between save completion and data sync
  const effectiveHasChanges = hasChanges && !isWaitingForSync

  return {
    overrides,
    hasChanges: effectiveHasChanges,
    adjustedNutrition,
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
    validateAmount,
    saveChanges,
    isSaving,
    isSaveSuccess: false, // Never show "Zapisano" - just hide button after save
  }
}
