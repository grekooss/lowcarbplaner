/**
 * Hook do sprawdzania stanu autentykacji użytkownika
 *
 * Sprawdza czy użytkownik jest zalogowany i subskrybuje zmiany stanu auth.
 * Używany do warunkowego renderowania (modal rejestracji vs. navigation do przepisu).
 */

'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'

interface UseAuthCheckReturn {
  /**
   * Czy użytkownik jest zalogowany
   * - true: zalogowany
   * - false: niezalogowany
   * - null: ładowanie (initial check)
   */
  isAuthenticated: boolean | null

  /**
   * Czy trwa sprawdzanie stanu auth (initial load)
   */
  isLoading: boolean

  /**
   * ID zalogowanego użytkownika (jeśli jest zalogowany)
   */
  userId: string | null
}

/**
 * Custom hook do sprawdzania stanu autentykacji
 *
 * @returns Obiekt z informacją o stanie autentykacji
 *
 * @example
 * ```tsx
 * const { isAuthenticated, isLoading, userId } = useAuthCheck()
 *
 * if (isLoading) {
 *   return <Spinner />
 * }
 *
 * if (!isAuthenticated) {
 *   // Pokaż modal rejestracji
 *   return <AuthPromptModal />
 * }
 *
 * // Użytkownik zalogowany - pokaż content
 * return <ProtectedContent userId={userId} />
 * ```
 */
export function useAuthCheck(): UseAuthCheckReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClientComponentClient()

    // Initial check - sprawdź czy istnieje sesja
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setUserId(session?.user?.id || null)
    })

    // Subscribe do zmian stanu auth (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      setUserId(session?.user?.id || null)
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    isAuthenticated,
    isLoading: isAuthenticated === null,
    userId,
  }
}
