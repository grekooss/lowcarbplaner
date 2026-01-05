/**
 * Ingredient Validation Utility
 *
 * Shared validation logic for ingredient amount modifications.
 * Used by both server-side (planned-meals.ts) and client-side (useIngredientEditor.ts).
 */

/**
 * Maximum scale factor for ingredient amounts (200% of base amount)
 */
export const MAX_INGREDIENT_SCALE = 2.0

/**
 * Threshold for warning about large changes (>15%)
 */
export const LARGE_CHANGE_THRESHOLD_PERCENT = 15

/**
 * Represents an ingredient for validation purposes
 */
export interface ValidatableIngredient {
  id: number
  amount: number
  is_scalable: boolean
}

/**
 * Result of ingredient amount validation
 */
export interface IngredientValidationResult {
  valid: boolean
  error?: string
  warning?: string
}

/**
 * Validates an ingredient amount change
 *
 * Rules:
 * - Amount cannot be negative
 * - Amount = 0 is allowed (ingredient excluded from recipe)
 * - Non-scalable ingredients can only be 0 (excluded) or original amount (restored)
 * - Scalable ingredients cannot exceed MAX_INGREDIENT_SCALE (200%) of base amount
 * - Warning issued if change exceeds ±LARGE_CHANGE_THRESHOLD_PERCENT (15%)
 *
 * @param ingredient - The ingredient being validated
 * @param newAmount - The proposed new amount
 * @param options - Optional configuration
 * @returns Validation result with valid flag, optional error, and optional warning
 */
export function validateIngredientAmount(
  ingredient: ValidatableIngredient,
  newAmount: number,
  options: {
    /** Include warning for large changes (default: true) */
    includeWarnings?: boolean
  } = {}
): IngredientValidationResult {
  const { includeWarnings = true } = options

  // Rule 1: Amount cannot be negative
  if (newAmount < 0) {
    return { valid: false, error: 'Ilość nie może być ujemna' }
  }

  // Rule 2: Amount = 0 means excluded ingredient - always allowed
  if (newAmount === 0) {
    return { valid: true }
  }

  // Rule 3: Non-scalable ingredients can only be 0 or original amount
  if (!ingredient.is_scalable) {
    if (Math.abs(newAmount - ingredient.amount) > 0.01) {
      return { valid: false, error: 'Ten składnik nie może być skalowany' }
    }
    return { valid: true }
  }

  // Rule 4: MAX_SCALE validation for scalable ingredients
  if (newAmount > ingredient.amount * MAX_INGREDIENT_SCALE) {
    return {
      valid: false,
      error: `Ilość nie może przekraczać ${MAX_INGREDIENT_SCALE * 100}% bazowej wartości`,
    }
  }

  // Rule 5: Warning for large changes (optional)
  if (includeWarnings) {
    const originalAmount = ingredient.amount
    if (originalAmount > 0) {
      const diffPercent =
        Math.abs((newAmount - originalAmount) / originalAmount) * 100

      if (diffPercent > LARGE_CHANGE_THRESHOLD_PERCENT) {
        return {
          valid: true,
          warning: `Duża zmiana (${diffPercent.toFixed(1)}%) - może to zaburzyć proporcje przepisu`,
        }
      }
    }
  }

  return { valid: true }
}

/**
 * Server-side validation result type (without warnings, for API responses)
 */
export interface ServerValidationResult {
  valid: boolean
  error?: string
  ingredientId?: number
}

/**
 * Validates ingredient overrides for server-side use
 *
 * @param overrides - Array of ingredient overrides to validate
 * @param recipeIngredients - Map of ingredient ID to ingredient data
 * @returns Validation result
 */
export function validateIngredientOverrides(
  overrides: Array<{ ingredient_id: number; new_amount: number }>,
  recipeIngredients: Map<number, { base_amount: number; is_scalable: boolean }>
): ServerValidationResult {
  for (const override of overrides) {
    const ingredient = recipeIngredients.get(override.ingredient_id)

    if (!ingredient) {
      return {
        valid: false,
        error: `Składnik o ID ${override.ingredient_id} nie istnieje w przepisie`,
        ingredientId: override.ingredient_id,
      }
    }

    const validatable: ValidatableIngredient = {
      id: override.ingredient_id,
      amount: ingredient.base_amount,
      is_scalable: ingredient.is_scalable,
    }

    const result = validateIngredientAmount(validatable, override.new_amount, {
      includeWarnings: false,
    })

    if (!result.valid) {
      return {
        valid: false,
        error: result.error,
        ingredientId: override.ingredient_id,
      }
    }
  }

  return { valid: true }
}
