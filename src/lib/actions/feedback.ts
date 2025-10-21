/**
 * Server Actions for Feedback API
 *
 * Implementuje logikę biznesową dla operacji na feedbacku użytkowników:
 * - POST /api/feedback (tworzenie nowego feedbacku)
 *
 * @see .ai/10e01-api-feedback-implementation-plan.md
 */

'use server'

import { createServerClient } from '@/lib/supabase/server'
import type {
  CreateFeedbackCommand,
  FeedbackResponseDTO,
} from '@/types/dto.types'
import {
  createFeedbackSchema,
  type CreateFeedbackInput,
} from '@/lib/validation/feedback'
import type { TablesInsert } from '@/types/database.types'

/**
 * Standardowy typ wyniku Server Action (Discriminated Union)
 */
type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string; code?: string; details?: unknown }

/**
 * POST /api/feedback - Tworzy nowy feedback użytkownika
 *
 * Proces:
 * 1. Weryfikacja autentykacji
 * 2. Walidacja danych wejściowych (Zod)
 * 3. Zapis feedbacku do bazy danych
 * 4. Zwrot utworzonego feedbacku
 *
 * @param input - Dane z formularza feedbacku (content, metadata)
 * @returns Utworzony feedback lub błąd
 *
 * @example
 * ```typescript
 * const result = await createFeedback({
 *   content: "Świetna aplikacja!",
 *   metadata: { appVersion: "1.0.1", os: "iOS 17" }
 * })
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.id) // 42
 * }
 * ```
 */
export async function createFeedback(
  input: CreateFeedbackInput
): Promise<ActionResult<FeedbackResponseDTO>> {
  try {
    // 1. Weryfikacja autentykacji
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        error: 'Uwierzytelnienie wymagane',
        code: 'UNAUTHORIZED',
      }
    }

    // 2. Walidacja danych wejściowych
    const validated = createFeedbackSchema.safeParse(input)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe dane wejściowe: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
        code: 'VALIDATION_ERROR',
        details: validated.error.format(),
      }
    }

    const command: CreateFeedbackCommand = {
      content: validated.data.content,
      metadata: validated.data.metadata ?? undefined,
    }

    // 3. Przygotowanie danych do zapisu
    const feedbackData: TablesInsert<'feedback'> = {
      user_id: user.id,
      content: command.content,
      metadata: command.metadata
        ? JSON.parse(JSON.stringify(command.metadata))
        : null,
      created_at: new Date().toISOString(),
    }

    // 4. Zapis feedbacku do bazy danych
    const startTime = performance.now()
    const { data: createdFeedback, error: insertError } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single()
    const endTime = performance.now()

    if (insertError) {
      console.error('Błąd podczas tworzenia feedbacku:', insertError)
      return {
        error: `Błąd bazy danych: ${insertError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 5. Logowanie performance metrics
    console.log(
      `Feedback created in ${Math.round(endTime - startTime)}ms for user ${user.id}`
    )

    // 6. Transformacja do DTO
    const response: FeedbackResponseDTO = {
      id: createdFeedback.id,
      user_id: createdFeedback.user_id,
      content: createdFeedback.content,
      metadata: createdFeedback.metadata as Record<string, unknown> | null,
      created_at: createdFeedback.created_at,
    }

    return { data: response }
  } catch (err) {
    console.error('Nieoczekiwany błąd w createFeedback:', err)
    return {
      error: 'Wewnętrzny błąd serwera',
      code: 'INTERNAL_ERROR',
    }
  }
}
