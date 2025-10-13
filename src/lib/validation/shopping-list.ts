/**
 * Walidacja dla Shopping List API
 *
 * Ten plik zawiera schematy Zod dla walidacji parametrów API listy zakupów.
 *
 * @see .ai/10c01 api-shopping-list-implementation-plan.md
 */

import { z } from 'zod'

/**
 * Schema dla parametrów query GET /shopping-list
 *
 * Waliduje:
 * - Format daty YYYY-MM-DD
 * - start_date <= end_date
 * - Zakres dat <= 30 dni (ochrona przed DoS)
 */
export const shoppingListQuerySchema = z
  .object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format daty musi być YYYY-MM-DD')
      .refine(
        (date) => {
          const parsed = new Date(date)
          return !isNaN(parsed.getTime())
        },
        { message: 'Nieprawidłowa data' }
      ),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format daty musi być YYYY-MM-DD')
      .refine(
        (date) => {
          const parsed = new Date(date)
          return !isNaN(parsed.getTime())
        },
        { message: 'Nieprawidłowa data' }
      ),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      return start <= end
    },
    {
      message: 'start_date nie może być późniejsza niż end_date',
      path: ['start_date'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays <= 30
    },
    {
      message: 'Zakres dat nie może przekraczać 30 dni',
      path: ['end_date'],
    }
  )

/**
 * Typ dla walidowanych parametrów query
 */
export type ShoppingListQueryInput = z.infer<typeof shoppingListQuerySchema>
