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
import { recipeCacheHeaders } from '@/lib/utils/cache-headers'
import {
  rateLimit,
  getClientIp,
  rateLimitHeaders,
} from '@/lib/utils/rate-limit'

/**
 * GET /api/recipes
 *
 * @example
 * GET /api/recipes?limit=10&offset=0&meal_types=breakfast,lunch&tags=ketogenic
 */
export async function GET(request: NextRequest) {
  try {
    // 0. Rate limiting check
    const clientIp = getClientIp(request)
    const rateLimitResult = rateLimit.check(clientIp)

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

    // 4. Zwrócenie sukcesu (200 OK) z cache headers
    return NextResponse.json(result.data, {
      status: 200,
      headers: recipeCacheHeaders,
    })
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
