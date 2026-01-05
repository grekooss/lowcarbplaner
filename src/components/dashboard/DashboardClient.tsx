/**
 * DashboardClient (client component)
 *
 * Manages selected date, data fetching and coordinates dashboard sub-components.
 * Refactored to use extracted hooks and state components for better maintainability.
 */

'use client'

import { useEffect, useRef } from 'react'
import { CalendarStrip } from './CalendarStrip'
import { MacroProgressSection } from './MacroProgressSection'
import { MealsList } from './MealsList'
import {
  DashboardGeneratingState,
  DashboardErrorState,
  DashboardSectionLoader,
  MealsListLoader,
} from './DashboardStates'
import { useDashboardStore } from '@/lib/zustand/stores/useDashboardStore'
import { usePlannedMealsQuery } from '@/hooks/usePlannedMealsQuery'
import { useRecipeModal } from '@/hooks/useRecipeModal'
import { useAutoGenerationGuard } from '@/hooks/useAutoGenerationGuard'
import { useIsMobile } from '@/hooks/useIsMobile'
import { formatLocalDate } from '@/lib/utils/date-formatting'
import type { PlannedMealDTO } from '@/types/dto.types'
import type { Enums } from '@/types/database.types'
import { RecipeModal as RecipePreviewModal } from '@/components/meal-plan/RecipeModal'

interface MealScheduleConfig {
  eatingStartTime: string
  eatingEndTime: string
  mealPlanType: Enums<'meal_plan_type_enum'>
}

interface DashboardClientProps {
  initialMeals: PlannedMealDTO[]
  targetMacros: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
  initialDate: string // YYYY-MM-DD
  mealScheduleConfig: MealScheduleConfig
}

export function DashboardClient({
  initialMeals,
  targetMacros,
  initialDate,
  mealScheduleConfig,
}: DashboardClientProps) {
  const { selectedDate, setSelectedDate } = useDashboardStore()
  const isMobile = useIsMobile()

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

  // Check if selected date is today
  const today = new Date()
  const isToday =
    formatLocalDate(normalizedSelectedDate) === formatLocalDate(today)

  // Track previous date to distinguish date change from refetch after meal status change
  const prevDateRef = useRef(selectedDateStr)
  const isDateChanging = prevDateRef.current !== selectedDateStr

  const {
    data: meals,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePlannedMealsQuery(selectedDateStr, selectedDateStr)

  // Update previous date when data is loaded
  useEffect(() => {
    if (!isFetching) {
      prevDateRef.current = selectedDateStr
    }
  }, [isFetching, selectedDateStr])

  // Use meals if available, otherwise initialMeals
  const displayMeals = meals ?? initialMeals

  // Recipe modal management
  const {
    modalState: recipeModal,
    openModal: handleRecipePreview,
    handleOpenChange: handleRecipeModalChange,
    checkedIngredients,
    toggleIngredientChecked,
  } = useRecipeModal(meals)

  // Auto-generation guard
  const hasInitialData = initialMeals.length > 0
  const { isGenerating, generateError, retryGenerate } = useAutoGenerationGuard(
    {
      hasInitialData,
      isLoading,
      selectedDateStr,
    }
  )

  // Show full-screen spinner ONLY during active plan generation
  if (isGenerating) {
    return <DashboardGeneratingState />
  }

  // Check if generation error is ignorable ("plan already exists")
  const isGenerateErrorIgnorable =
    generateError instanceof Error &&
    generateError.message.includes('już istnieje')

  // Handle errors (ignore "plan already exists" error)
  if (error || (generateError && !isGenerateErrorIgnorable)) {
    const isGenError = !!generateError && !isGenerateErrorIgnorable
    return (
      <DashboardErrorState
        error={isGenError ? generateError : error}
        isGenerationError={isGenError}
        onRetry={isGenError ? retryGenerate : refetch}
      />
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
            <DashboardSectionLoader />
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
            <MealsListLoader />
          ) : (
            <MealsList
              meals={displayMeals}
              date={selectedDateStr}
              onRecipePreview={handleRecipePreview}
              mealScheduleConfig={mealScheduleConfig}
            />
          )}
        </div>
      </div>

      <RecipePreviewModal
        isOpen={recipeModal.isOpen}
        meal={recipeModal.meal}
        onOpenChange={handleRecipeModalChange}
        enableIngredientEditing={true}
        checkedIngredients={checkedIngredients}
        onToggleChecked={toggleIngredientChecked}
      />
    </div>
  )
}
