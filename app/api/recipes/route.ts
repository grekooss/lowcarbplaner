/**
 * GET /api/recipes - Route Handler
 *
 * Pobiera listę przepisów z opcjonalnymi filtrami i paginacją
 *
 * Query params:
 * - limit: number (1-100, default 20)
 * - offset: number (>= 0, default 0)
 * - tags: string (comma-separated)
 * - meal_types: string (comma-separated: breakfast,lunch,dinner)
 *
 * Response format:
 * {
 *   count: number,
 *   next: string | null,
 *   previous: string | null,
 *   results: RecipeDTO[]
 * }
 *
 * @see .ai/10a01 api-recipes-implementation-plan.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRecipes } from '@/lib/actions/recipes'
import type { RecipeQueryParamsInput } from '@/lib/validation/recipes'

/**
 * GET /api/recipes
 *
 * @example
 * GET /api/recipes?limit=10&offset=0&meal_types=breakfast,lunch&tags=ketogenic
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Parsowanie query params z URL
    const searchParams = request.nextUrl.searchParams

    const params: RecipeQueryParamsInput = {
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
      tags: searchParams.get('tags') ?? undefined,
      meal_types: searchParams.get('meal_types') ?? undefined,
    }

    // 2. Wywołanie Server Action (walidacja + logika biznesowa)
    const result = await getRecipes(params)

    // 3. Obsługa błędów z Server Action
    if (result.error) {
      // Rozpoznanie typu błędu po treści komunikatu
      if (result.error.includes('Nieprawidłowe parametry')) {
        return NextResponse.json(
          {
            error: {
              message: result.error,
              code: 'VALIDATION_ERROR',
            },
          },
          { status: 400 }
        )
      }

      // Inne błędy to Internal Server Error
      return NextResponse.json(
        {
          error: {
            message: result.error,
            code: 'INTERNAL_SERVER_ERROR',
          },
        },
        { status: 500 }
      )
    }

    // 4. Zwrócenie sukcesu (200 OK)
    return NextResponse.json(result.data, { status: 200 })
  } catch (err) {
    // 5. Catch-all dla nieoczekiwanych błędów
    console.error('Nieoczekiwany błąd w GET /api/recipes:', err)
    return NextResponse.json(
      {
        error: {
          message: 'Wewnętrzny błąd serwera',
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
