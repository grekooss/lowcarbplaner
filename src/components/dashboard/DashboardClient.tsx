/**
 * DashboardClient (client component)
 *
 * Manages selected date, data fetching and coordinates dashboard sub-components.
 */

'use client'

import React, { useEffect } from 'react'
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

  const {
    data: meals,
    isLoading,
    error,
    refetch,
  } = usePlannedMealsQuery(selectedDateStr, selectedDateStr)

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
            {generateError ? 'Blad generowania planu' : 'Blad ladowania danych'}
          </AlertTitle>
          <AlertDescription className='space-y-2'>
            <p>
              {error instanceof Error
                ? error.message
                : generateError instanceof Error
                  ? generateError.message
                  : 'Nie udalo sie pobrac posilkow. Sprobuj ponownie.'}
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
              Sprobuj ponownie
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-8 px-4 py-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Twoj Plan Dnia</h1>
        <p className='text-muted-foreground'>
          Sledz swoje posilki i realizacje celow zywieniowych
        </p>
      </div>

      <div className='grid gap-8 lg:grid-cols-[minmax(0,_2.75fr)_minmax(0,_1fr)]'>
        {/* Column 1 - calendar and meals of the day */}
        <div className='space-y-6'>
          <CalendarStrip
            selectedDate={normalizedSelectedDate}
            onDateChange={setSelectedDate}
          />
          <div className='relative'>
            {isGenerating && (
              <div className='absolute top-4 right-4 z-10'>
                <div className='bg-background/95 flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-lg backdrop-blur-sm'>
                  <Loader2 className='text-primary h-4 w-4 animate-spin' />
                  <span className='font-medium'>Generowanie planu...</span>
                </div>
              </div>
            )}
            <MealsList
              meals={displayMeals}
              date={selectedDateStr}
              onRecipePreview={handleRecipePreview}
            />
          </div>
        </div>

        {/* Column 2 - calories / macros */}
        <div className='space-y-6'>
          <MacroProgressSection
            meals={displayMeals}
            targetMacros={targetMacros}
          />
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
