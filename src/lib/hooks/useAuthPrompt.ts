/**
 * Hook do zarządzania modalem prompt rejestracji/logowania
 *
 * Zarządza stanem modala AuthPromptModal i persistence redirectRecipeId
 * w localStorage. Używany gdy niezalogowany użytkownik próbuje zobaczyć przepis.
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import type { AuthPromptState } from '@/types/recipes-view.types'

const REDIRECT_RECIPE_KEY = 'auth_redirect_recipe_id'

interface UseAuthPromptReturn extends AuthPromptState {
  openPrompt: (recipeId: number) => void
  closePrompt: () => void
  getRedirectUrl: (mode?: 'login' | 'register') => string
  clearRedirect: () => void
}

/**
 * Custom hook do zarządzania modalem rejestracji z zapamiętywaniem kontekstu
 *
 * @returns Obiekt z stanem modala i metodami do zarządzania
 *
 * @example
 * ```tsx
 * const { isOpen, redirectRecipeId, openPrompt, closePrompt, getRedirectUrl } = useAuthPrompt()
 *
 * // Otwórz modal i zapisz recipe ID
 * openPrompt(123)
 *
 * // Pobierz URL do rejestracji z redirect
 * const signupUrl = getRedirectUrl('register')
 * // => '/auth?tab=register&redirect=/recipes/123'
 *
 * // Zamknij modal
 * closePrompt()
 *
 * // Po successful login - wyczyść redirect
 * clearRedirect()
 * ```
 */
export function useAuthPrompt(): UseAuthPromptReturn {
  const [state, setState] = useState<AuthPromptState>({
    isOpen: false,
    redirectRecipeId: null,
  })

  /**
   * Przy montowaniu sprawdź czy jest zapisany redirect w localStorage
   * (użytkownik mógł otworzyć modal, ale nie dokończyć rejestracji)
   */
  useEffect(() => {
    const savedRecipeId = localStorage.getItem(REDIRECT_RECIPE_KEY)
    if (savedRecipeId) {
      setState((prev) => ({
        ...prev,
        redirectRecipeId: Number(savedRecipeId),
      }))
    }
  }, [])

  /**
   * Otwiera modal i zapisuje recipe ID do localStorage dla persistence
   */
  const openPrompt = useCallback((recipeId: number) => {
    // Zapisz do localStorage dla persistence (user może zamknąć tab)
    localStorage.setItem(REDIRECT_RECIPE_KEY, String(recipeId))

    setState({
      isOpen: true,
      redirectRecipeId: recipeId,
    })
  }, [])

  /**
   * Zamyka modal (ale nie czyści redirectRecipeId - może być użyty ponownie)
   */
  const closePrompt = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }, [])

  /**
   * Generuje URL do logowania/rejestracji z redirect query param
   *
   * @param mode - Auth mode ('login' lub 'register')
   * @returns URL z redirect param jeśli jest recipeId, inaczej base URL
   */
  const getRedirectUrl = useCallback(
    (mode: 'login' | 'register' = 'login'): string => {
      // Sprawdź stan lub localStorage (fallback)
      const recipeId =
        state.redirectRecipeId ||
        (typeof window !== 'undefined'
          ? localStorage.getItem(REDIRECT_RECIPE_KEY)
          : null)

      const baseUrl = '/auth'
      const tabParam = mode === 'register' ? '?tab=register' : ''

      if (!recipeId) return `${baseUrl}${tabParam}`

      const separator = tabParam ? '&' : '?'
      return `${baseUrl}${tabParam}${separator}redirect=/recipes/${recipeId}`
    },
    [state.redirectRecipeId]
  )

  /**
   * Czyści zapisany redirect (wywołaj po successful login/signup)
   */
  const clearRedirect = useCallback(() => {
    localStorage.removeItem(REDIRECT_RECIPE_KEY)
    setState((prev) => ({
      ...prev,
      redirectRecipeId: null,
    }))
  }, [])

  return {
    isOpen: state.isOpen,
    redirectRecipeId: state.redirectRecipeId,
    openPrompt,
    closePrompt,
    getRedirectUrl,
    clearRedirect,
  }
}
