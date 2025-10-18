/**
 * Custom hook do wymiany posiłku na inny przepis
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePlannedMeal } from '@/lib/actions/planned-meals'

/**
 * Hook do wymiany zaplanowanego posiłku na nowy przepis
 * Invaliduje cache planned-meals po udanej wymianie
 * @returns Mutation object z mutate funkcją
 */
export const useMealSwap = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      mealId,
      newRecipeId,
    }: {
      mealId: number
      newRecipeId: number
    }) => {
      const result = await updatePlannedMeal(mealId, {
        action: 'swap_recipe',
        recipe_id: newRecipeId,
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },

    onSuccess: () => {
      // Invalidate queries - odśwież plan posiłków
      queryClient.invalidateQueries({ queryKey: ['planned-meals'] })
    },

    onError: (error) => {
      console.error('Błąd wymiany posiłku:', error)
    },
  })
}
