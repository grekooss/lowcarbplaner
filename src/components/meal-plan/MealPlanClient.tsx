'use client'

/**
 * MealPlanClient - Główny wrapper po stronie klienta
 * Zarządza stanem modali, responsywnością i integracją z TanStack Query
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { usePlannedMealsQuery } from '@/hooks/usePlannedMealsQuery'
import { useAutoGenerateMealPlan } from '@/hooks/useAutoGenerateMealPlan'
import { useCheckedIngredientsStore } from '@/lib/zustand/stores/useCheckedIngredientsStore'
import { transformToWeekPlan } from '@/lib/utils/meal-plan'
import { WeekTable } from './WeekTable'
import { DayList } from './DayList'
import { RecipeModal } from './RecipeModal'
import type { PlannedMealDTO } from '@/types/dto.types'
import type { Enums } from '@/types/database.types'
import type { MealType } from '@/types/meal-plan-view.types'
import { Loader2 } from 'lucide-react'

/**
 * Mapowanie meal_plan_type na listę typów posiłków do wyświetlenia
 */
function getMealTypesForPlan(
  mealPlanType: Enums<'meal_plan_type_enum'>,
  selectedMeals: Enums<'meal_type_enum'>[] | null
): MealType[] {
  switch (mealPlanType) {
    case '3_main_2_snacks':
      return [
        'breakfast',
        'snack_morning',
        'lunch',
        'snack_afternoon',
        'dinner',
      ]
    case '3_main_1_snack':
      return ['breakfast', 'lunch', 'snack_afternoon', 'dinner']
    case '3_main':
      return ['breakfast', 'lunch', 'dinner']
    case '2_main':
      // Dla 2_main używamy selected_meals z profilu
      if (selectedMeals && selectedMeals.length === 2) {
        return selectedMeals as MealType[]
      }
      // Fallback: breakfast + dinner
      return ['breakfast', 'dinner']
    default:
      return ['breakfast', 'lunch', 'dinner']
  }
}

interface MealPlanClientProps {
  initialMeals: PlannedMealDTO[]
  startDate: string // YYYY-MM-DD
  mealPlanType: Enums<'meal_plan_type_enum'>
  selectedMeals: Enums<'meal_type_enum'>[] | null
}

/**
 * Główny komponent kliencki widoku Plan Posiłków
 * Renderuje responsywnie: WeekTable (desktop) lub DayList (mobile)
 */
