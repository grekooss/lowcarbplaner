/**
 * Macro calculations for Meal Plan Generator
 *
 * Functions for calculating and optimizing macronutrients.
 */

import type { Enums } from '@/types/database.types'
import type {
  RecipeWithIngredients,
  IngredientOverride,
  MacroValues,
  MacroTargets,
  MacroSurplus,
  MacroType,
  MealPlanConfig,
  CalorieRange,
} from './types'
import {
  CALORIE_TOLERANCE,
  INGREDIENT_ROUNDING_STEP,
  MAX_INGREDIENT_CHANGE_PERCENT,
  MACRO_SURPLUS_THRESHOLD_PERCENT,
} from './config'

/**
 * Rounds ingredient amount to nearest multiple of INGREDIENT_ROUNDING_STEP
 *
 * @param amount - Amount to round
 * @returns Rounded amount to multiple of 5g
 */
export function roundIngredientAmount(amount: number): number {
  return (
    Math.round(amount / INGREDIENT_ROUNDING_STEP) * INGREDIENT_ROUNDING_STEP
  )
}

/**
 * Calculates target calories for a single meal
 *
 * @param dailyCalories - Daily calorie target
 * @param mealType - Meal type
 * @param config - Meal plan configuration
 * @returns Calorie range for the meal { min, max, target }
 */
export function calculateMealCalorieRange(
  dailyCalories: number,
  mealType: Enums<'meal_type_enum'>,
  config: MealPlanConfig
): CalorieRange {
  // Get percentage share of daily calories
  const percentage =
    config.calorieDistribution[mealType] || 1 / config.mealTypes.length
  const target = dailyCalories * percentage

  // ±15% tolerance for each meal
  const min = target * (1 - CALORIE_TOLERANCE)
  const max = target * (1 + CALORIE_TOLERANCE)

  return { min, max, target }
}

/**
 * Calculates macros for a recipe with optional overrides
 *
 * @param recipe - Recipe with ingredients
 * @param overrides - Ingredient amount overrides (optional)
 * @returns Total macro values
 */
export function calculateRecipeMacros(
  recipe: RecipeWithIngredients,
  overrides?: IngredientOverride[]
): MacroValues {
  if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
    return {
      calories: recipe.total_calories || 0,
      protein_g: recipe.total_protein_g || 0,
      carbs_g: recipe.total_carbs_g || 0,
      fats_g: recipe.total_fats_g || 0,
    }
  }

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFats = 0

  for (const ingredient of recipe.recipe_ingredients) {
    const override = overrides?.find(
      (o) => o.ingredient_id === ingredient.ingredient_id
    )
    const baseAmount = ingredient.base_amount
    const adjustedAmount = override?.new_amount ?? baseAmount

    if (baseAmount === 0) continue

    const scale = adjustedAmount / baseAmount

    totalCalories += (ingredient.calories || 0) * scale
    totalProtein += (ingredient.protein_g || 0) * scale
    totalCarbs += (ingredient.carbs_g || 0) * scale
    totalFats += (ingredient.fats_g || 0) * scale
  }

  return {
    calories: Math.round(totalCalories),
    protein_g: Math.round(totalProtein * 10) / 10,
    carbs_g: Math.round(totalCarbs * 10) / 10,
    fats_g: Math.round(totalFats * 10) / 10,
  }
}

/**
 * Calculates macro surplus for a day
 *
 * @param dayMacros - Sum of macros from all meals
 * @param targets - Target macro values
 * @returns Surplus for each macro (positive = excess)
 */
export function calculateMacroSurplus(
  dayMacros: Pick<MacroValues, 'protein_g' | 'carbs_g' | 'fats_g'>,
  targets: MacroTargets
): MacroSurplus {
  return {
    protein: dayMacros.protein_g - targets.target_protein_g,
    carbs: dayMacros.carbs_g - targets.target_carbs_g,
    fats: dayMacros.fats_g - targets.target_fats_g,
  }
}

/**
 * Checks if a macro needs optimization
 *
 * @param dayMacros - Current day macros
 * @param targets - Target macro values
 * @param macroType - Macro type to check
 * @returns true if macro exceeds 105% of target
 */
