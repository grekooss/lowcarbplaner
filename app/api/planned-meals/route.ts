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

/**
 * GET /api/planned-meals
 *
 * @example
 * GET /api/planned-meals?start_date=2024-01-01&end_date=2024-01-07
 */
export async function GET(request: NextRequest) {
  try {
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
      // Rozpoznanie typu błędu po treści komunikatu
      let status = 500
      let code = 'INTERNAL_SERVER_ERROR'

      if (result.error.includes('Nieprawidłowe parametry')) {
        status = 400
        code = 'VALIDATION_ERROR'
      } else if (result.error.includes('Uwierzytelnienie')) {
        status = 401
        code = 'UNAUTHORIZED'
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
    return NextResponse.json({ data: result.data }, { status: 200 })
  } catch (err) {
    // 6. Catch-all dla nieoczekiwanych błędów
    console.error('Nieoczekiwany błąd w GET /api/planned-meals:', err)
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
