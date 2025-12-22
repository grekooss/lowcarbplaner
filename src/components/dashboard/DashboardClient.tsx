/**
 * DashboardClient (client component)
 *
 * Manages selected date, data fetching and coordinates dashboard sub-components.
 */

'use client'

import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import { CalendarStrip } from './CalendarStrip'
import { MacroProgressSection } from './MacroProgressSection'
import { MealsList } from './MealsList'
import { useDashboardStore } from '@/lib/zustand/stores/useDashboardStore'
import { useCheckedIngredientsStore } from '@/lib/zustand/stores/useCheckedIngredientsStore'
import { usePlannedMealsQuery } from '@/hooks/usePlannedMealsQuery'
import { useAutoGenerateMealPlan } from '@/hooks/useAutoGenerateMealPlan'
import { useWeekMealsCheck } from '@/hooks/useWeekMealsCheck'
import { useIsMobile } from '@/hooks/useIsMobile'
import { formatLocalDate } from '@/lib/utils/date-formatting'
import type { PlannedMealDTO } from '@/types/dto.types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecipeModal as RecipePreviewModal } from '@/components/meal-plan/RecipeModal'

interface DashboardClientProps {
  initialMeals: PlannedMealDTO[]
  targetMacros: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
  initialDate: string // YYYY-MM-DD
}

