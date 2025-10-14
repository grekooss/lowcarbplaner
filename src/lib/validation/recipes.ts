/**
 * Validation schemas for Recipes API
 *
 * Zawiera schematy walidacji Zod dla endpointu GET /recipes
 * Bazuje na specyfikacji z planu API i typach z database.types.ts
 */

import { z } from 'zod'

/**
 * Schema dla parametrów zapytania GET /recipes
 *
 * Zgodny z planem API:
 * - limit: integer, opcjonalny, domyślnie 20, min 1, max 100
 * - offset: integer, opcjonalny, domyślnie 0, min 0
 * - tags: string, opcjonalny (przecinek jako separator)
 * - meal_types: string, opcjonalny (przecinek jako separator)
 */
export const recipeQueryParamsSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit musi być większy niż 0')
    .max(100, 'Limit nie może przekraczać 100')
    .default(20),

  offset: z.coerce
    .number()
    .int()
    .min(0, 'Offset nie może być ujemny')
    .default(0),

  tags: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined
      return val.split(',').map((tag) => tag.trim())
    }),

  meal_types: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined
      const types = val.split(',').map((type) => type.trim())
      // Walidacja: wszystkie wartości muszą być z enuma
      const validTypes = ['breakfast', 'lunch', 'dinner'] as const

      const invalidTypes = types.filter(
        (type) => !validTypes.includes(type as 'breakfast' | 'lunch' | 'dinner')
      )

      if (invalidTypes.length > 0) {
        throw new Error(
          `Nieprawidłowe typy posiłków: ${invalidTypes.join(', ')}. Dozwolone: breakfast, lunch, dinner`
        )
      }

      return types as Array<'breakfast' | 'lunch' | 'dinner'>
    }),
})

/**
 * Typ wygenerowany ze schematu (po transformacji)
 */
export type RecipeQueryParams = z.infer<typeof recipeQueryParamsSchema>

/**
 * Typ wejściowy (przed transformacją - raw query params)
 */
export type RecipeQueryParamsInput = z.input<typeof recipeQueryParamsSchema>
