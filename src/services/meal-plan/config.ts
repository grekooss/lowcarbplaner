/**
 * Configuration constants for Meal Plan Generator
 */

import type { Enums } from '@/types/database.types'
import type { MealPlanConfig } from './types'

/**
 * Calorie tolerance for individual meals (±15%)
 */
export const CALORIE_TOLERANCE = 0.15

/**
 * Number of days to generate in a plan
 */
export const DAYS_TO_GENERATE = 7

/**
 * Maximum percentage change for ingredient amounts during optimization (20%)
 */
export const MAX_INGREDIENT_CHANGE_PERCENT = 0.2

/**
 * Extended calorie range for search (±50% from target)
 * Used when standard ±15% range doesn't find a recipe
 */
export const EXTENDED_CALORIE_TOLERANCE = 0.5

/**
 * Ingredient amount rounding step (5g)
 */
export const INGREDIENT_ROUNDING_STEP = 5

/**
 * Macro surplus threshold for optimization (>105% of target)
 */
export const MACRO_SURPLUS_THRESHOLD_PERCENT = 1.05

/**
 * Predefined meal plan configurations
 */
export const MEAL_PLAN_CONFIGS: Record<
  Enums<'meal_plan_type_enum'>,
  MealPlanConfig
> = {
  '3_main_2_snacks': {
    mealTypes: [
      'breakfast',
      'snack_morning',
      'lunch',
      'snack_afternoon',
      'dinner',
    ],
    calorieDistribution: {
      breakfast: 0.25,
      snack_morning: 0.1,
      lunch: 0.3,
      snack_afternoon: 0.1,
      dinner: 0.25,
    },
  },
  '3_main_1_snack': {
    mealTypes: ['breakfast', 'lunch', 'snack_afternoon', 'dinner'],
    calorieDistribution: {
      breakfast: 0.25,
      lunch: 0.3,
      snack_afternoon: 0.15,
      dinner: 0.3,
    },
  },
  '3_main': {
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    calorieDistribution: {
      breakfast: 0.3,
      lunch: 0.35,
      dinner: 0.35,
    },
  },
  '2_main': {
    // Default config - will be overridden by selected_meals
    mealTypes: ['lunch', 'dinner'],
    calorieDistribution: {
      lunch: 0.45,
      dinner: 0.55,
    },
  },
}

/**
 * Gets meal plan configuration for a user
 * Handles meal_plan_type and selected_meals for '2_main' configuration
 *
 * @param mealPlanType - Meal plan type
 * @param selectedMeals - Selected meals (for '2_main')
 * @returns Meal plan configuration with types and calorie distribution
 */
export function getMealPlanConfig(
  mealPlanType: Enums<'meal_plan_type_enum'>,
  selectedMeals: Enums<'meal_type_enum'>[] | null
): MealPlanConfig {
  // For '2_main' use selected_meals
  if (
    mealPlanType === '2_main' &&
    selectedMeals &&
    selectedMeals.length === 2
  ) {
    // Sort meals by daily order
    const mealOrder: Enums<'meal_type_enum'>[] = [
      'breakfast',
      'lunch',
      'dinner',
    ]
    const sortedMeals = [...selectedMeals].sort(
      (a, b) => mealOrder.indexOf(a) - mealOrder.indexOf(b)
    ) as Enums<'meal_type_enum'>[]

    const firstMeal = sortedMeals[0]!
    const secondMeal = sortedMeals[1]!

    // Earlier meal gets 45%, later meal gets 55%
    const distribution: Partial<Record<Enums<'meal_type_enum'>, number>> = {}
    distribution[firstMeal] = 0.45
    distribution[secondMeal] = 0.55

    return {
      mealTypes: sortedMeals,
      calorieDistribution: distribution,
    }
  }

  // For other configurations use predefined values
  return MEAL_PLAN_CONFIGS[mealPlanType]
}

/**
 * Maps generic meal types to database search types
 */
export function getMealTypeForSearch(
  mealType: Enums<'meal_type_enum'>
): Enums<'meal_type_enum'> {
  // Map snack types to generic 'snack' for database search
  if (mealType === 'snack_morning' || mealType === 'snack_afternoon') {
    return 'snack'
  }
  return mealType
}
