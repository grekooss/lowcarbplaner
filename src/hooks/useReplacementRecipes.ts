/**
 * Hook: useReplacementRecipes
 *
 * Pobiera listę sugerowanych zamienników dla danego posiłku.
 * Używa bezpośrednio Server Action z planned-meals.
 */

import { useQuery } from '@tanstack/react-query'
import { getReplacementRecipes } from '@/lib/actions/planned-meals'
import type { ReplacementRecipeDTO } from '@/types/dto.types'

/**
 * Hook do pobierania zamienników przepisu
 *
 * @param mealId - ID zaplanowanego posiłku
 * @param enabled - Czy query ma być aktywne
 * @returns Query z listą zamienników
 *
 * @example
 * ```tsx
 * const { data: replacements, isLoading } = useReplacementRecipes(123, true)
 * ```
 */
export function useReplacementRecipes(mealId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['replacement-recipes', mealId],
    queryFn: async (): Promise<ReplacementRecipeDTO[]> => {
      const result = await getReplacementRecipes(mealId)

      if (result.error) {
        throw new Error(result.error)
      }

      return result.data || []
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minut - zamienniki się nie zmieniają często
  })
}
