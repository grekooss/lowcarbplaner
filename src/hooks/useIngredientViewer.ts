/**
 * Hook: useIngredientViewer
 *
 * Read-only version of ingredient editing - allows adjusting amounts locally
 * but without save capability. Used in Recipes browser for preview.
 * Supports both regular ingredients and recipe components (sub-recipes).
 * Includes servings multiplier for scaling all ingredients proportionally.
 */

import { useState, useCallback, useMemo } from 'react'
import type { RecipeDTO } from '@/types/dto.types'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'

interface IngredientOverride {
  ingredient_id: number
  new_amount: number
}

interface ComponentOverride {
  recipe_id: number
  new_amount: number
}

interface UseIngredientViewerParams {
  recipe: RecipeDTO
}

/**
 * Hook for viewing/adjusting ingredient amounts (no save capability)
 * Supports both ingredients and recipe components
 */
export function useIngredientViewer({ recipe }: UseIngredientViewerParams) {
  const ingredients = recipe.ingredients
  const components = recipe.components || []
  const [overrides, setOverrides] = useState<IngredientOverride[]>([])
  const [componentOverrides, setComponentOverrides] = useState<
    ComponentOverride[]
  >([])
  // Servings multiplier - defaults to base_servings
  const [servingsCount, setServingsCount] = useState<number>(
    recipe.base_servings
  )

  // Calculate servings multiplier ratio
  const servingsMultiplier = useMemo(() => {
    return servingsCount / recipe.base_servings
  }, [servingsCount, recipe.base_servings])

  // Check if there are any manual changes from original (not servings scaling)
  // Servings scaling is not considered a "change" - it's normal recipe adjustment
  const hasChanges = useMemo(() => {
    return overrides.length > 0 || componentOverrides.length > 0
  }, [overrides, componentOverrides])

  // Calculate adjusted nutrition based on current overrides and servings multiplier
  const adjustedNutrition = useMemo(() => {
    // First calculate with overrides
    const baseNutrition = calculateRecipeNutritionWithOverrides(
      recipe,
      overrides
    )

    // If no overrides but servings changed, apply multiplier to base nutrition
    if (overrides.length === 0 && servingsMultiplier !== 1) {
      return {
        calories: (recipe.total_calories ?? 0) * servingsMultiplier,
        protein_g: (recipe.total_protein_g ?? 0) * servingsMultiplier,
        carbs_g: (recipe.total_carbs_g ?? 0) * servingsMultiplier,
        fiber_g: (recipe.total_fiber_g ?? 0) * servingsMultiplier,
        net_carbs_g: (recipe.total_net_carbs_g ?? 0) * servingsMultiplier,
        fats_g: (recipe.total_fats_g ?? 0) * servingsMultiplier,
      }
    }

    return baseNutrition
  }, [recipe, overrides, servingsMultiplier])

  /**
   * Get current amount for an ingredient (with override or servings multiplier applied)
   */
  const getIngredientAmount = useCallback(
    (ingredientId: number): number => {
      const override = overrides.find((o) => o.ingredient_id === ingredientId)
      if (override) return override.new_amount

      const ingredient = ingredients.find((i) => i.id === ingredientId)
      if (!ingredient) return 0

      // Apply servings multiplier to all ingredients
      return ingredient.amount * servingsMultiplier
    },
    [overrides, ingredients, servingsMultiplier]
  )

  /**
   * Get current amount for a component (with override or servings multiplier applied)
   */
  const getComponentAmount = useCallback(
    (recipeId: number): number => {
      const override = componentOverrides.find((o) => o.recipe_id === recipeId)
      if (override) return override.new_amount

      const component = components.find((c) => c.recipe_id === recipeId)
      if (!component) return 0

      // Apply servings multiplier to all components
      return component.required_amount * servingsMultiplier
    },
    [componentOverrides, components, servingsMultiplier]
  )

  /**
   * Check if ingredient was adjusted (always false for viewer - no auto-adjust)
   */
  const isAutoAdjusted = useCallback((): boolean => {
    return false
  }, [])

  /**
   * Get expected amount for an ingredient (after scaling, without manual overrides)
   * Used to determine if ingredient was manually changed vs just scaled
   */
  const getExpectedIngredientAmount = useCallback(
    (ingredientId: number): number => {
      const ingredient = ingredients.find((i) => i.id === ingredientId)
      if (!ingredient) return 0

      // Return scaled amount (what it should be without manual override)
      return ingredient.amount * servingsMultiplier
    },
    [ingredients, servingsMultiplier]
  )

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
   * Update component (recipe-as-ingredient) amount
   * Note: amount = 0 is allowed for excluding components from the recipe
   */
  const updateComponentAmount = useCallback(
    (
      recipeId: number,
      newAmount: number
    ): { success: boolean; error?: string } => {
      const component = components.find((c) => c.recipe_id === recipeId)
      if (!component) {
        return { success: false, error: 'Składnik-przepis nie znaleziony' }
      }

      if (newAmount < 0) {
        return { success: false, error: 'Ilość nie może być ujemna' }
      }

      // If new amount equals original, remove override
      if (Math.abs(newAmount - component.required_amount) < 0.01) {
        setComponentOverrides((prev) =>
          prev.filter((o) => o.recipe_id !== recipeId)
        )
      } else {
        // Add or update override (including 0 for excluded components)
        setComponentOverrides((prev) => {
          const filtered = prev.filter((o) => o.recipe_id !== recipeId)
          return [...filtered, { recipe_id: recipeId, new_amount: newAmount }]
        })
      }

      return { success: true }
    },
    [components]
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
   * Increment component amount by step
   */
  const incrementComponentAmount = useCallback(
    (recipeId: number, step = 1) => {
      const currentAmount = getComponentAmount(recipeId)
      return updateComponentAmount(recipeId, currentAmount + step)
    },
    [getComponentAmount, updateComponentAmount]
  )

  /**
   * Decrement component amount by step
   */
  const decrementComponentAmount = useCallback(
    (recipeId: number, step = 1) => {
      const currentAmount = getComponentAmount(recipeId)
      const newAmount = Math.max(0.1, currentAmount - step)
      return updateComponentAmount(recipeId, newAmount)
    },
    [getComponentAmount, updateComponentAmount]
  )

  /**
   * Reset all overrides to original values and restore base servings
   */
  const resetOverrides = useCallback(() => {
    setOverrides([])
    setComponentOverrides([])
    setServingsCount(recipe.base_servings)
  }, [recipe.base_servings])

  return {
    overrides,
    componentOverrides,
    hasChanges,
    adjustedNutrition,
    // Servings
    servingsCount,
    setServingsCount,
    servingsMultiplier,
    // Ingredients
    getIngredientAmount,
    getExpectedIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
    // Components (recipe-as-ingredient)
    getComponentAmount,
    updateComponentAmount,
    incrementComponentAmount,
    decrementComponentAmount,
    // Reset
    resetOverrides,
  }
}
