/**
 * useRecipeViewModal - Hook for RecipeViewModal integration
 *
 * Provides ingredient editor API compatible with RecipeViewModal
 * Wraps useIngredientViewer for view-only mode
 */

import { useIngredientViewer } from './useIngredientViewer'
import type { RecipeDTO } from '@/types/dto.types'

interface UseRecipeViewModalOptions {
  recipe: RecipeDTO | null | undefined
}

// Minimal recipe object for when no recipe is provided
const emptyRecipe: RecipeDTO = {
  id: 0,
  slug: '',
  name: '',
  instructions: [],
  meal_types: [],
  tags: null,
  image_url: null,
  difficulty_level: 'easy',
  average_rating: null,
  reviews_count: 0,
  prep_time_minutes: null,
  cook_time_minutes: null,
  total_calories: null,
  total_protein_g: null,
  total_carbs_g: null,
  total_fiber_g: null,
  total_polyols_g: null,
  total_net_carbs_g: null,
  total_fats_g: null,
  total_saturated_fat_g: null,
  ingredients: [],
  equipment: [],
}

/**
 * Hook that provides ingredient editor API for RecipeViewModal
 * Use this for view-only recipe modals (no save functionality)
 */
export function useRecipeViewModal({ recipe }: UseRecipeViewModalOptions) {
  const {
    adjustedNutrition,
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
  } = useIngredientViewer({
    recipe: recipe ?? emptyRecipe,
  })

  return {
    ingredientEditor: {
      getIngredientAmount,
      isAutoAdjusted,
      updateIngredientAmount,
      incrementAmount,
      decrementAmount,
      adjustedNutrition,
    },
  }
}
