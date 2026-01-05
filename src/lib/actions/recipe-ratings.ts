/**
 * Server Actions for Recipe Ratings API
 *
 * Implementuje logikę biznesową dla operacji na ocenach przepisów:
 * - POST/PUT rating (upsert - create or update)
 * - GET user's rating for a recipe
 * - DELETE user's rating
 *
 * Tabela user_recipe_ratings automatycznie aktualizuje
 * recipes.average_rating i reviews_count przez trigger.
 */

'use server'

import { createServerClient } from '@/lib/supabase/server'
import { logErrorLevel } from '@/lib/error-logger'
import { z } from 'zod'

/**
 * Schema walidacji dla oceny przepisu
 */
const ratingSchema = z.object({
  recipeId: z.number().int().positive('ID przepisu musi być liczbą dodatnią'),
  rating: z
    .number()
    .int()
    .min(1, 'Ocena musi być co najmniej 1')
    .max(5, 'Ocena może być maksymalnie 5'),
})

/**
 * Kody błędów dla akcji ocen
 */
type RatingErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR'

/**
 * Standardowy typ wyniku Server Action (Discriminated Union)
 */
type ActionResult<T> =
  | { data: T; error?: never; code?: never }
  | { data?: never; error: string; code: RatingErrorCode }

/**
 * Typ danych oceny przepisu
 */
type RecipeRating = {
  id: number
  user_id: string
  recipe_id: number
  rating: number
  created_at: string
  updated_at: string
}

/**
 * Dodaje lub aktualizuje ocenę przepisu przez użytkownika
 *
 * Używa upsert (ON CONFLICT DO UPDATE) - jeden użytkownik może mieć
 * tylko jedną ocenę na przepis.
 *
 * @param recipeId - ID przepisu do oceny
 * @param rating - Ocena od 1 do 5
 * @returns Utworzona/zaktualizowana ocena
 *
 * @example
 * ```typescript
 * const result = await rateRecipe(101, 5)
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log('Ocena zapisana:', result.data.rating)
 * }
 * ```
 */
export async function rateRecipe(
  recipeId: number,
  rating: number
): Promise<ActionResult<RecipeRating>> {
  try {
    // 1. Walidacja danych wejściowych
    const validated = ratingSchema.safeParse({ recipeId, rating })
    if (!validated.success) {
      return {
        error: validated.error.issues.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      }
    }

    // 2. Pobierz zalogowanego użytkownika
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        error: 'Musisz być zalogowany, aby oceniać przepisy',
        code: 'UNAUTHORIZED',
      }
    }

    // 3. Upsert oceny (INSERT lub UPDATE przy konflikcie)
    const { data, error } = await supabase
      .from('user_recipe_ratings')
      .upsert(
        {
          user_id: user.id,
          recipe_id: validated.data.recipeId,
          rating: validated.data.rating,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,recipe_id',
        }
      )
      .select()
      .single()

    if (error) {
      logErrorLevel(error, {
        source: 'recipe-ratings.rateRecipe',
        userId: user.id,
        metadata: { recipeId: validated.data.recipeId, errorCode: error.code },
      })
      return {
        error: `Błąd zapisywania oceny: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    return { data }
  } catch (err) {
    logErrorLevel(err, { source: 'recipe-ratings.rateRecipe' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}

/**
 * Pobiera ocenę użytkownika dla danego przepisu
 *
 * @param recipeId - ID przepisu
 * @returns Ocena użytkownika lub null jeśli nie oceniał
 *
 * @example
 * ```typescript
 * const result = await getUserRating(101)
 * if (result.data) {
 *   console.log('Twoja ocena:', result.data.rating)
 * } else {
 *   console.log('Nie oceniłeś jeszcze tego przepisu')
 * }
 * ```
 */
export async function getUserRating(
  recipeId: number
): Promise<ActionResult<RecipeRating | null>> {
  try {
    // 1. Walidacja ID
    if (!recipeId || recipeId <= 0) {
      return {
        error: 'Nieprawidłowe ID przepisu',
        code: 'VALIDATION_ERROR',
      }
    }

    // 2. Pobierz zalogowanego użytkownika
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      // Dla niezalogowanych użytkowników zwracamy null (nie błąd)
      return { data: null }
    }

    // 3. Pobierz ocenę użytkownika
    const { data, error } = await supabase
      .from('user_recipe_ratings')
      .select('*')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle()

    if (error) {
      logErrorLevel(error, {
        source: 'recipe-ratings.getUserRating',
        userId: user.id,
        metadata: { recipeId, errorCode: error.code },
      })
      return {
        error: `Błąd pobierania oceny: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    return { data }
  } catch (err) {
    logErrorLevel(err, { source: 'recipe-ratings.getUserRating' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}

/**
 * Usuwa ocenę użytkownika dla danego przepisu
 *
 * @param recipeId - ID przepisu
 * @returns true jeśli usunięto, false jeśli nie było oceny
 *
 * @example
 * ```typescript
 * const result = await deleteRating(101)
 * if (result.data) {
 *   console.log('Ocena usunięta')
 * }
 * ```
 */
export async function deleteRating(
  recipeId: number
): Promise<ActionResult<boolean>> {
  try {
    // 1. Walidacja ID
    if (!recipeId || recipeId <= 0) {
      return {
        error: 'Nieprawidłowe ID przepisu',
        code: 'VALIDATION_ERROR',
      }
    }

    // 2. Pobierz zalogowanego użytkownika
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        error: 'Musisz być zalogowany, aby usuwać oceny',
        code: 'UNAUTHORIZED',
      }
    }

    // 3. Usuń ocenę
    const { error, count } = await supabase
      .from('user_recipe_ratings')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)

    if (error) {
      logErrorLevel(error, {
        source: 'recipe-ratings.deleteRating',
        userId: user.id,
        metadata: { recipeId, errorCode: error.code },
      })
      return {
        error: `Błąd usuwania oceny: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    return { data: (count ?? 0) > 0 }
  } catch (err) {
    logErrorLevel(err, { source: 'recipe-ratings.deleteRating' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}
