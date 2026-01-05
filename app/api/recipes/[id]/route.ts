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
import { recipeCacheHeaders } from '@/lib/utils/cache-headers'
import {
  rateLimit,
  getClientIp,
  rateLimitHeaders,
} from '@/lib/utils/rate-limit'
import { logErrorLevel } from '@/lib/error-logger'

/**
 * GET /api/recipes/[id]
 *
 * @example
 * GET /api/recipes/101
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Rate limiting check
    const clientIp = getClientIp(request)
    const rateLimitResult = await rateLimit.check(clientIp)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: {
            message: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
        },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders(rateLimitResult),
            'Retry-After': '60',
          },
        }
      )
    }

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
      const statusMap: Record<string, number> = {
        VALIDATION_ERROR: 400,
        NOT_FOUND: 404,
        DATABASE_ERROR: 500,
        INTERNAL_ERROR: 500,
      }

      return NextResponse.json(
        {
          error: {
            message: result.error,
            code: result.code,
          },
        },
        { status: statusMap[result.code] || 500 }
      )
    }

    // 5. Zwrócenie sukcesu (200 OK) z cache headers
    return NextResponse.json(result.data, {
      status: 200,
      headers: recipeCacheHeaders,
    })
  } catch (err) {
    // 6. Catch-all dla nieoczekiwanych błędów
    logErrorLevel(err, { source: 'api.recipes.[id].GET' })
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
