/**
 * TanStack Query hook dla szczegółów przepisu
 *
 * Standard query do pobierania pojedynczego przepisu.
 * Integracja z Server Action getRecipeById().
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { getRecipeById } from '@/lib/actions/recipes'
import type { RecipeDTO } from '@/types/dto.types'

interface UseRecipeQueryOptions {
  /**
   * ID przepisu do pobrania
   */
  recipeId: number

  /**
   * Czy query jest enabled (domyślnie true, ale auto-disabled jeśli recipeId <= 0)
   */
  enabled?: boolean
}

/**
 * Custom hook do pobierania szczegółów pojedynczego przepisu
 *
 * Automatycznie disabled gdy recipeId jest nieprawidłowe (<=0).
 * Cache'uje przepisy per ID dla szybszego nawigowania.
 *
 * @param options - Opcje query (recipeId, enabled)
 * @returns TanStack Query query result
 *
 * @example
 * ```tsx
 * const { data: recipe, isLoading, error } = useRecipeQuery({
 *   recipeId: 123
 * })
 *
 * if (isLoading) {
 *   return <RecipeSkeleton />
 * }
 *
 * if (error) {
 *   return <ErrorMessage error={error.message} />
 * }
 *
 * if (!recipe) {
 *   return <NotFound />
 * }
 *
 * return <RecipeDetail recipe={recipe} />
 * ```
 */
export function useRecipeQuery(options: UseRecipeQueryOptions) {
  const { recipeId, enabled = true } = options

  return useQuery<RecipeDTO, Error>({
    queryKey: ['recipe', recipeId],

    queryFn: async () => {
      const result = await getRecipeById(recipeId)

      if (result.error || !result.data) {
        throw new Error(result.error || 'Przepis nie został znaleziony')
      }

      return result.data
    },

    // Disabled jeśli recipeId jest invalid
    enabled: enabled && !!recipeId && recipeId > 0,

    // Przepisy są stosunkowo statyczne - cache dłużej
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes (1 hour)

    // Retry tylko 2 razy dla pojedynczego przepisu (404 nie powinno być retry'owane)
    retry: (failureCount, error) => {
      // Nie retry dla 404 (przepis nie znaleziony)
      if (error.message.includes('nie został znaleziony')) {
        return false
      }
      return failureCount < 2
    },
  })
}
