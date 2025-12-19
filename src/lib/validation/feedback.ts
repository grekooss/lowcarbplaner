/**
 * Validation schemas for Feedback API
 *
 * Zawiera schematy Zod dla operacji na feedbacku użytkowników.
 * Includes HTML sanitization to prevent XSS attacks.
 *
 * @see .ai/10e01-api-feedback-implementation-plan.md
 */

import { z } from 'zod'
import { sanitizeMultilineText } from '@/lib/utils/sanitize'

/**
 * Schema walidacji dla tworzenia feedbacku (POST /api/feedback)
 *
 * Waliduje:
 * - content: wymagany string (1-5000 znaków), sanityzowany
 * - metadata: opcjonalny obiekt JSON (max 10KB)
 */
export const createFeedbackSchema = z.object({
  content: z
    .string()
    .min(1, 'Treść nie może być pusta')
    .max(5000, 'Treść może mieć maksymalnie 5000 znaków')
    .trim()
    .transform((val) => sanitizeMultilineText(val)),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .nullable()
    .refine(
      (val) => {
        // Sprawdź czy metadata nie jest za duże (max 10KB JSON)
        if (val) {
          const jsonSize = JSON.stringify(val).length
          return jsonSize <= 10000
        }
        return true
      },
      { message: 'Metadata jest za duże (max 10KB)' }
    ),
})

/**
 * TypeScript type inferred from schema
 */
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