export function shouldOptimizeMacro(
  dayMacros: Pick<MacroValues, 'protein_g' | 'carbs_g' | 'fats_g'>,
  targets: MacroTargets,
  macroType: MacroType
): boolean {
  const macroValue =
    macroType === 'protein'
      ? dayMacros.protein_g
      : macroType === 'carbs'
        ? dayMacros.carbs_g
        : dayMacros.fats_g

  const targetValue =
    macroType === 'protein'
      ? targets.target_protein_g
      : macroType === 'carbs'
        ? targets.target_carbs_g
        : targets.target_fats_g

  if (targetValue === 0) return false

  const percentOfTarget = macroValue / targetValue

  // Optimize macro when exceeds 105%
  return percentOfTarget > MACRO_SURPLUS_THRESHOLD_PERCENT
}

/**
 * Finds the macro that needs optimization the most
 *
 * @param surplus - Surplus for each macro
 * @param dayMacros - Current day macros
 * @param targets - Target macro values
 * @returns Macro type with highest surplus (>105%) or null
 */
export function findMacroForOptimization(
  surplus: MacroSurplus,
  dayMacros: Pick<MacroValues, 'protein_g' | 'carbs_g' | 'fats_g'>,
  targets: MacroTargets
): MacroType | null {
  // Only macros that exceed 105% of target
  const validMacros = Object.entries(surplus)
    .filter(([key, value]) => {
      if (value <= 0) return false
      const macroType = key as MacroType
      return shouldOptimizeMacro(dayMacros, targets, macroType)
    })
    .sort(([, a], [, b]) => b - a)

  if (validMacros.length === 0) {
    return null
  }

  const firstEntry = validMacros[0]
  if (!firstEntry) {
    return null
  }

  return firstEntry[0] as MacroType
}

/**
 * Calculates ingredient overrides to scale recipe to target calories
 *
 * @param recipe - Recipe with ingredients
 * @param targetCalories - Target calorie amount
 * @returns Ingredient overrides or null if not needed/possible
 */
export function calculateCalorieScalingOverrides(
  recipe: RecipeWithIngredients,
  targetCalories: number
): IngredientOverride[] | null {
  const currentCalories = recipe.total_calories || 0

  // If recipe is within ±5% of target, don't scale
  if (
    currentCalories >= targetCalories * 0.95 &&
    currentCalories <= targetCalories * 1.05
  ) {
    return null
  }

  // Calculate scaling factor
  const scaleFactor = targetCalories / currentCalories

  // Limit scaling to ±20% (scale factor 0.8-1.2)
  const limitedScaleFactor = Math.max(
    1 - MAX_INGREDIENT_CHANGE_PERCENT,
    Math.min(1 + MAX_INGREDIENT_CHANGE_PERCENT, scaleFactor)
  )

  // If scaling is too small (< 0.01 difference), skip
  if (Math.abs(limitedScaleFactor - 1) < 0.01) {
    return null
  }

  // Find scalable ingredients with calories
  const scalableIngredients = recipe.recipe_ingredients.filter(
    (ing) => ing.is_scalable && (ing.calories || 0) > 0
  )

  if (scalableIngredients.length === 0) {
    return null
  }

  // Calculate sum of calories from scalable ingredients
  const scalableCalories = scalableIngredients.reduce(
    (sum, ing) => sum + (ing.calories || 0),
    0
  )

  // If scalable ingredients are less than 20% of calories, don't scale
  if (scalableCalories < currentCalories * 0.2) {
    return null
  }

  // Create overrides for scalable ingredients
  const overrides: IngredientOverride[] = []

  for (const ingredient of scalableIngredients) {
    const newAmount = roundIngredientAmount(
      ingredient.base_amount * limitedScaleFactor
    )

    // Only add override if amount changed
    if (newAmount !== ingredient.base_amount) {
      overrides.push({
        ingredient_id: ingredient.ingredient_id,
        new_amount: newAmount,
      })
    }
  }

  return overrides.length > 0 ? overrides : null
}
