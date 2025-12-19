/**
 * Authentication Utility
 *
 * Shared helper for verifying user authentication in Server Actions.
 * Reduces code duplication across all action files.
 *
 * @module lib/utils/require-auth
 */

import { createServerClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * Error codes for authentication failures
 */
export type AuthErrorCode = 'UNAUTHORIZED' | 'AUTH_ERROR'

/**
 * Result type for authentication check
 */
export type AuthResult =
  | {
      user: User
      supabase: Awaited<ReturnType<typeof createServerClient>>
      error?: never
      code?: never
    }
  | {
      user?: never
      supabase?: never
      error: string
      code: AuthErrorCode
    }

/**
 * Verifies user authentication and returns user + supabase client
 *
 * Use this helper at the start of Server Actions that require authentication.
 * Eliminates repetitive auth checking code across action files.
 *
 * @returns AuthResult - Either { user, supabase } or { error, code }
 *
 * @example
 * ```typescript
 * export async function myServerAction(input: Input) {
 *   const auth = await requireAuth()
 *   if (auth.error) {
 *     return { error: auth.error, code: auth.code }
 *   }
 *
 *   const { user, supabase } = auth
 *   // Now safely use user.id and supabase client
 * }
 * ```
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return {
        error: 'Błąd uwierzytelniania',
        code: 'AUTH_ERROR',
      }
    }

    if (!user) {
      return {
        error: 'Uwierzytelnienie wymagane',
        code: 'UNAUTHORIZED',
      }
    }

    return { user, supabase }
  } catch {
    return {
      error: 'Błąd uwierzytelniania',
      code: 'AUTH_ERROR',
    }
  }
}

/**
 * Type guard to check if auth result is successful
 *
 * @param result - AuthResult to check
 * @returns true if authentication succeeded
 *
 * @example
 * ```typescript
 * const auth = await requireAuth()
 * if (!isAuthenticated(auth)) {
 *   return { error: auth.error, code: auth.code }
 * }
 * // TypeScript now knows auth has user and supabase
 * ```
 */
export function isAuthenticated(
  result: AuthResult
): result is Extract<AuthResult, { user: User }> {
  return 'user' in result && result.user !== undefined
}
