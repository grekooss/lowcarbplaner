/**
 * Hook do pobierania informacji o zalogowanym użytkowniku
 *
 * Używa Supabase do sprawdzenia czy użytkownik jest zalogowany
 */

'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UseUserReturn {
  user: User | null
  isLoading: boolean
}

/**
 * Hook do pobierania aktualnie zalogowanego użytkownika
 *
 * @returns Obiekt z danymi użytkownika i statusem ładowania
 *
 * @example
 * ```tsx
 * const { user, isLoading } = useUser()
 *
 * if (isLoading) return <Spinner />
 * if (!user) return <LoginPrompt />
 *
 * return <Dashboard user={user} />
 * ```
 */
export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClientComponentClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
    })

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, isLoading }
}
