/**
 * PATCH /api/planned-meals/{id} - Route Handler
 *
 * Aktualizuje pojedynczy zaplanowany posiłek
 *
 * Path params:
 * - id: number (ID zaplanowanego posiłku)
 *
 * Request body (discriminated union):
 * - { action: 'mark_eaten', is_eaten: boolean }
 * - { action: 'swap_recipe', recipe_id: number }
 * - { action: 'modify_ingredients', ingredient_overrides: Array<{ingredient_id, new_amount}> }
 *
 * Response format:
 * {
 *   data: PlannedMealDTO
 * }
 *
 * @see .ai/10b01 api-planned-meals-implementation-plan.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { updatePlannedMeal } from '@/lib/actions/planned-meals'
import {
  strictRateLimit,
  getClientIp,
  rateLimitHeaders,
} from '@/lib/utils/rate-limit'
import { logErrorLevel } from '@/lib/error-logger'

/**
 * PATCH /api/planned-meals/{id}
 *
 * @example
 * PATCH /api/planned-meals/123
 * Body: { "action": "mark_eaten", "is_eaten": true }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Rate limiting check (strict for meal updates)
    const clientIp = getClientIp(request)
    const rateLimitResult = await strictRateLimit.check(clientIp)

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

    // 1. Await params (Next.js 15 requirement)
    const { id } = await params

    // 2. Pobierz ID z parametrów ścieżki i zwaliduj
    const mealId = parseInt(id, 10)
    if (isNaN(mealId) || mealId <= 0) {
      return NextResponse.json(
        {
          error: {
            message: 'Nieprawidłowe ID posiłku',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      )
    }

    // 3. Pobierz body request
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          error: {
            message: 'Nieprawidłowy format JSON',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      )
    }

    // 4. Wywołaj Server Action (walidacja + logika biznesowa)
    const result = await updatePlannedMeal(mealId, body)

    // 5. Obsługa błędów z Server Action
    if (result.error) {
      // Rozpoznanie typu błędu po treści komunikatu
      let status = 500
      let code = 'INTERNAL_SERVER_ERROR'

      if (
        result.error.includes('Nieprawidłowe') ||
        result.error.includes('przekracza') ||
        result.error.includes('nie istnieje') ||
        result.error.includes('nie może być') ||
        result.error.includes('nie pasuje')
      ) {
        status = 400
        code = 'VALIDATION_ERROR'
      } else if (result.error.includes('Uwierzytelnienie')) {
        status = 401
        code = 'UNAUTHORIZED'
      } else if (result.error.includes('nie został znaleziony')) {
        status = 404
        code = 'NOT_FOUND'
      } else if (result.error.includes('nie masz uprawnień')) {
        status = 403
        code = 'FORBIDDEN'
      }

      return NextResponse.json(
        {
          error: {
            message: result.error,
            code,
          },
        },
        { status }
      )
    }

    // 6. Zwrócenie sukcesu (200 OK)
    return NextResponse.json({ data: result.data }, { status: 200 })
  } catch (err) {
    // 7. Catch-all dla nieoczekiwanych błędów
    logErrorLevel(err, { source: 'api.planned-meals.[id].PATCH' })
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
