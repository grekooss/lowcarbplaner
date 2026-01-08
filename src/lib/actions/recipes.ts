/**
 * Server Actions for Recipes API
 *
 * Implementuje logikę biznesową dla operacji na przepisach:
 * - GET /recipes (paginacja + filtrowanie)
 * - GET /recipes/{id} (szczegóły przepisu)
 *
 * @see .ai/10 API-PLAN.md
 */

'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { logErrorLevel } from '@/lib/error-logger'
import type { RecipeDTO } from '@/types/dto.types'
import {
  recipeQueryParamsSchema,
  type RecipeQueryParamsInput,
} from '@/lib/validation/recipes'
import {
  transformRecipeToDTO,
  RECIPE_SELECT_FULL,
} from '@/lib/utils/recipe-transformer'

/**
 * Typ odpowiedzi dla listy przepisów (zgodny z planem API)
 */
type RecipesResponse = {
  count: number
  next: string | null
  previous: string | null
  results: RecipeDTO[]
}

/**
 * Kody błędów dla akcji przepisów
 */
type RecipeErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR'

/**
 * Standardowy typ wyniku Server Action (Discriminated Union)
 */
type ActionResult<T> =
  | { data: T; error?: never; code?: never }
  | { data?: never; error: string; code: RecipeErrorCode }

/**
 * GET /recipes - Pobiera listę przepisów z paginacją i filtrowaniem
 *
 * @param params - Parametry zapytania (limit, offset, tags, meal_types)
 * @returns Lista przepisów z metadanymi paginacji
 *
 * @example
 * ```typescript
 * const result = await getRecipes({ limit: 10, offset: 0, meal_types: 'breakfast,lunch' })
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.results) // RecipeDTO[]
 * }
 * ```
 */
export async function getRecipes(
  params: RecipeQueryParamsInput
): Promise<ActionResult<RecipesResponse>> {
  try {
    // 1. Walidacja parametrów wejściowych
    const validated = recipeQueryParamsSchema.safeParse(params)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe parametry zapytania: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
        code: 'VALIDATION_ERROR',
      }
    }

    const { limit, offset, tags, meal_types } = validated.data

    // 2. Utworzenie Supabase Admin client (content schema to publiczne dane)
    const supabase = createAdminClient()

    // 3. Budowanie zapytania z paginacją
    // Dodaj average_rating i reviews_count do standardowego SELECT
    const selectWithRating = `
      ${RECIPE_SELECT_FULL.trim()},
      average_rating,
      reviews_count
    `
    let query = supabase
      .from('recipes')
      .select(selectWithRating, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // 4. Filtrowanie po meal_types (array overlap)
    if (meal_types && meal_types.length > 0) {
      query = query.overlaps('meal_types', meal_types)
    }

    // 5. Filtrowanie po tags (array overlap)
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    // 6. Wykonanie zapytania
    const { data, error, count } = await query

    if (error) {
      logErrorLevel(error, {
        source: 'recipes.getRecipes',
        metadata: { query: validated.data, errorCode: error.code },
      })
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 7. Transformacja do DTO (z przetwarzaniem URL obrazów)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (data || []).map((recipe: any) =>
      transformRecipeToDTO(recipe, { processImageUrl: true })
    )

    // 8. Generowanie linków next/previous (zgodnie z planem API)
    const totalCount = count ?? 0
    const hasNext = offset + limit < totalCount
    const hasPrevious = offset > 0

    const baseUrl = '/recipes' // Lub dynamicznie z request.url
    const next = hasNext
      ? `${baseUrl}?limit=${limit}&offset=${offset + limit}${tags ? `&tags=${tags.join(',')}` : ''}${meal_types ? `&meal_types=${meal_types.join(',')}` : ''}`
      : null

    const previous = hasPrevious
      ? `${baseUrl}?limit=${limit}&offset=${Math.max(0, offset - limit)}${tags ? `&tags=${tags.join(',')}` : ''}${meal_types ? `&meal_types=${meal_types.join(',')}` : ''}`
      : null

    // 9. Zwrócenie wyniku
    return {
      data: {
        count: totalCount,
        next,
        previous,
        results,
      },
    }
  } catch (err) {
    logErrorLevel(err, { source: 'recipes.getRecipes' })
    return {
      error: 'Wewnętrzny błąd serwera',
      code: 'INTERNAL_ERROR',
    }
  }
}

