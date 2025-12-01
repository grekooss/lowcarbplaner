/**
 * DashboardClient (client component)
 *
 * Manages selected date, data fetching and coordinates dashboard sub-components.
 */

'use client'

import React, { useEffect, useRef } from 'react'
import { CalendarStrip } from './CalendarStrip'
import { MacroProgressSection } from './MacroProgressSection'
import { MealsList } from './MealsList'
import { DashboardSkeleton } from './DashboardSkeleton'
import { useDashboardStore } from '@/lib/zustand/stores/useDashboardStore'
import { usePlannedMealsQuery } from '@/hooks/usePlannedMealsQuery'
import { useAutoGenerateMealPlan } from '@/hooks/useAutoGenerateMealPlan'
import { useWeekMealsCheck } from '@/hooks/useWeekMealsCheck'
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
  const [recipeModal, setRecipeModal] = React.useState<{
    isOpen: boolean
    meal: PlannedMealDTO | null
  }>({
    isOpen: false,
    meal: null,
  })

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

  // Format daty lokalnie (bez konwersji do UTC)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const selectedDateStr = !Number.isNaN(normalizedSelectedDate.getTime())
    ? formatLocalDate(normalizedSelectedDate)
    : ''

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
  } = useAutoGenerateMealPlan()

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
        console.log('🔄 Updating modal with fresh meal data:', {
          mealId: updatedMeal.id,
          oldOverrides: recipeModal.meal.ingredient_overrides,
          newOverrides: updatedMeal.ingredient_overrides,
        })
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

  useEffect(() => {
    // Sprawdź czy mamy kompletny plan na cały tydzień (21 posiłków = 7 dni × 3 posiłki)
    const hasIncompletePlan = weekCheck?.hasIncompletePlan ?? false
    const shouldGenerate =
      !isLoading &&
      !isCheckingWeek &&
      !isGenerating &&
      hasIncompletePlan &&
      !hasAttemptedGeneration.current

    console.log('🔍 DashboardClient auto-generation check:', {
      mealsCount: weekCheck?.mealsCount,
      expectedCount: weekCheck?.expectedMealsCount,
      hasIncompletePlan,
      isLoading,
      isCheckingWeek,
      isGenerating,
      hasAttemptedGeneration: hasAttemptedGeneration.current,
      shouldGenerate,
    })

    if (shouldGenerate) {
      hasAttemptedGeneration.current = true
      console.log(
        `🤖 Auto-generating meal plan for week (mają ${weekCheck?.mealsCount}/${weekCheck?.expectedMealsCount} posiłków)`
      )
      generatePlan()
    }
  }, [
    isLoading,
    isCheckingWeek,
    isGenerating,
    weekCheck?.hasIncompletePlan,
    weekCheck?.mealsCount,
    weekCheck?.expectedMealsCount,
    generatePlan,
  ])

  // Pokaż skeleton podczas generowania lub ładowania (gdy brak danych)
  if ((isLoading || isGenerating) && displayMeals.length === 0) {
    return <DashboardSkeleton />
  }

  // Obsługa błędów
  if (error || generateError) {
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
    <div className='space-y-8'>
      <div className='grid items-start gap-8 xl:grid-cols-3'>
        {/* Column 1 - calendar (spans 2 cols on xl) */}
        <div className='xl:col-span-2'>
          <CalendarStrip
            selectedDate={normalizedSelectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Column 2 - calories / macros (spans 1 col, 2 rows on xl) */}
        <div className='w-full xl:col-span-1 xl:row-span-2'>
          <MacroProgressSection
            meals={displayMeals}
            targetMacros={targetMacros}
          />
        </div>

        {/* Column 1 continued - meals list */}
        <div className='xl:col-span-2'>
          {isFetching && !isLoading && isDateChanging ? (
            <div className='flex h-16 items-start justify-center'>
              <Loader2
                className='h-14 w-14 animate-spin text-red-600'
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
      />
    </div>
  )
}
