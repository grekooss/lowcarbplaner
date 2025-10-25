/**
 * Server Actions for Shopping List API
 *
 * Implementuje logikę biznesową dla operacji na liście zakupów:
 * - GET /shopping-list (generowanie zagregowanej listy zakupów)
 *
 * @see .ai/10c01 api-shopping-list-implementation-plan.md
 */

'use server'

import { createServerClient } from '@/lib/supabase/server'
import { generateShoppingList } from '@/services/shopping-list'
import {
  shoppingListQuerySchema,
  type ShoppingListQueryInput,
} from '@/lib/validation/shopping-list'
import type { ShoppingListResponseDTO } from '@/types/dto.types'

/**
 * Standardowy typ wyniku Server Action (Discriminated Union)
 */
type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string; code?: string }

/**
 * GET /shopping-list - Generuje zagregowaną listę zakupów w zakresie dat
 *
 * Lista bazuje na oryginalnych przepisach (bez ingredient_overrides).
 * Składniki są sumowane i grupowane według kategorii.
 *
 * Wymagania:
 * - Użytkownik musi być zalogowany (Supabase Auth)
 * - start_date i end_date w formacie YYYY-MM-DD
 * - start_date <= end_date
 * - Zakres dat <= 30 dni
 *
 * @param params - Parametry zapytania (start_date, end_date)
 * @returns Lista kategorii ze składnikami i zsumowanymi ilościami
 *
 * @example
 * ```typescript
 * const result = await getShoppingList({
 *   start_date: '2025-01-15',
 *   end_date: '2025-01-21'
 * })
 *
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data) // [{ category: 'meat', items: [...] }]
 * }
 * ```
 */
export async function getShoppingList(
  params: ShoppingListQueryInput
): Promise<ActionResult<ShoppingListResponseDTO>> {
  try {
    // 1. Walidacja parametrów wejściowych
    const validated = shoppingListQuerySchema.safeParse(params)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe parametry zapytania: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
        code: 'VALIDATION_ERROR',
      }
    }

    const { start_date, end_date } = validated.data

    // 2. Autoryzacja - sprawdzenie czy użytkownik jest zalogowany
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        error: 'Brak autoryzacji. Wymagane logowanie.',
        code: 'UNAUTHORIZED',
      }
    }

    const userId = user.id

    // 3. Generowanie listy zakupów przez service layer
    const startTime = performance.now()
    const shoppingList = await generateShoppingList(
      userId,
      start_date,
      end_date
    )
    const endTime = performance.now()

    // 4. Logowanie performance metrics
    console.log(
      `Shopping list generated in ${Math.round(endTime - startTime)}ms for user ${userId} (${start_date} to ${end_date})`
    )

    // 5. Zwrócenie wyniku
    return {
      data: shoppingList,
    }
  } catch (err) {
    console.error('Nieoczekiwany błąd w getShoppingList:', err)
    return {
      error: 'Błąd serwera podczas generowania listy zakupów',
      code: 'INTERNAL_SERVER_ERROR',
    }
  }
}
