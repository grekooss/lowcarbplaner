/**
 * GET /api/planned-meals/{id}/replacements - Route Handler
 *
 * Pobiera listę sugerowanych zamienników dla zaplanowanego posiłku
 *
 * Path params:
 * - id: number (ID zaplanowanego posiłku)
 *
 * Response format:
 * {
 *   data: ReplacementRecipeDTO[]
 * }
 *
 * Zamienniki są filtrowane według:
 * - Tego samego meal_type
 * - Różnicy kalorycznej ±15%
 * - Posortowane według najniższej różnicy kalorycznej
 * - Limit 10 wyników
 *
 * @see .ai/10b01 api-planned-meals-implementation-plan.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { getReplacementRecipes } from '@/lib/actions/planned-meals'
import {
  rateLimit,
  getClientIp,
  rateLimitHeaders,
} from '@/lib/utils/rate-limit'
import { logErrorLevel } from '@/lib/error-logger'

/**
 * GET /api/planned-meals/{id}/replacements
 *
 * @example
 * GET /api/planned-meals/123/replacements
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

    // 3. Wywołaj Server Action (walidacja + logika biznesowa)
    const result = await getReplacementRecipes(mealId)

    // 4. Obsługa błędów z Server Action
    if (result.error) {
      // Rozpoznanie typu błędu po treści komunikatu
      let status = 500
      let code = 'INTERNAL_SERVER_ERROR'

      if (result.error.includes('Nieprawidłowe')) {
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

    // 5. Zwrócenie sukcesu (200 OK)
    // Uwaga: Nawet jeśli lista jest pusta, zwracamy 200 z pustą tablicą
    return NextResponse.json({ data: result.data }, { status: 200 })
  } catch (err) {
    // 6. Catch-all dla nieoczekiwanych błędów
    logErrorLevel(err, { source: 'api.planned-meals.[id].replacements.GET' })
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
