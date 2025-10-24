/**
 * Hook: useSwapRecipe
 *
 * Mutation do podmiany przepisu w zaplanowanym posiłku.
 * Automatycznie invaliduje query dla zaplanowanych posiłków.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePlannedMeal } from '@/lib/actions/planned-meals'
import type { PlannedMealDTO } from '@/types/dto.types'

interface SwapRecipeParams {
  mealId: number
  newRecipeId: number
}

/**
 * Hook do podmiany przepisu w zaplanowanym posiłku
 *
 * @returns Mutation do wywołania podmiany
 *
 * @example
 * ```tsx
 * const { mutate: swapRecipe, isPending } = useSwapRecipe()
 *
 * const handleSwap = (mealId: number, newRecipeId: number) => {
 *   swapRecipe({ mealId, newRecipeId })
 * }
 * ```
 */
export function useSwapRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      mealId,
      newRecipeId,
    }: SwapRecipeParams): Promise<PlannedMealDTO> => {
      const result = await updatePlannedMeal(mealId, {
        action: 'swap_recipe',
        recipe_id: newRecipeId,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      return result.data!
    },
    onSuccess: () => {
      // Invalidate planned meals queries aby odświeżyć dane
      void queryClient.invalidateQueries({ queryKey: ['planned-meals'] })
      void queryClient.invalidateQueries({ queryKey: ['week-meals-check'] })
    },
  })
}
