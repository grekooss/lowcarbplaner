/**
 * Hook: useWeekMealsCheck
 *
 * Sprawdza czy obecny tydzień ma kompletny plan (21 posiłków: 7 dni × 3 posiłki)
 * Używa bezpośrednio Server Action zamiast API endpoint.
 */

import { useQuery } from '@tanstack/react-query'
import { getPlannedMeals } from '@/lib/actions/planned-meals'

/**
 * Hook do sprawdzania kompletności tygodniowego planu posiłków
 *
 * @returns Query z informacją o kompletności tygodnia
 *
 * @example
 * ```tsx
 * const { data: weekCheck } = useWeekMealsCheck()
 *
 * if (weekCheck?.hasIncompletePlan) {
 *   // Wygeneruj brakujące posiłki
 * }
 * ```
 */
export function useWeekMealsCheck() {
  // Format daty lokalnie (bez konwersji do UTC)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Dzisiejsza data (początek dnia)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = formatLocalDate(today)

  // Data końcowa (dzisiaj + 6 dni = 7 dni razem)
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 6)
  const endDateStr = formatLocalDate(endDate)

  return useQuery({
    queryKey: ['week-meals-check', startDate, endDateStr],
    queryFn: async () => {
      // Wywołaj bezpośrednio Server Action
      const result = await getPlannedMeals({
        start_date: startDate,
        end_date: endDateStr,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      const meals = result.data || []
      const mealsCount = meals.length
      const expectedMealsCount = 7 * 3 // 7 dni × 3 posiłki
      const hasIncompletePlan = mealsCount < expectedMealsCount

      console.log('🔍 Week meals check:', {
        startDate,
        endDateStr,
        mealsCount,
        expectedMealsCount,
        hasIncompletePlan,
      })

      return {
        mealsCount,
        expectedMealsCount,
        hasIncompletePlan,
        startDate,
        endDateStr,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minut
  })
}
