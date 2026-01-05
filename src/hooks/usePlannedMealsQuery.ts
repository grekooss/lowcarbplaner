/**
 * Hook: usePlannedMealsQuery
 *
 * TanStack Query hook dla pobierania zaplanowanych posiłków.
 * Automatyczne cache'owanie, refetching i error handling.
 */

import { useQuery } from '@tanstack/react-query'
import { getPlannedMeals } from '@/lib/actions/planned-meals'
import type { PlannedMealDTO } from '@/types/dto.types'

/**
 * Pobiera zaplanowane posiłki w zakresie dat
 *
 * @param startDate - Data początkowa (YYYY-MM-DD)
 * @param endDate - Data końcowa (YYYY-MM-DD)
 * @returns TanStack Query result z danymi posiłków
 *
 * @example
 * ```tsx
 * const { data: meals, isLoading, error } = usePlannedMealsQuery(
 *   '2025-10-15',
 *   '2025-10-15'
 * )
 *
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage />
 * return <MealsList meals={meals} />
 * ```
 */
export function usePlannedMealsQuery(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['planned-meals', startDate, endDate],
    queryFn: async (): Promise<PlannedMealDTO[]> => {
      const result = await getPlannedMeals({
        start_date: startDate,
        end_date: endDate,
      })

      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to fetch meals')
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minut - dane posiłków są relatywnie statyczne
    refetchOnWindowFocus: false, // Wyłączone - zbędne przy dłuższym staleTime
    retry: 2, // Retry 2 razy przy błędzie
    placeholderData: (previousData) => previousData, // Zachowaj poprzednie dane podczas ładowania
  })
}