export function DashboardClient({
  initialMeals,
  targetMacros,
  initialDate,
}: DashboardClientProps) {
  const { selectedDate, setSelectedDate } = useDashboardStore()
  const isMobile = useIsMobile()
  const [recipeModal, setRecipeModal] = React.useState<{
    isOpen: boolean
    meal: PlannedMealDTO | null
  }>({
    isOpen: false,
    meal: null,
  })

  // Global checked ingredients state from Zustand store
  // Shared between Dashboard and Meal Plan
  const checkedIngredientsMap = useCheckedIngredientsStore(
    (state) => state.checkedIngredientsMap
  )
  const toggleIngredientChecked = useCheckedIngredientsStore(
    (state) => state.toggleIngredientChecked
  )

  // Get checked ingredients for current meal
  const currentMealCheckedIngredients = useMemo(() => {
    const mealId = recipeModal.meal?.id
    if (!mealId) return new Set<number>()
    return checkedIngredientsMap.get(mealId) ?? new Set<number>()
  }, [checkedIngredientsMap, recipeModal.meal?.id])

  // Toggle handler with current meal ID
  const handleToggleChecked = useCallback(
    (ingredientId: number) => {
      const mealId = recipeModal.meal?.id
      if (!mealId) return
      toggleIngredientChecked(mealId, ingredientId)
    },
    [recipeModal.meal?.id, toggleIngredientChecked]
  )

  // Initialize the selected date once from server data
  useEffect(() => {
    const initial = new Date(initialDate)
    setSelectedDate(initial)
  }, [initialDate, setSelectedDate])

  // Normalize value coming from zustand persist (rehydrates as string)
  const normalizedSelectedDate =
    selectedDate instanceof Date
      ? selectedDate
      : selectedDate
        ? new Date(selectedDate)
        : new Date()

  const selectedDateStr = !Number.isNaN(normalizedSelectedDate.getTime())
    ? formatLocalDate(normalizedSelectedDate)
    : ''

  // Sprawdź czy wybrana data to dzisiaj
  const today = new Date()
  const isToday =
    formatLocalDate(normalizedSelectedDate) === formatLocalDate(today)

  // Śledź poprzednią datę aby rozróżnić zmianę daty od refetch po zmianie statusu posiłku
  const prevDateRef = useRef(selectedDateStr)
  const isDateChanging = prevDateRef.current !== selectedDateStr

  const {
    data: meals,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePlannedMealsQuery(selectedDateStr, selectedDateStr)

  // Aktualizuj poprzednią datę gdy dane zostaną załadowane
  useEffect(() => {
    if (!isFetching) {
      prevDateRef.current = selectedDateStr
    }
  }, [isFetching, selectedDateStr])

  // Sprawdź kompletność tygodniowego planu
  const { data: weekCheck, isLoading: isCheckingWeek } = useWeekMealsCheck()

  const {
    mutate: generatePlan,
    isPending: isGenerating,
    error: generateError,
    reset: resetGenerateError,
  } = useAutoGenerateMealPlan()

  // Resetuj błąd generowania gdy zmienia się data
  // (błąd MEAL_PLAN_EXISTS z jednego dnia nie powinien blokować widoku innych dni)
  useEffect(() => {
    if (generateError) {
      resetGenerateError()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateStr])

  // Użyj meals jeśli są dostępne, w przeciwnym razie initialMeals
  const displayMeals = meals ?? initialMeals
  const handleRecipePreview = (meal: PlannedMealDTO) => {
    setRecipeModal({
      isOpen: true,
      meal,
    })
  }

  const handleRecipeModalChange = (open: boolean) => {
    setRecipeModal((prev) => ({
      isOpen: open,
      meal: open ? prev.meal : null,
    }))
  }

  // Update modal meal when meals data refetches (e.g., after save)
  useEffect(() => {
    if (recipeModal.isOpen && recipeModal.meal && meals) {
      const updatedMeal = meals.find((m) => m.id === recipeModal.meal?.id)
      if (updatedMeal) {
        setRecipeModal((prev) => ({
          ...prev,
          meal: updatedMeal,
        }))
      }
    }
  }, [meals, recipeModal.isOpen, recipeModal.meal])

  // Auto-generuj plan tylko raz gdy brak danych lub dane niekompletne
  // Używamy ref aby śledzić czy już próbowaliśmy wygenerować plan
  const hasAttemptedGeneration = React.useRef(false)

  // Jeśli mamy dane z serwera, nie próbuj generować
  // (initialMeals jest przekazywane z server-side, więc jeśli ma dane, plan istnieje)
  const hasInitialData = initialMeals.length > 0

  useEffect(() => {
    // Nie generuj jeśli już mamy dane z serwera
    if (hasInitialData) {
      hasAttemptedGeneration.current = true
      return
    }

    // Sprawdź czy mamy kompletny plan na cały tydzień (21 posiłków = 7 dni × 3 posiłki)
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

  // Pokaż pełnoekranowy spinner TYLKO podczas aktywnego generowania planu
  if (isGenerating) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center space-y-6'>
        <Loader2
          className='text-primary h-16 w-16 animate-spin'
          strokeWidth={2}
        />
        <div className='space-y-2 text-center'>
          <h2 className='text-xl font-bold text-gray-800'>
            Generujemy Twój plan
          </h2>
          <p className='text-sm text-gray-600'>
            Przygotowujemy spersonalizowany plan posiłków na cały tydzień...
          </p>
        </div>
      </div>
    )
  }

  // Sprawdź czy błąd generowania to "plan już istnieje" - to nie jest prawdziwy błąd
  const isGenerateErrorIgnorable =
    generateError instanceof Error &&
    generateError.message.includes('już istnieje')

  // Obsługa błędów (ignoruj błąd "plan już istnieje")
  if (error || (generateError && !isGenerateErrorIgnorable)) {
    return (
      <div className='container mx-auto space-y-6 px-4 py-8'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>
            {generateError ? 'Błąd generowania planu' : 'Błąd ładowania danych'}
          </AlertTitle>
          <AlertDescription className='space-y-2'>
            <p>
              {error instanceof Error
                ? error.message
                : generateError instanceof Error
                  ? generateError.message
                  : 'Nie udało się pobrać posiłków. Spróbuj ponownie.'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                if (generateError) {
                  generatePlan()
                } else {
                  refetch()
                }
              }}
            >
              Spróbuj ponownie
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='space-y-3 sm:space-y-8'>
      <div className='grid items-start gap-3 sm:gap-8 xl:grid-cols-3'>
        {/* Column 1 - calendar (spans 2 cols on xl) */}
        <div className='xl:col-span-2'>
          <CalendarStrip
            selectedDate={normalizedSelectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Column 2 - calories / macros (spans 1 col, 2 rows on xl) */}
        <div className='w-full xl:col-span-1 xl:row-span-2'>
          {isFetching && isDateChanging ? (
            <div className='flex h-full min-h-[200px] items-center justify-center rounded-md border-2 border-white bg-white/40 shadow-sm backdrop-blur-xl sm:min-h-[300px] sm:rounded-3xl'>
              <Loader2
                className='text-primary h-10 w-10 animate-spin'
                strokeWidth={3}
              />
            </div>
          ) : (
            <MacroProgressSection
              key={selectedDateStr}
              meals={displayMeals}
              targetMacros={targetMacros}
              isToday={isToday}
              isMobile={isMobile}
            />
          )}
        </div>

        {/* Column 1 continued - meals list */}
        <div className='xl:col-span-2'>
          {isFetching && !isLoading && isDateChanging ? (
            <div className='flex h-16 items-start justify-center'>
              <Loader2
                className='text-primary h-14 w-14 animate-spin'
                strokeWidth={3}
              />
            </div>
          ) : (
            <MealsList
              meals={displayMeals}
              date={selectedDateStr}
              onRecipePreview={handleRecipePreview}
            />
          )}
        </div>
      </div>

      <RecipePreviewModal
        isOpen={recipeModal.isOpen}
        meal={recipeModal.meal}
        onOpenChange={handleRecipeModalChange}
        enableIngredientEditing={true}
        checkedIngredients={currentMealCheckedIngredients}
        onToggleChecked={handleToggleChecked}
      />
    </div>
  )
}
