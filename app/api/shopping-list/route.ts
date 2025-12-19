/**
 * GET /api/shopping-list - Route Handler
 *
 * Generuje zagregowaną listę zakupów na podstawie zaplanowanych posiłków
 * w podanym zakresie dat. Lista bazuje na oryginalnych przepisach
 * (bez nadpisanych składników).
 *
 * Query params:
 * - start_date: string (YYYY-MM-DD, wymagany)
 * - end_date: string (YYYY-MM-DD, wymagany)
 *
 * Response format:
 * [
 *   {
 *     category: string,
 *     items: [
 *       { name: string, total_amount: number, unit: string }
 *     ]
 *   }
 * ]
 *
 * @see .ai/10c01 api-shopping-list-implementation-plan.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { getShoppingList } from '@/lib/actions/shopping-list'
import type { ShoppingListQueryInput } from '@/lib/validation/shopping-list'
import { shoppingListCacheHeaders } from '@/lib/utils/cache-headers'
import {
  rateLimit,
  getClientIp,
  rateLimitHeaders,
} from '@/lib/utils/rate-limit'

/**
 * GET /api/shopping-list
 *
 * @example
 * GET /api/shopping-list?start_date=2025-01-15&end_date=2025-01-21
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
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')

    // 2. Sprawdzenie czy wymagane parametry zostały podane
    if (!start_date || !end_date) {
      return NextResponse.json(
        {
          error: {
            message: 'Wymagane parametry: start_date, end_date',
            code: 'MISSING_PARAMETERS',
          },
        },
        { status: 400 }
      )
    }

    // 3. Przygotowanie parametrów dla Server Action
    const params: ShoppingListQueryInput = {
      start_date,
      end_date,
    }

    // 4. Wywołanie Server Action (walidacja + autoryzacja + logika biznesowa)
    const result = await getShoppingList(params)

    // 5. Obsługa błędów z Server Action
    if (result.error) {
      // Rozpoznanie typu błędu po kodzie
      if (result.code === 'VALIDATION_ERROR') {
        return NextResponse.json(
          {
            error: {
              message: result.error,
              code: result.code,
            },
          },
          { status: 400 }
        )
      }

      if (result.code === 'UNAUTHORIZED') {
        return NextResponse.json(
          {
            error: {
              message: result.error,
              code: result.code,
            },
          },
          { status: 401 }
        )
      }

      // Inne błędy to Internal Server Error
      return NextResponse.json(
        {
          error: {
            message: result.error,
            code: result.code || 'INTERNAL_SERVER_ERROR',
          },
        },
        { status: 500 }
      )
    }

    // 6. Zwrócenie sukcesu (200 OK) z no-cache headers (computed data)
    return NextResponse.json(result.data, {
      status: 200,
      headers: shoppingListCacheHeaders,
    })
  } catch (err) {
    // 7. Catch-all dla nieoczekiwanych błędów
    console.error('Nieoczekiwany błąd w GET /api/shopping-list:', err)
    return NextResponse.json(
      {
        error: {
          message: 'Błąd serwera podczas generowania listy zakupów',
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
