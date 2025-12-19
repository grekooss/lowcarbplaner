/**
 * Supabase Browser Client
 *
 * Helper do tworzenia Supabase client po stronie klienta (Client Components, hooks).
 * Automatycznie zarządza sesją użytkownika w przeglądarce.
 *
 * WAŻNE:
 * - Używaj TYLKO w Client Components (z 'use client')
 * - NIE używaj w Server Components (użyj server.ts)
 * - RLS automatycznie filtruje dane na podstawie sesji użytkownika
 *
 * @see .claude/docs/05-security.md
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'
import { env } from '@/lib/env'

/**
 * Singleton instance Supabase client dla przeglądarki
 */
let client: ReturnType<typeof createBrowserClient<Database>> | undefined

/**
 * Tworzy lub zwraca singleton Supabase client dla Client Components
 *
 * @returns Supabase client z automatyczną obsługą sesji w przeglądarce
 *
 * @example
 * ```typescript
 * 'use client'
 *
 * import { createBrowserClient } from '@/lib/supabase/client'
 *
 * export function MealPlanList() {
 *   const supabase = createBrowserClient()
 *
 *   useEffect(() => {
 *     async function fetchMeals() {
 *       const { data } = await supabase
 *         .from('planned_meals')
 *         .select('*')
 *         .eq('meal_date', today)
 *     }
 *     fetchMeals()
 *   }, [])
 * }
 * ```
 */
export function createClientComponentClient() {
  if (client) {
    return client
  }

  client = createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return client
}
