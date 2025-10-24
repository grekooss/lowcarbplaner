/**
 * Hook: useAutoGenerateMealPlan
 *
 * Automatycznie generuje plan posiłków gdy użytkownik wybierze dzień bez danych.
 * Używa bezpośrednio Server Action zamiast API endpoint.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { generateMealPlan } from '@/lib/actions/profile'
import type { GeneratePlanResponseDTO } from '@/types/dto.types'

/**
 * Hook do automatycznego generowania planu posiłków
 *
 * @returns Mutation do wywołania generacji planu
 *
 * @example
 * ```tsx
 * const { mutate: generatePlan, isPending } = useAutoGenerateMealPlan()
 *
 * // Wywołaj gdy brak danych
 * if (meals.length === 0) {
 *   generatePlan()
 * }
 * ```
 */
export function useAutoGenerateMealPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<GeneratePlanResponseDTO> => {
      // Wywołaj bezpośrednio Server Action
      const result = await generateMealPlan()

      if (result.error) {
        throw new Error(result.error)
      }

      return result.data!
    },
    onSuccess: () => {
      // Invalidate planned meals queries aby pobrać nowo wygenerowane dane
      void queryClient.invalidateQueries({ queryKey: ['planned-meals'] })
    },
    retry: 1, // Retry raz w przypadku błędu
  })
}
