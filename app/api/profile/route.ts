/**
 * POST /api/profile - Route Handler
 *
 * Tworzy profil użytkownika po zakończeniu onboardingu.
 * Ta operacja jest wykonywana tylko raz.
 *
 * Request body:
 * {
 *   gender: 'male' | 'female',
 *   age: number (18-100),
 *   weight_kg: number (40-300),
 *   height_cm: number (140-250),
 *   activity_level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high',
 *   goal: 'weight_loss' | 'weight_maintenance',
 *   weight_loss_rate_kg_week?: number (0.25-1.0, wymagane gdy goal='weight_loss'),
 *   disclaimer_accepted_at: string (ISO 8601 datetime)
 * }
 *
 * Response (201 Created):
 * {
 *   id: string,
 *   email: string,
 *   ...input fields,
 *   target_calories: number,
 *   target_carbs_g: number,
 *   target_protein_g: number,
 *   target_fats_g: number,
 *   created_at: string,
 *   updated_at: string
 * }
 *
 * Errors:
 * - 400 Bad Request: Nieprawidłowe dane lub kalorie poniżej minimum
 * - 401 Unauthorized: Użytkownik niezalogowany
 * - 409 Conflict: Profil już istnieje
 * - 500 Internal Server Error: Błąd serwera
 *
 * @see .ai/10d01 api-profile-implementation-plan.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { createProfile } from '@/lib/actions/profile'
import type { CreateProfileInput } from '@/lib/validation/profile'
import {
  strictRateLimit,
  getClientIp,
  rateLimitHeaders,
} from '@/lib/utils/rate-limit'

/**
 * POST /api/profile
 *
 * Rate limited: 10 requests per minute per IP.
 *
 * @example
 * POST /api/profile
 * Content-Type: application/json
 *
 * {
 *   "gender": "female",
 *   "age": 30,
 *   "weight_kg": 70.5,
 *   "height_cm": 165,
 *   "activity_level": "moderate",
 *   "goal": "weight_loss",
 *   "weight_loss_rate_kg_week": 0.5,
 *   "disclaimer_accepted_at": "2023-10-27T10:00:00Z"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 0. Rate limiting check
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
    let body: CreateProfileInput
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
    const result = await createProfile(body)

    // 3. Obsługa błędów z Server Action
    if (result.error) {
      // Mapowanie kodów błędów na kody HTTP
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

        case 'PROFILE_ALREADY_EXISTS':
          return NextResponse.json(
            {
              error: {
                message: result.error,
                code: result.code,
              },
            },
            { status: 409 }
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

    // 4. Zwrócenie sukcesu (201 Created)
    return NextResponse.json(result.data, { status: 201 })
  } catch (err) {
    // 5. Catch-all dla nieoczekiwanych błędów
    console.error('Nieoczekiwany błąd w POST /api/profile:', err)
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
