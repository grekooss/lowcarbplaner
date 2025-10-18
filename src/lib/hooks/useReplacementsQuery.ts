/**
 * Custom hook do pobierania listy zamienników dla posiłku
 */

import { useQuery } from '@tanstack/react-query'
import { getReplacementRecipes } from '@/lib/actions/planned-meals'

/**
 * Hook do pobierania zamienników przepisu dla zaplanowanego posiłku
 * @param mealId - ID zaplanowanego posiłku (null = query disabled)
 * @returns Query result z listą ReplacementRecipeDTO
 */
export const useReplacementsQuery = (mealId: number | null) => {
  return useQuery({
    queryKey: ['replacements', mealId],
    queryFn: async () => {
      if (!mealId) throw new Error('No meal ID provided')
      const result = await getReplacementRecipes(mealId)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!mealId && mealId > 0,
    staleTime: 5 * 60 * 1000, // 5 minut - zamienniki rzadko się zmieniają
    retry: 2,
  })
}
