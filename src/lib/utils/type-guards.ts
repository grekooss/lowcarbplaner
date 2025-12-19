/**
 * Type Guards Utility
 *
 * Centralized type guard functions for runtime type checking.
 * Used to validate data from external sources (API, database).
 *
 * @module lib/utils/type-guards
 */

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
export function isValidMealData(
  data: unknown
): data is { id: number; recipe: Record<string, unknown> } {
  return (
    data != null &&
    typeof data === 'object' &&
    'id' in data &&
    'recipe' in data &&
    (data as { recipe: unknown }).recipe != null &&
    typeof (data as { recipe: unknown }).recipe === 'object'
  )
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
