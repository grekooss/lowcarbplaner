/**
 * useAuth Hook
 *
 * Custom hook for authentication operations with Supabase Auth
 * Handles login, registration, OAuth, password reset, and redirects
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClientComponentClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/utils/auth-errors'
import { env } from '@/lib/env'
import type { UseAuthReturn } from '@/types/auth-view.types'
import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Helper to extract error message from unknown error
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  return 'Wystąpił nieznany błąd'
}

/**
 * Response type for check_email_exists RPC call
 * This RPC function is not in generated types
 */
interface CheckEmailExistsResponse {
  data: boolean | null
  error: PostgrestError | null
}

/**
 * Call check_email_exists RPC function
 * Typed wrapper for custom RPC not in generated types
 */
async function checkEmailExists(
  supabase: ReturnType<typeof createClientComponentClient>,
  email: string
): Promise<CheckEmailExistsResponse> {
  // Using type assertion for custom RPC function not in generated types
  // The RPC function exists in DB but isn't in auto-generated types
  const rpcFn = supabase.rpc as unknown as (
    fn: string,
    params: Record<string, string>
  ) => Promise<CheckEmailExistsResponse>

  return rpcFn('check_email_exists', { check_email: email })
}

/**
 * Hook do zarządzania autentykacją użytkownika
 *
 * @param redirectTo - Opcjonalna ścieżka do przekierowania po zalogowaniu (domyślnie: '/')
 * @returns Metody autentykacji i stan ładowania/błędów
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { login, isLoading, error } = useAuth('/dashboard')
 *
 *   const handleSubmit = async (email: string, password: string) => {
 *     await login(email, password)
 *   }
 * }
 * ```
 */
export function useAuth(redirectTo?: string): UseAuthReturn {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Logowanie z email i hasłem
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        // Tworzenie klienta wewnątrz callback zapewnia stabilną referencję
        const supabase = createClientComponentClient()

        // Logowanie przez Supabase Auth
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (authError) throw authError

        // Sprawdź czy profil użytkownika istnieje
        const { data: profile } = await supabase
          .from('profiles')
          .select('disclaimer_accepted_at')
          .eq('id', data.user.id)
          .single()

        // Przekieruj odpowiednio
        if (!profile?.disclaimer_accepted_at) {
          router.push('/onboarding')
        } else {
          router.push(redirectTo || '/')
        }

        toast.success('Zalogowano pomyślnie', {
          description: 'Witaj ponownie!',
        })
      } catch (err: unknown) {
        const errorMessage = translateAuthError(getErrorMessage(err))
        setError(errorMessage)
        toast.error('Błąd logowania', {
          description: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [router, redirectTo]
  )

  /**
   * Rejestracja z email i hasłem
   */
  const register = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClientComponentClient()

        // Use NEXT_PUBLIC_SITE_URL if set, otherwise use current origin
        const siteUrl = env.NEXT_PUBLIC_SITE_URL || window.location.origin

        // Rejestracja przez Supabase Auth
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${siteUrl}/auth/callback`,
          },
        })

        if (authError) throw authError

        // Supabase może automatycznie zalogować po rejestracji
        if (data.user && data.session) {
          // Przekieruj do przepisów
          router.push('/recipes')
          toast.success('Konto utworzone', {
            description: 'Witaj w LowCarbPlaner!',
          })
        } else {
          // Wymaga potwierdzenia email - zamknij modal i przekieruj do przepisów
          toast.success('Sprawdź swoją skrzynkę', {
            description: 'Wysłaliśmy link aktywacyjny na Twój email.',
          })
          router.push('/recipes')
        }
      } catch (err: unknown) {
        const errorMessage = translateAuthError(getErrorMessage(err))
        setError(errorMessage)
        toast.error('Błąd rejestracji', {
          description: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  /**
   * Logowanie przez Google OAuth
   */
  const loginWithGoogle = useCallback(async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const supabase = createClientComponentClient()

      // Use NEXT_PUBLIC_SITE_URL if set, otherwise use current origin
      const siteUrl = env.NEXT_PUBLIC_SITE_URL || window.location.origin
      // redirectTo must EXACTLY match a Redirect URL in Supabase Dashboard (no query params)
      const callbackUrl = `${siteUrl}/auth/callback`

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      })

      if (authError) throw authError
      // Redirect automatyczny przez Supabase
    } catch (err: unknown) {
      const errorMessage = translateAuthError(getErrorMessage(err))
      setError(errorMessage)
      toast.error('Błąd logowania', {
        description: errorMessage,
      })
      setIsGoogleLoading(false)
    }
  }, [])

  /**
   * Wysyłka email z linkiem do resetowania hasła
   * Sprawdza najpierw czy email istnieje w bazie
   * @returns true jeśli email został wysłany, false w przypadku błędu
   */
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClientComponentClient()

      // Sprawdź czy użytkownik z takim emailem istnieje (używamy RPC aby ominąć RLS)
      const { data: emailExists, error: checkError } = await checkEmailExists(
        supabase,
        email
      )

      if (checkError) throw checkError

      if (!emailExists) {
        throw new Error('Nie znaleziono konta z tym adresem email')
      }

      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      )

      if (authError) throw authError

      toast.success('Email wysłany', {
        description:
          'Sprawdź swoją skrzynkę i kliknij w link resetujący hasło.',
      })
      return true
    } catch (err: unknown) {
      const errorMessage = translateAuthError(getErrorMessage(err))
      setError(errorMessage)
      toast.error('Błąd', {
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Aktualizacja hasła (po kliknięciu link z email)
   */
  const updatePassword = useCallback(
    async (password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClientComponentClient()

        const { error: authError } = await supabase.auth.updateUser({
          password,
        })

        if (authError) throw authError

        toast.success('Hasło zmienione', {
          description: 'Możesz teraz zalogować się nowym hasłem.',
        })

        router.push('/auth?tab=login')
      } catch (err: unknown) {
        const errorMessage = translateAuthError(getErrorMessage(err))
        setError(errorMessage)
        toast.error('Błąd', {
          description: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  return {
    isLoading,
    isGoogleLoading,
    error,
    login,
    register,
    loginWithGoogle,
    resetPassword,
    updatePassword,
  }
}
