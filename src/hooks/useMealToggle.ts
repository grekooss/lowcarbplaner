/**
 * Hook: useMealToggle
 *
 * TanStack Query mutation hook dla oznaczania posiłku jako zjedzony/niezjedzony.
 * Implementuje optymistyczne aktualizacje z automatycznym rollbackiem przy błędzie.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePlannedMeal } from '@/lib/actions/planned-meals'
import { logErrorLevel } from '@/lib/error-logger'
import { toast } from 'sonner'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MealToggleParams {
  mealId: number
  isEaten: boolean
}

/**
 * Mutation hook do zmiany stanu is_eaten posiłku
 *
 * @returns TanStack Query mutation z optymistyczną aktualizacją
 *
 * @example
 * ```tsx
 * const { mutate: toggleMeal, isPending } = useMealToggle()
 *
 * <Checkbox
 *   checked={meal.is_eaten}
 *   disabled={isPending}
 *   onCheckedChange={(checked) => {
 *     toggleMeal({ mealId: meal.id, isEaten: Boolean(checked) })
 *   }}
 * />
 * ```
 */
export function useMealToggle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ mealId, isEaten }: MealToggleParams) => {
      const result = await updatePlannedMeal(mealId, {
        action: 'mark_eaten',
        is_eaten: isEaten,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    },

    // Optimistic update: natychmiastowa aktualizacja UI przed odpowiedzią z serwera
    onMutate: async ({ mealId, isEaten }) => {
      // 1. Anuluj wszystkie outgoing refetches (aby nie nadpisały optimistic update)
      await queryClient.cancelQueries({ queryKey: ['planned-meals'] })

      // 2. Snapshot poprzedniego stanu (dla rollbacku)
      const previousMeals = queryClient.getQueryData<PlannedMealDTO[]>([
        'planned-meals',
      ])

      // 3. Optimistically update cache
      queryClient.setQueriesData<PlannedMealDTO[]>(
        { queryKey: ['planned-meals'] },
        (old) => {
          if (!old) return old

          return old.map((meal) =>
            meal.id === mealId ? { ...meal, is_eaten: isEaten } : meal
          )
        }
      )

      // 4. Zwróć context dla rollbacku
      return { previousMeals }
    },

    // Rollback przy błędzie
    onError: (error, _variables, context) => {
      // Przywróć poprzedni stan
      if (context?.previousMeals) {
        queryClient.setQueryData(['planned-meals'], context.previousMeals)
      }

      // Pokaż toast z błędem
      toast.error('Błąd', {
        description:
          error instanceof Error
            ? error.message
            : 'Nie udało się zaktualizować posiłku. Spróbuj ponownie.',
      })

      logErrorLevel(error, { source: 'useMealToggle.onError' })
    },

    // Sukces - invalidate queries aby zsynchronizować z serwerem
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['planned-meals'] })
    },
  })
}
