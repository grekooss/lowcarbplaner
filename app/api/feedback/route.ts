/**
 * POST /api/feedback - Route Handler
 *
 * Endpoint dla tworzenia feedbacku użytkowników (opinie, zgłoszenia problemów).
 * Feedback jest powiązany z kontem użytkownika i zawiera opcjonalne metadane
 * kontekstowe (wersja aplikacji, system operacyjny, itp.).
 *
 * Request body:
 * {
 *   content: string (1-5000 znaków, wymagany),
 *   metadata?: { appVersion?: string, os?: string, ... }
 * }
 *
 * Response format (201 Created):
 * {
 *   id: number,
 *   user_id: string,
 *   content: string,
 *   metadata: object | null,
 *   created_at: string
 * }
 *
 * @see .ai/10e01-api-feedback-implementation-plan.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFeedback } from '@/lib/actions/feedback'
import type { CreateFeedbackInput } from '@/lib/validation/feedback'

/**
 * POST /api/feedback
 *
 * Tworzy nowy feedback użytkownika.
 *
 * @example
 * POST /api/feedback
 * Body: { "content": "Świetna aplikacja!", "metadata": { "appVersion": "1.0.1" } }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parsowanie JSON body
    const body: CreateFeedbackInput = await request.json()

    // 2. Wywołanie Server Action (walidacja + autoryzacja + logika biznesowa)
    const result = await createFeedback(body)

    // 3. Obsługa błędów z Server Action
    if (result.error) {
      // Określenie kodu HTTP na podstawie kodu błędu
      let statusCode = 500

      switch (result.code) {
        case 'UNAUTHORIZED':
          statusCode = 401
          break
        case 'VALIDATION_ERROR':
          statusCode = 400
          break
        case 'DATABASE_ERROR':
          statusCode = 500
          break
        case 'INTERNAL_ERROR':
          statusCode = 500
          break
        default:
          statusCode = 500
      }

      return NextResponse.json(
        {
          error: {
            message: result.error,
            code: result.code,
            details: result.details,
          },
        },
        { status: statusCode }
      )
    }

    // 4. Zwrot sukcesu (201 Created)
    return NextResponse.json(result.data, { status: 201 })
  } catch (err) {
    // 5. Catch-all dla nieoczekiwanych błędów (np. błąd parsowania JSON)
    console.error('Nieoczekiwany błąd w POST /api/feedback:', err)
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
