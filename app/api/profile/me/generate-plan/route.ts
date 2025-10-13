/**
 * POST /api/profile/me/generate-plan - Route Handler
 *
 * Uruchamia logikę biznesową do wygenerowania lub uzupełnienia 7-dniowego
 * planu posiłków dla użytkownika na podstawie jego celów żywieniowych.
 *
 * Proces:
 * 1. Weryfikacja autentykacji
 * 2. Pobranie profilu użytkownika
 * 3. Sprawdzenie czy plan już istnieje
 * 4. Generowanie 21 posiłków (7 dni × 3 posiłki)
 * 5. Batch insert do bazy danych
 *
 * Response (200 OK):
 * {
 *   status: 'success',
 *   message: 'Plan posiłków na 7 dni został pomyślnie wygenerowany',
 *   generated_days: 7
 * }
 *
 * Errors:
 * - 401 Unauthorized: Użytkownik niezalogowany
 * - 404 Not Found: Profil nie istnieje
 * - 409 Conflict: Plan już istnieje i jest kompletny
 * - 500 Internal Server Error: Błąd generatora lub bazy danych
 *
 * @see .ai/10d01 api-profile-implementation-plan.md
 */

import { NextResponse } from 'next/server'
import { generateMealPlan } from '@/lib/actions/profile'

/**
 * POST /api/profile/me/generate-plan
 *
 * @example
 * POST /api/profile/me/generate-plan
 * Authorization: Bearer {token}
 */
export async function POST() {
  try {
    // Wywołanie Server Action
    const result = await generateMealPlan()

    // Obsługa błędów z Server Action
    if (result.error) {
      switch (result.code) {
        case 'UNAUTHORIZED':
          return NextResponse.json(
            {
              error: {
                message: result.error,
                code: result.code,
              },
            },
            { status: 401 }
          )

        case 'PROFILE_NOT_FOUND':
          return NextResponse.json(
            {
              error: {
                message: result.error,
                code: result.code,
              },
            },
            { status: 404 }
          )

        case 'MEAL_PLAN_EXISTS':
          return NextResponse.json(
            {
              error: {
                message: result.error,
                code: result.code,
              },
            },
            { status: 409 }
          )

        case 'MEAL_GENERATOR_ERROR':
        case 'DATABASE_ERROR':
        case 'INTERNAL_ERROR':
        default:
          return NextResponse.json(
            {
              error: {
                message: result.error,
                code: result.code || 'INTERNAL_ERROR',
              },
            },
            { status: 500 }
          )
      }
    }

    // Zwrócenie sukcesu (200 OK)
    return NextResponse.json(result.data, { status: 200 })
  } catch (err) {
    console.error(
      'Nieoczekiwany błąd w POST /api/profile/me/generate-plan:',
      err
    )
    return NextResponse.json(
      {
        error: {
          message: 'Wewnętrzny błąd serwera',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
