/**
 * Types for Meal Plan Generator
 *
 * Contains all type definitions used across the meal plan generation service.
 */

import type { Enums, TablesInsert } from '@/types/database.types'

/**
 * User profile subset for meal plan generation
 */
export type UserProfile = {
  id: string
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
  meal_plan_type: Enums<'meal_plan_type_enum'>
  selected_meals: Enums<'meal_type_enum'>[] | null
  /** Array of equipment IDs that user doesn't have - recipes requiring these will be excluded */
  excluded_equipment_ids?: number[]
}

/**
 * Recipe type for generator (subset of database recipe)
 */
export type Recipe = {
  id: number
  name: string
  meal_types: Enums<'meal_type_enum'>[]
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
}

/**
 * Planned meal insert type
 */
export type PlannedMealInsert = TablesInsert<'planned_meals'>

/**
 * Recipe with full ingredient and equipment data
 */
export type RecipeWithIngredients = Recipe & {
  recipe_ingredients: {
    ingredient_id: number
    base_amount: number
    unit: string
    is_scalable: boolean
    calories: number | null
    protein_g: number | null
    carbs_g: number | null
    fats_g: number | null
  }[]
  /** IDs of equipment required for this recipe */
  required_equipment_ids: number[]
}

/**
 * Ingredient override for scaling
 */
export type IngredientOverride = {
  ingredient_id: number
  new_amount: number
}

/**
 * Recipe cache by meal type
 */
export type RecipeCache = Map<Enums<'meal_type_enum'>, RecipeWithIngredients[]>

/**
 * Cache metadata with calorie index for fast lookup
 */
export type RecipeCacheMetadata = {
  recipes: RecipeCache
  calorieIndex: Map<
    Enums<'meal_type_enum'>,
    {
      minCalories: number
      maxCalories: number
      sortedByCalories: RecipeWithIngredients[]
    }
  >
  /** Equipment IDs to exclude (recipes requiring these are filtered out) */
  excludedEquipmentIds: Set<number>
}

/**
 * Meal plan configuration
 */
export type MealPlanConfig = {
  mealTypes: Enums<'meal_type_enum'>[]
  calorieDistribution: Partial<Record<Enums<'meal_type_enum'>, number>>
}

/**
 * Macro type for optimization
 */
export type MacroType = 'protein' | 'carbs' | 'fats'

/**
 * Calorie range for a meal
 */
export type CalorieRange = {
  min: number
  max: number
  target: number
}

/**
 * Macro values
 */
export type MacroValues = {
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
}

/**
 * Macro targets from profile
 */
export type MacroTargets = {
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fats_g: number
}

/**
 * Macro surplus values
 */
export type MacroSurplus = {
  protein: number
  carbs: number
  fats: number
}

/**
 * Generated meal for a day
 */
export type GeneratedMeal = {
  recipe: RecipeWithIngredients
  mealType: Enums<'meal_type_enum'>
  overrides: IngredientOverride[] | null
  macros: MacroValues
}

/**
 * Day plan with meals and totals
 */
export type DayPlan = {
  meals: GeneratedMeal[]
  totals: MacroValues
}
