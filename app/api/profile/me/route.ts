/**
 * GET /api/profile/me - Route Handler
 * PATCH /api/profile/me - Route Handler
 *
 * Operacje na profilu zalogowanego użytkownika:
 * - GET: Pobiera profil użytkownika
 * - PATCH: Aktualizuje profil użytkownika (partial update)
 *
 * GET Response (200 OK):
 * {
 *   email: string,
 *   gender: 'male' | 'female',
 *   age: number,
 *   weight_kg: number,
 *   height_cm: number,
 *   activity_level: string,
 *   goal: string,
 *   weight_loss_rate_kg_week: number | null,
 *   disclaimer_accepted_at: string,
 *   target_calories: number,
 *   target_carbs_g: number,
 *   target_protein_g: number,
 *   target_fats_g: number
 * }
 *
 * PATCH Request body (wszystkie pola opcjonalne):
 * {
 *   gender?: 'male' | 'female',
 *   age?: number,
 *   weight_kg?: number,
 *   height_cm?: number,
 *   activity_level?: string,
 *   goal?: string,
 *   weight_loss_rate_kg_week?: number
 * }
 *
 * PATCH Response (200 OK): Zaktualizowany profil (struktura jak GET)
 *
 * Errors (dla obu metod):
 * - 400 Bad Request: Nieprawidłowe dane (tylko PATCH)
 * - 401 Unauthorized: Użytkownik niezalogowany
 * - 404 Not Found: Profil nie istnieje
 * - 500 Internal Server Error: Błąd serwera
 *
 * @see .ai/10d01 api-profile-implementation-plan.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMyProfile, updateMyProfile } from '@/lib/actions/profile'
import type { UpdateProfileInput } from '@/lib/validation/profile'
import { userDataCacheHeaders } from '@/lib/utils/cache-headers'
import {
  rateLimit,
  strictRateLimit,
  getClientIp,
  rateLimitHeaders,
} from '@/lib/utils/rate-limit'

/**
 * GET /api/profile/me
 *
 * @example
 * GET /api/profile/me
 * Authorization: Bearer {token}
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

    // 1. Wywołanie Server Action
    const result = await getMyProfile()

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

    // Zwrócenie sukcesu (200 OK) z cache headers dla user data
    return NextResponse.json(result.data, {
      status: 200,
      headers: userDataCacheHeaders,
    })
  } catch (err) {
    console.error('Nieoczekiwany błąd w GET /api/profile/me:', err)
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

/**
 * PATCH /api/profile/me
 *
 * @example
 * PATCH /api/profile/me
 * Content-Type: application/json
 * Authorization: Bearer {token}
 *
 * {
 *   "weight_kg": 69.0,
 *   "activity_level": "high"
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    // 0. Rate limiting check (strict for profile updates)
    const clientIp = getClientIp(request)
    const rateLimitResult = strictRateLimit.check(clientIp)

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

    // 1. Parsowanie body z request
    let body: UpdateProfileInput
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          error: {
            message: 'Nieprawidłowy format JSON w body żądania',
            code: 'INVALID_JSON',
          },
        },
        { status: 400 }
      )
    }

    // 2. Wywołanie Server Action (walidacja + logika biznesowa)
    const result = await updateMyProfile(body)

    // 3. Obsługa błędów z Server Action
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

        case 'VALIDATION_ERROR':
          return NextResponse.json(
            {
              error: {
                message: result.error,
                code: result.code,
                details: result.details,
              },
            },
            { status: 400 }
          )

        case 'CALORIES_BELOW_MINIMUM':
          return NextResponse.json(
            {
              error: {
                message: result.error,
                code: result.code,
                details: result.details,
              },
            },
            { status: 400 }
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

    // 4. Zwrócenie sukcesu (200 OK)
    return NextResponse.json(result.data, { status: 200 })
  } catch (err) {
    console.error('Nieoczekiwany błąd w PATCH /api/profile/me:', err)
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
