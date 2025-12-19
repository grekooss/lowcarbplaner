/**
 * Supabase Server Client
 *
 * Helper do tworzenia Supabase client po stronie serwera (Server Components, Server Actions, Route Handlers).
 * Automatycznie zarządza sesją użytkownika z cookies.
 *
 * WAŻNE:
 * - Używaj TYLKO w Server Components, Server Actions, Route Handlers
 * - NIE używaj w Client Components (użyj client.ts)
 * - RLS automatycznie filtruje dane na podstawie auth.uid()
 *
 * @see .claude/docs/05-security.md
 */

import { createServerClient as createClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'
import { env } from '@/lib/env'

/**
 * Tworzy Supabase client dla Server Components i Server Actions
 *
 * @returns Supabase client z automatyczną obsługą sesji z cookies
 *
 * @example
 * ```typescript
 * // W Server Component
 * export default async function DashboardPage() {
 *   const supabase = await createServerClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   // ...
 * }
 *
 * // W Server Action
 * 'use server'
 * export async function updateProfile(formData: FormData) {
 *   const supabase = await createServerClient()
 *   const { data, error } = await supabase
 *     .from('profiles')
 *     .update({ ... })
 *     .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
 * }
 * ```
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignoruj błędy z middleware (cookies są read-only w middleware)
            // https://github.com/vercel/next.js/issues/45371
          }
        },
      },
    }
  )
}

/**
 * Tworzy Supabase Admin client z Service Role Key
 *
 * UWAGA: Używaj TYLKO gdy musisz ominąć RLS!
 * Service Role Key pomija wszystkie polityki RLS.
 *
 * Typowe użycie:
 * - Operacje administracyjne
 * - Background jobs (cron)
 * - Czytanie danych z content schema (publiczne przepisy)
 *
 * @returns Supabase client z pełnymi uprawnieniami (pomija RLS)
 *
 * @example
 * ```typescript
 * // Czytanie publicznych przepisów (content schema)
 * const supabase = createAdminClient()
 * const { data } = await supabase
 *   .from('recipes')
 *   .select('*')
 * ```
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
