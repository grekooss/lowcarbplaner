/**
 * GET /api/recipes/[id] - Route Handler
 *
 * Pobiera szczegółowe informacje o pojedynczym przepisie
 *
 * URL params:
 * - id: number (ID przepisu)
 *
 * Response format: RecipeDTO
 *
 * @see .ai/10a01 api-recipes-implementation-plan.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRecipeById } from '@/lib/actions/recipes'

/**
 * GET /api/recipes/[id]
 *
 * @example
 * GET /api/recipes/101
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Parsowanie ID z URL params
    const { id: idParam } = await params
    const recipeId = parseInt(idParam, 10)

    // 2. Walidacja ID
    if (isNaN(recipeId) || recipeId <= 0) {
      return NextResponse.json(
        {
          error: {
            message: 'Nieprawidłowe ID przepisu. Musi być liczbą większą od 0.',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      )
    }

    // 3. Wywołanie Server Action
    const result = await getRecipeById(recipeId)

    // 4. Obsługa błędów z Server Action
    if (result.error) {
      // 404 Not Found
      if (result.error.includes('nie został znaleziony')) {
        return NextResponse.json(
          {
            error: {
              message: result.error,
              code: 'NOT_FOUND',
            },
          },
          { status: 404 }
        )
      }

      // 500 Internal Server Error
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

    // 5. Zwrócenie sukcesu (200 OK)
    return NextResponse.json(result.data, { status: 200 })
  } catch (err) {
    // 6. Catch-all dla nieoczekiwanych błędów
    console.error('Nieoczekiwany błąd w GET /api/recipes/[id]:', err)
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
