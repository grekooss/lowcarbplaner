/**
 * Hook that guards automatic meal plan generation.
 * Ensures generation happens only once and only when needed.
 * Extracted from DashboardClient for testability.
 */

import { useEffect, useRef } from 'react'
import { useAutoGenerateMealPlan } from '@/hooks/useAutoGenerateMealPlan'
import { useWeekMealsCheck } from '@/hooks/useWeekMealsCheck'

interface UseAutoGenerationGuardOptions {
  /** Whether initial data was provided from server */
  hasInitialData: boolean
  /** Whether data is currently loading */
  isLoading: boolean
  /** Current selected date string for resetting errors on date change */
  selectedDateStr: string
}

interface UseAutoGenerationGuardReturn {
  /** Whether plan is currently being generated */
  isGenerating: boolean
  /** Error from generation attempt, if any */
  generateError: Error | null
  /** Retry generation */
  retryGenerate: () => void
  /** Whether week check is still loading */
  isCheckingWeek: boolean
}

/**
 * Guards automatic meal plan generation to prevent duplicate attempts.
 * Auto-generates plan only when:
 * - No initial data from server
 * - Week plan is incomplete
 * - No generation in progress
 * - Haven't already attempted generation
 *
 * @param options - Configuration options
 * @returns Generation state and controls
 */
export function useAutoGenerationGuard({
  hasInitialData,
  isLoading,
  selectedDateStr,
}: UseAutoGenerationGuardOptions): UseAutoGenerationGuardReturn {
  const { data: weekCheck, isLoading: isCheckingWeek } = useWeekMealsCheck()

  const {
    mutate: generatePlan,
    isPending: isGenerating,
    error: generateError,
    reset: resetGenerateError,
  } = useAutoGenerateMealPlan()

  // Track whether we've already attempted generation
  const hasAttemptedGeneration = useRef(false)

  // Reset error when date changes
  // (error from one day shouldn't block viewing other days)
  useEffect(() => {
    if (generateError) {
      resetGenerateError()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateStr])

  // Auto-generate plan only once when data is incomplete
  useEffect(() => {
    // Don't generate if we have server data
    if (hasInitialData) {
      hasAttemptedGeneration.current = true
      return
    }

    // Check if we have incomplete plan (21 meals = 7 days × 3 meals)
    const hasIncompletePlan = weekCheck?.hasIncompletePlan ?? false
    const shouldGenerate =
      !isLoading &&
      !isCheckingWeek &&
      !isGenerating &&
      hasIncompletePlan &&
      !hasAttemptedGeneration.current

    if (shouldGenerate) {
      hasAttemptedGeneration.current = true
      generatePlan()
    }
  }, [
    hasInitialData,
    isLoading,
    isCheckingWeek,
    isGenerating,
    weekCheck?.hasIncompletePlan,
    weekCheck?.mealsCount,
    weekCheck?.expectedMealsCount,
    generatePlan,
  ])

  return {
    isGenerating,
    generateError: generateError as Error | null,
    retryGenerate: generatePlan,
    isCheckingWeek,
  }
}
