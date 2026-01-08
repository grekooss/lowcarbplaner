/**
 * useRecipeViewModal - Hook for RecipeViewModal integration
 *
 * Provides ingredient editor API compatible with RecipeViewModal
 * Wraps useIngredientViewer for view-only mode
 * Supports both ingredients and recipe components (sub-recipes)
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
  // Servings
  base_servings: 1,
  serving_unit: 'porcja',
  is_batch_friendly: false,
  suggested_batch_size: null,
  min_servings: 1,
  // Total nutrition
  total_calories: null,
  total_protein_g: null,
  total_carbs_g: null,
  total_fiber_g: null,
  total_polyols_g: null,
  total_net_carbs_g: null,
  total_fats_g: null,
  total_saturated_fat_g: null,
  // Per serving nutrition
  calories_per_serving: null,
  protein_per_serving: null,
  carbs_per_serving: null,
  net_carbs_per_serving: null,
  fats_per_serving: null,
  ingredients: [],
  equipment: [],
  components: [],
}

/**
 * Hook that provides ingredient editor API for RecipeViewModal
 * Use this for view-only recipe modals (no save functionality)
 * Supports both ingredients and recipe components
 */
export function useRecipeViewModal({ recipe }: UseRecipeViewModalOptions) {
  const {
    adjustedNutrition,
    getIngredientAmount,
    getExpectedIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
    // Component functions
    getComponentAmount,
    updateComponentAmount,
    incrementComponentAmount,
    decrementComponentAmount,
    // Servings
    servingsCount,
    setServingsCount,
    servingsMultiplier,
  } = useIngredientViewer({
    recipe: recipe ?? emptyRecipe,
  })

  return {
    ingredientEditor: {
      // Ingredients
      getIngredientAmount,
      getExpectedIngredientAmount,
      isAutoAdjusted,
      updateIngredientAmount,
      incrementAmount,
      decrementAmount,
      adjustedNutrition,
      // Components (recipe-as-ingredient)
      getComponentAmount,
      updateComponentAmount,
      incrementComponentAmount,
      decrementComponentAmount,
      // Servings
      servingsCount,
      setServingsCount,
      servingsMultiplier,
    },
  }
}
