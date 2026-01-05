/**
 * Meal Plan Generator Module
 *
 * Modular structure for meal plan generation service.
 * Re-exports from sub-modules for backwards compatibility.
 *
 * Module structure:
 * - types.ts: Type definitions
 * - config.ts: Configuration constants and meal plan configs
 * - macro-calculations.ts: Macro calculation utilities
 *
 * @example
 * ```typescript
 * import { getMealPlanConfig, CALORIE_TOLERANCE } from '@/services/meal-plan'
 * import type { RecipeWithIngredients, MacroValues } from '@/services/meal-plan'
 * ```
 */

// Types
export type {
  UserProfile,
  Recipe,
  PlannedMealInsert,
  RecipeWithIngredients,
  IngredientOverride,
  RecipeCache,
  RecipeCacheMetadata,
  MealPlanConfig,
  MacroType,
  CalorieRange,
  MacroValues,
  MacroTargets,
  MacroSurplus,
  GeneratedMeal,
  DayPlan,
} from './types'

// Configuration
export {
  CALORIE_TOLERANCE,
  DAYS_TO_GENERATE,
  MAX_INGREDIENT_CHANGE_PERCENT,
  EXTENDED_CALORIE_TOLERANCE,
  INGREDIENT_ROUNDING_STEP,
  MACRO_SURPLUS_THRESHOLD_PERCENT,
  MEAL_PLAN_CONFIGS,
  getMealPlanConfig,
  getMealTypeForSearch,
} from './config'

// Macro Calculations
export {
  roundIngredientAmount,
  calculateMealCalorieRange,
  calculateRecipeMacros,
  calculateMacroSurplus,
  shouldOptimizeMacro,
  findMacroForOptimization,
  calculateCalorieScalingOverrides,
} from './macro-calculations'
