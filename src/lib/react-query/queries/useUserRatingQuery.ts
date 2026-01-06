/**
 * TanStack Query hook dla oceny użytkownika
 *
 * Pobiera ocenę użytkownika dla danego przepisu.
 * Integracja z Server Action getUserRating().
 */

'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
  getUserRating,
  rateRecipe,
  deleteRating,
} from '@/lib/actions/recipe-ratings'

interface UseUserRatingQueryOptions {
  /**
   * ID przepisu
   */
  recipeId: number

  /**
   * Czy query jest enabled (domyślnie true)
   */
  enabled?: boolean
}

/**
 * Custom hook do pobierania oceny użytkownika dla przepisu
 *
 * @param options - Opcje query (recipeId, enabled)
 * @returns TanStack Query query result z userRating (number | null)
 *
 * @example
 * ```tsx
 * const { data: userRating, isLoading } = useUserRatingQuery({
 *   recipeId: 123
 * })
 *
 * // userRating będzie number (1-5) lub null jeśli nie oceniał
 * ```
 */
export function useUserRatingQuery(options: UseUserRatingQueryOptions) {
  const { recipeId, enabled = true } = options

  return useQuery<number | null, Error>({
    queryKey: ['userRating', recipeId],

    queryFn: async () => {
      const result = await getUserRating(recipeId)

      if (result.error) {
        throw new Error(result.error)
      }

      // Zwróć rating lub null jeśli nie oceniał
      return result.data?.rating ?? null
    },

    // Disabled jeśli recipeId jest invalid
    enabled: enabled && !!recipeId && recipeId > 0,

    // Oceny mogą się zmieniać - krótszy staleTime
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Mutation hook do zapisywania oceny przepisu
 *
 * Automatycznie invaliduje cache oceny po zapisaniu.
 *
 * @example
 * ```tsx
 * const { mutate: rate, isPending } = useRateRecipeMutation()
 *
 * rate({ recipeId: 123, rating: 5 }, {
 *   onSuccess: () => console.log('Ocena zapisana!'),
 *   onError: (error) => console.error(error.message)
 * })
 * ```
 */
export function useRateRecipeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recipeId,
      rating,
    }: {
      recipeId: number
      rating: number
    }) => {
      const result = await rateRecipe(recipeId, rating)

      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    },

    onSuccess: (_data, variables) => {
      // Ustaw nową wartość w cache natychmiast (optimistic-like)
      queryClient.setQueryData(
        ['userRating', variables.recipeId],
        variables.rating
      )

      // Invaliduj query przepisu (może mieć zaktualizowaną średnią ocenę)
      queryClient.invalidateQueries({
        queryKey: ['recipe', variables.recipeId],
      })

      // Invaliduj listę przepisów (może mieć zaktualizowaną średnią ocenę)
      queryClient.invalidateQueries({
        queryKey: ['recipes'],
      })
    },
  })
}

/**
 * Mutation hook do usuwania oceny przepisu
 *
 * @example
 * ```tsx
 * const { mutate: remove, isPending } = useDeleteRatingMutation()
 *
 * remove(123, {
 *   onSuccess: () => console.log('Ocena usunięta!')
 * })
 * ```
 */
export function useDeleteRatingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (recipeId: number) => {
      const result = await deleteRating(recipeId)

      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    },

    onSuccess: (_, recipeId) => {
      // Wyczyść ocenę w cache
      queryClient.setQueryData(['userRating', recipeId], null)

      // Invaliduj query przepisu
      queryClient.invalidateQueries({
        queryKey: ['recipe', recipeId],
      })

      // Invaliduj listę przepisów
      queryClient.invalidateQueries({
        queryKey: ['recipes'],
      })
    },
  })
}
