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
import type { UseAuthReturn } from '@/types/auth-view.types'

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
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  /**
   * Logowanie z email i hasłem
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
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
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        toast.error('Błąd logowania', {
          description: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, router, redirectTo]
  )

  /**
   * Rejestracja z email i hasłem
   */
  const register = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        // Rejestracja przez Supabase Auth
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (authError) throw authError

        // Supabase może automatycznie zalogować po rejestracji
        if (data.user && data.session) {
          // Przekieruj do onboardingu
          router.push('/onboarding')
          toast.success('Konto utworzone', {
            description: 'Witaj w LowCarbPlaner!',
          })
        } else {
          // Wymaga potwierdzenia email
          toast.success('Sprawdź swoją skrzynkę', {
            description: 'Wysłaliśmy link aktywacyjny na Twój email.',
          })
        }
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        toast.error('Błąd rejestracji', {
          description: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, router]
  )

  /**
   * Logowanie przez Google OAuth
   */
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo || '/'}`,
        },
      })

      if (authError) throw authError
      // Redirect automatyczny przez Supabase
    } catch (err: any) {
      const errorMessage = translateAuthError(err.message)
      setError(errorMessage)
      toast.error('Błąd logowania', {
        description: errorMessage,
      })
      setIsLoading(false)
    }
  }, [supabase, redirectTo])

  /**
   * Wysyłka email z linkiem do resetowania hasła
   */
  const resetPassword = useCallback(
    async (email: string) => {
      setIsLoading(true)
      setError(null)

      try {
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
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        toast.error('Błąd', {
          description: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase]
  )

  /**
   * Aktualizacja hasła (po kliknięciu link z email)
   */
  const updatePassword = useCallback(
    async (password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { error: authError } = await supabase.auth.updateUser({
          password,
        })

        if (authError) throw authError

        toast.success('Hasło zmienione', {
          description: 'Możesz teraz zalogować się nowym hasłem.',
        })

        router.push('/auth?tab=login')
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        toast.error('Błąd', {
          description: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, router]
  )

  return {
    isLoading,
    error,
    login,
    register,
    loginWithGoogle,
    resetPassword,
    updatePassword,
  }
}