/**
 * GET /recipes/{id} - Pobiera szczegółowe informacje o pojedynczym przepisie
 *
 * @param recipeId - ID przepisu
 * @returns RecipeDTO z pełnymi szczegółami (składniki, instrukcje)
 *
 * @example
 * ```typescript
 * const result = await getRecipeById(101)
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.name) // "Jajecznica z boczkiem"
 * }
 * ```
 */
export async function getRecipeById(
  recipeId: number
): Promise<ActionResult<RecipeDTO>> {
  try {
    // 1. Walidacja ID
    if (!recipeId || recipeId <= 0) {
      return { error: 'Nieprawidłowe ID przepisu', code: 'VALIDATION_ERROR' }
    }

    // 2. Utworzenie Supabase Admin client (content schema to publiczne dane)
    const supabase = createAdminClient()

    // 3. Zapytanie z pełnymi szczegółami
    const selectWithRating = `
      ${RECIPE_SELECT_FULL.trim()},
      average_rating,
      reviews_count
    `
    const { data, error } = await supabase
      .from('recipes')
      .select(selectWithRating)
      .eq('id', recipeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Przepis nie został znaleziony', code: 'NOT_FOUND' }
      }
      logErrorLevel(error, {
        source: 'recipes.getRecipeById',
        metadata: { recipeId, errorCode: error.code },
      })
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 4. Transformacja do DTO (z przetwarzaniem URL obrazów)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recipe = transformRecipeToDTO(data as any, { processImageUrl: true })

    return { data: recipe }
  } catch (err) {
    logErrorLevel(err, { source: 'recipes.getRecipeById' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}

/**
 * GET /recipes/{slug} - Pobiera przepis po SEO-friendly slug
 *
 * @param slug - SEO-friendly slug przepisu (np. "salatka-grecka-z-feta")
 * @returns RecipeDTO z pełnymi szczegółami (składniki, instrukcje)
 *
 * @example
 * ```typescript
 * const result = await getRecipeBySlug('jajecznica-z-boczkiem')
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.name) // "Jajecznica z boczkiem"
 * }
 * ```
 */
export async function getRecipeBySlug(
  slug: string
): Promise<ActionResult<RecipeDTO>> {
  try {
    // 1. Walidacja slug
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return { error: 'Nieprawidłowy slug przepisu', code: 'VALIDATION_ERROR' }
    }

    // Sanitize slug - tylko dozwolone znaki
    const sanitizedSlug = slug.toLowerCase().trim()
    if (!/^[a-z0-9-]+$/.test(sanitizedSlug)) {
      return { error: 'Nieprawidłowy format slug', code: 'VALIDATION_ERROR' }
    }

    // 2. Utworzenie Supabase Admin client (content schema to publiczne dane)
    const supabase = createAdminClient()

    // 3. Zapytanie z pełnymi szczegółami po slug
    const selectWithRating = `
      ${RECIPE_SELECT_FULL.trim()},
      average_rating,
      reviews_count
    `
    const { data, error } = await supabase
      .from('recipes')
      .select(selectWithRating)
      .eq('slug', sanitizedSlug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Przepis nie został znaleziony', code: 'NOT_FOUND' }
      }
      logErrorLevel(error, {
        source: 'recipes.getRecipeBySlug',
        metadata: { slug: sanitizedSlug, errorCode: error.code },
      })
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 4. Transformacja do DTO (z przetwarzaniem URL obrazów)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recipe = transformRecipeToDTO(data as any, { processImageUrl: true })

    return { data: recipe }
  } catch (err) {
    logErrorLevel(err, { source: 'recipes.getRecipeBySlug' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}
