/**
 * Validation schemas for Planned Meals API
 *
 * Zawiera schematy walidacji Zod dla endpointów planned-meals
 * Bazuje na specyfikacji z .ai/10b01 api-planned-meals-implementation-plan.md
 */

import { z } from 'zod'

/**
 * Pomocniczy schema dla ID (obsługuje number, bigint, string z float)
 * Konwertuje wszystkie typy na integer używając parseInt
 */
const integerIdSchema = z
  .union([z.number(), z.bigint(), z.string()])
  .transform((val) => {
    if (typeof val === 'bigint') {
      return Number(val)
    }
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10)
      if (Number.isNaN(parsed)) {
        throw new Error(`Nieprawidłowe ID: ${val}`)
      }
      return parsed
    }
    return Math.round(val)
  })
  .pipe(z.number().int().positive())

/**
 * Schema dla parametrów zapytania GET /planned-meals
 *
 * Wymagane parametry:
 * - start_date: string YYYY-MM-DD
 * - end_date: string YYYY-MM-DD
 *
 * Walidacje:
 * - Format daty: YYYY-MM-DD
 * - end_date >= start_date
 * - Zakres dat <= 30 dni (ochrona przed performance issues)
 */
export const getPlannedMealsQuerySchema = z
  .object({
    start_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Nieprawidłowy format daty. Wymagany: YYYY-MM-DD'
      ),
    end_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Nieprawidłowy format daty. Wymagany: YYYY-MM-DD'
      ),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      return end >= start
    },
    {
      message: 'Data końcowa musi być późniejsza lub równa dacie początkowej',
      path: ['end_date'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
      return diffDays <= 30
    },
    {
      message: 'Zakres dat nie może przekraczać 30 dni',
      path: ['end_date'],
    }
  )

/**
 * Typ wygenerowany ze schematu (po transformacji)
 */
export type GetPlannedMealsQuery = z.infer<typeof getPlannedMealsQuerySchema>

/**
 * Typ wejściowy (przed transformacją - raw query params)
 */
export type GetPlannedMealsQueryInput = z.input<
  typeof getPlannedMealsQuerySchema
>

/**
 * Schema dla body PATCH /planned-meals/{id}
 *
 * Discriminated Union dla trzech wariantów operacji:
 * 1. mark_eaten - Oznaczenie posiłku jako zjedzony/niezjedzony
 * 2. swap_recipe - Wymiana przepisu
 * 3. modify_ingredients - Modyfikacja gramatury składników
 */
export const updatePlannedMealBodySchema = z.discriminatedUnion('action', [
  // Wariant 1: Oznaczenie jako zjedzony
  z.object({
    action: z.literal('mark_eaten'),
    is_eaten: z.boolean(),
  }),

  // Wariant 2: Wymiana przepisu
  z.object({
    action: z.literal('swap_recipe'),
    recipe_id: integerIdSchema,
  }),

  // Wariant 3: Modyfikacja składników (pusta tablica = reset do oryginalnych wartości)
  z.object({
    action: z.literal('modify_ingredients'),
    ingredient_overrides: z.array(
      z.object({
        ingredient_id: integerIdSchema,
        new_amount: z
          .number()
          .nonnegative(
            'new_amount nie może być ujemny (0 = wykluczenie składnika)'
          ),
      })
    ),
  }),
])

/**
 * Typ wygenerowany ze schematu (po transformacji)
 */
export type UpdatePlannedMealBody = z.infer<typeof updatePlannedMealBodySchema>

/**
 * Typ wejściowy (przed transformacją)
 */
export type UpdatePlannedMealBodyInput = z.input<
  typeof updatePlannedMealBodySchema
>

/**
 * Schema dla parametru path {id}
 * Używa wspólnego integerIdSchema dla spójności
 */
export const mealIdSchema = integerIdSchema

/**
 * Typ dla ID posiłku
 */
export type MealId = z.infer<typeof mealIdSchema>
