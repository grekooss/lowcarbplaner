/**
 * Type Guards Utility
 *
 * Centralized type guard functions for runtime type checking.
 * Used to validate data from external sources (API, database).
 *
 * @module lib/utils/type-guards
 */

/**
 * Type representing a planned meal row from Supabase with full recipe data.
 * Used for type-safe validation of database query results.
 */
export interface PlannedMealRow {
  id: number
  meal_date: string
  meal_type: unknown
  is_eaten: boolean
  ingredient_overrides: unknown
  created_at: string
  recipe: {
    slug: string
    id: number
    name: string
    instructions: unknown
    meal_types: unknown
    tags: string[] | null
    image_url: string | null
    difficulty_level: unknown
    // Servings
    base_servings: number
    serving_unit: string | null
    is_batch_friendly: boolean
    suggested_batch_size?: number | null
    min_servings: number
    // Nutrition
    total_calories: number | null
    total_protein_g: number | null
    total_carbs_g: number | null
    total_fiber_g: number | null
    /** Poliole całkowite (alkohole cukrowe) */
    total_polyols_g: number | null
    total_net_carbs_g: number | null
    total_fats_g: number | null
    recipe_ingredients?: {
      base_amount: number
      unit: string
      is_scalable: boolean
      calories: number | null
      protein_g: number | null
      carbs_g: number | null
      fiber_g: number | null
      /** Poliole (alkohole cukrowe) */
      polyols_g: number | null
      fats_g: number | null
      step_number: number | null
      ingredient: {
        id: number
        name: string
        category: unknown
        unit: string
        ingredient_unit_conversions?: {
          unit_name: string
          grams_equivalent: number
        }[]
      }
    }[]
  }
}

/**
 * Validates that meal data from database has expected structure
 *
 * Used after Supabase queries to ensure data is complete before transformation.
 * Checks for required fields: id, recipe (with nested data).
 *
 * @param data - Unknown data from database query
 * @returns True if data has valid meal structure
 *
 * @example
 * ```typescript
 * const { data } = await supabase.from('planned_meals').select('*, recipe(*)')
 * if (!isValidMealData(data)) {
 *   return { error: 'Meal data is incomplete', code: 'NOT_FOUND' }
 * }
 * // TypeScript now knows data has id and recipe
 * ```
 */
export function isValidMealData(data: unknown): data is PlannedMealRow {
  if (data == null || typeof data !== 'object') {
    return false
  }

  const obj = data as Record<string, unknown>

  // Check required top-level fields
  if (
    typeof obj.id !== 'number' ||
    typeof obj.meal_date !== 'string' ||
    typeof obj.is_eaten !== 'boolean' ||
    typeof obj.created_at !== 'string'
  ) {
    return false
  }

  // Check recipe exists and has required structure
  if (obj.recipe == null || typeof obj.recipe !== 'object') {
    return false
  }

  const recipe = obj.recipe as Record<string, unknown>
  if (typeof recipe.id !== 'number' || typeof recipe.name !== 'string') {
    return false
  }

  return true
}

/**
 * Validates that recipe data from database has expected structure
 *
 * Checks for required recipe fields: id, name, and optionally ingredients.
 *
 * @param data - Unknown data from database query
 * @returns True if data has valid recipe structure
 *
 * @example
 * ```typescript
 * const { data } = await supabase.from('recipes').select('*')
 * if (!isValidRecipeData(data)) {
 *   return { error: 'Recipe not found', code: 'NOT_FOUND' }
 * }
 * ```
 */
export function isValidRecipeData(
  data: unknown
): data is { id: number; name: string } {
  return (
    data != null &&
    typeof data === 'object' &&
    'id' in data &&
    typeof (data as { id: unknown }).id === 'number' &&
    'name' in data &&
    typeof (data as { name: unknown }).name === 'string'
  )
}

/**
 * Validates that profile data from database has expected structure
 *
 * @param data - Unknown data from database query
 * @returns True if data has valid profile structure
 */
export function isValidProfileData(
  data: unknown
): data is { id: string; target_calories: number } {
  return (
    data != null &&
    typeof data === 'object' &&
    'id' in data &&
    typeof (data as { id: unknown }).id === 'string' &&
    'target_calories' in data &&
    typeof (data as { target_calories: unknown }).target_calories === 'number'
  )
}

/**
 * Asserts that data is a non-null object
 *
 * Throws if data is null, undefined, or not an object.
 *
 * @param data - Data to check
 * @param errorMessage - Custom error message
 * @throws Error if data is not a valid object
 */
export function assertObject(
  data: unknown,
  errorMessage = 'Expected an object'
): asserts data is Record<string, unknown> {
  if (data == null || typeof data !== 'object') {
    throw new Error(errorMessage)
  }
}

/**
 * Asserts that data is a non-empty array
 *
 * @param data - Data to check
 * @param errorMessage - Custom error message
 * @throws Error if data is not a non-empty array
 */
export function assertNonEmptyArray<T>(
  data: unknown,
  errorMessage = 'Expected a non-empty array'
): asserts data is T[] {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(errorMessage)
  }
}

/**
 * Type guard for checking if a value is defined (not null or undefined)
 *
 * Useful for filtering arrays: arr.filter(isDefined)
 *
 * @param value - Value to check
 * @returns True if value is not null or undefined
 *
 * @example
 * ```typescript
 * const values = [1, null, 2, undefined, 3]
 * const defined = values.filter(isDefined) // [1, 2, 3]
 * ```
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Type guard for checking if a value is a non-empty string
 *
 * @param value - Value to check
 * @returns True if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/**
 * Type guard for checking if a value is a positive number
 *
 * @param value - Value to check
 * @returns True if value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0 && !Number.isNaN(value)
}
