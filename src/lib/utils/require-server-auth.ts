/**
 * Utility: requireServerAuth
 *
 * Współdzielone narzędzie do weryfikacji autentykacji w Server Actions.
 * Eliminuje duplikację kodu autentykacji (~40 linii zaoszczędzonych).
 */

import { createServerClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * Wynik sprawdzenia autentykacji
 */
type AuthResult =
  | {
      user: User
      supabase: Awaited<ReturnType<typeof createServerClient>>
      error?: never
    }
  | { user?: never; supabase?: never; error: { message: string; code: string } }

/**
 * Sprawdza czy użytkownik jest zalogowany i zwraca dane sesji.
 *
 * @returns Użytkownik i klient Supabase lub błąd autoryzacji
 *
 * @example
 * ```typescript
 * export async function myServerAction() {
 *   const auth = await requireServerAuth()
 *   if (auth.error) {
 *     return { error: auth.error.message, code: auth.error.code }
 *   }
 *
 *   const { user, supabase } = auth
 *   // Kontynuuj z zalogowanym użytkownikiem...
 * }
 * ```
 */
export async function requireServerAuth(): Promise<AuthResult> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: {
        message: 'Użytkownik nie jest zalogowany',
        code: 'UNAUTHORIZED',
      },
    }
  }

  return { user, supabase }
}

/**
 * Sprawdza czy użytkownik jest zalogowany.
 * Rzuca błąd jeśli nie - do użycia gdy autoryzacja jest wymagana.
 *
 * @throws Error jeśli użytkownik nie jest zalogowany
 * @returns Użytkownik i klient Supabase
 *
 * @example
 * ```typescript
 * export async function myProtectedAction() {
 *   try {
 *     const { user, supabase } = await requireServerAuthOrThrow()
 *     // Użytkownik na pewno zalogowany...
 *   } catch (err) {
 *     return { error: 'Wymagane logowanie', code: 'UNAUTHORIZED' }
 *   }
 * }
 * ```
 */
export async function requireServerAuthOrThrow(): Promise<{
  user: User
  supabase: Awaited<ReturnType<typeof createServerClient>>
}> {
  const result = await requireServerAuth()

  if (result.error) {
    throw new Error(result.error.message)
  }

  return result
}