export const MealPlanClient = ({
  initialMeals,
  startDate,
  mealPlanType,
  selectedMeals,
}: MealPlanClientProps) => {
  // Oblicz typy posiłków dla tego planu
  const mealTypes = useMemo(
    () => getMealTypesForPlan(mealPlanType, selectedMeals),
    [mealPlanType, selectedMeals]
  )
  // Stan modali
  const [recipeModal, setRecipeModal] = useState<{
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

  // Oblicz endDate (startDate + 6 dni)
  const endDate = useMemo(() => {
    const end = new Date(startDate)
    end.setDate(end.getDate() + 6)
    return end.toISOString().split('T')[0] || ''
  }, [startDate])

  // Query dla re-fetching danych (z fallback na initialMeals)
  const { data: meals = initialMeals, isLoading } = usePlannedMealsQuery(
    startDate,
    endDate
  )

  const { mutate: generatePlan, isPending: isGenerating } =
    useAutoGenerateMealPlan()

  // Auto-generuj plan tylko raz gdy brak danych lub dane niekompletne
  // Używamy ref aby śledzić czy już próbowaliśmy wygenerować plan
  const hasAttemptedGeneration = React.useRef(false)

  useEffect(() => {
    // 7 dni x liczba posiłków zależna od planu
    const expectedMealsCount = 7 * mealTypes.length
    const hasIncompletePlan = meals.length < expectedMealsCount
    const shouldGenerate =
      !isLoading &&
      !isGenerating &&
      hasIncompletePlan &&
      !hasAttemptedGeneration.current

    if (shouldGenerate) {
      hasAttemptedGeneration.current = true
      generatePlan()
    }
  }, [
    isLoading,
    isGenerating,
    meals.length,
    startDate,
    generatePlan,
    mealTypes.length,
  ])

  // Transformacja do ViewModel
  const weekPlan = useMemo(
    () => transformToWeekPlan(meals, startDate),
    [meals, startDate]
  )

  const monthHeader = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('pl-PL', { month: 'long' })

    const capitalize = (value: string) => {
      if (!value) return value
      return value.charAt(0).toUpperCase() + value.slice(1)
    }

    const start = new Date(weekPlan.startDate)
    const end = new Date(weekPlan.endDate)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null
    }

    const startMonth = capitalize(formatter.format(start))
    const endMonth = capitalize(formatter.format(end))
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()

    if (startYear === endYear) {
      if (startMonth === endMonth) {
        return {
          primary: startMonth,
          secondary: String(startYear),
        }
      }

      return {
        primary: `${startMonth} - ${endMonth}`,
        secondary: String(startYear),
      }
    }

    return {
      primary: `${startMonth}-${endMonth}`,
      secondary: `${startYear}-${endYear}`,
    }
  }, [weekPlan.endDate, weekPlan.startDate])

  // Handler kliknięcia na posiłek (zobacz przepis)
  const handleMealClick = (meal: PlannedMealDTO) => {
    setRecipeModal({
      isOpen: true,
      meal: meal,
    })
  }

  // Sync modal meal data with fresh query data (after save or refetch)
  const currentMealId = recipeModal.meal?.id
  useEffect(() => {
    if (recipeModal.isOpen && currentMealId) {
      const freshMeal = meals.find((m) => m.id === currentMealId)
      if (freshMeal) {
        setRecipeModal((prev) => ({
          ...prev,
          meal: freshMeal,
        }))
      }
    }
  }, [meals, recipeModal.isOpen, currentMealId])

  // Initial loading - show spinner overlay
  if (isLoading) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm'>
        <div className='rounded-2xl border-2 border-white bg-white/80 p-6 shadow-lg backdrop-blur-xl'>
          <Loader2 className='text-primary h-10 w-10 animate-spin' />
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-3 sm:space-y-8'>
      {/* Wskaźnik generowania planu */}
      {isGenerating && (
        <div className='rounded-md border-2 border-white bg-white/40 p-4 backdrop-blur-md sm:rounded-2xl'>
          <div className='flex items-center gap-3'>
            <Loader2 className='text-info h-5 w-5 animate-spin' />
            <div>
              <p className='text-text-main font-semibold'>
                Generowanie planu posiłków...
              </p>
              <p className='text-text-secondary text-sm'>
                To może potrwać chwilę. Tworzymy spersonalizowany plan na 7 dni.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: WeekTable (widoczny >= md) */}
      <div className='hidden min-w-0 overflow-hidden md:block'>
        <section className='min-w-0 overflow-hidden rounded-md border-2 border-white bg-white/40 p-6 shadow-sm backdrop-blur-xl sm:rounded-3xl'>
          <WeekTable
            weekPlan={weekPlan}
            monthHeader={monthHeader}
            onMealClick={handleMealClick}
            mealTypes={mealTypes}
          />
        </section>
      </div>

      {/* Mobile: DayList (widoczny < md) */}
      <div className='block md:hidden'>
        <DayList
          weekPlan={weekPlan}
          onMealClick={handleMealClick}
          mealTypes={mealTypes}
        />
      </div>

      {/* Modal podglądu przepisu */}
      <RecipeModal
        isOpen={recipeModal.isOpen}
        meal={recipeModal.meal}
        onOpenChange={(open) =>
          setRecipeModal((prev) => ({ ...prev, isOpen: open }))
        }
        enableIngredientEditing={true}
        checkedIngredients={currentMealCheckedIngredients}
        onToggleChecked={handleToggleChecked}
      />
    </div>
  )
}
