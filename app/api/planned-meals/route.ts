/**
 * GET /api/planned-meals - Route Handler
 *
 * Pobiera listę zaplanowanych posiłków w zadanym zakresie dat
 *
 * Query params:
 * - start_date: string (YYYY-MM-DD, wymagane)
 * - end_date: string (YYYY-MM-DD, wymagane)
 *
 * Response format:
 * {
 *   data: PlannedMealDTO[]
 * }
 *
 * @see .ai/10b01 api-planned-meals-implementation-plan.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPlannedMeals } from '@/lib/actions/planned-meals'
import type { GetPlannedMealsQueryInput } from '@/lib/validation/planned-meals'
import { userDataCacheHeaders } from '@/lib/utils/cache-headers'
import {
  rateLimit,
  getClientIp,
  rateLimitHeaders,
} from '@/lib/utils/rate-limit'
import { logErrorLevel } from '@/lib/error-logger'

/**
 * GET /api/planned-meals
 *
 * @example
 * GET /api/planned-meals?start_date=2024-01-01&end_date=2024-01-07
 */
export async function GET(request: NextRequest) {
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

    // 1. Parsowanie query params z URL
    const searchParams = request.nextUrl.searchParams

    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')

    // 2. Walidacja podstawowa (pełna walidacja w Server Action)
    if (!start_date || !end_date) {
      return NextResponse.json(
        {
          error: {
            message: 'Parametry start_date i end_date są wymagane',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      )
    }

    const params: GetPlannedMealsQueryInput = {
      start_date,
      end_date,
    }

    // 3. Wywołanie Server Action (walidacja + logika biznesowa)
    const result = await getPlannedMeals(params)

    // 4. Obsługa błędów z Server Action
    if (result.error) {
      const statusMap: Record<string, number> = {
        VALIDATION_ERROR: 400,
        UNAUTHORIZED: 401,
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

    // 5. Zwrócenie sukcesu (200 OK) z cache headers dla user data
    return NextResponse.json(
      { data: result.data },
      { status: 200, headers: userDataCacheHeaders }
    )
  } catch (err) {
    // 6. Catch-all dla nieoczekiwanych błędów
    logErrorLevel(err, { source: 'api.planned-meals.GET' })
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
