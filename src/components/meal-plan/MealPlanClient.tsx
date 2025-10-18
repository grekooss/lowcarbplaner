'use client'

/**
 * MealPlanClient - Główny wrapper po stronie klienta
 * Zarządza stanem modali, responsywnością i integracją z TanStack Query
 */

import { useState, useMemo } from 'react'
import { usePlannedMealsQuery } from '@/hooks/usePlannedMealsQuery'
import { transformToWeekPlan } from '@/lib/utils/meal-plan'
import { WeekTable } from './WeekTable'
import { DayList } from './DayList'
import { RecipeModal } from './RecipeModal'
import { ReplacementsModal } from './ReplacementsModal'
import type { PlannedMealDTO } from '@/types/dto.types'
import type {
  RecipeModalState,
  ReplacementsModalState,
} from '@/types/meal-plan-view.types'

interface MealPlanClientProps {
  initialMeals: PlannedMealDTO[]
  startDate: string // YYYY-MM-DD
}

/**
 * Główny komponent kliencki widoku Plan Posiłków
 * Renderuje responsywnie: WeekTable (desktop) lub DayList (mobile)
 */
export const MealPlanClient = ({
  initialMeals,
  startDate,
}: MealPlanClientProps) => {
  // Stan modali
  const [recipeModal, setRecipeModal] = useState<RecipeModalState>({
    isOpen: false,
    recipe: null,
  })

  const [replacementsModal, setReplacementsModal] =
    useState<ReplacementsModalState>({
      isOpen: false,
      mealId: null,
      mealType: null,
    })

  // Oblicz endDate (startDate + 6 dni)
  const endDate = useMemo(() => {
    const end = new Date(startDate)
    end.setDate(end.getDate() + 6)
    return end.toISOString().split('T')[0] || ''
  }, [startDate])

  // Query dla re-fetching danych (z fallback na initialMeals)
  const { data: meals = initialMeals } = usePlannedMealsQuery(
    startDate,
    endDate
  )

  // Transformacja do ViewModel
  const weekPlan = useMemo(
    () => transformToWeekPlan(meals, startDate),
    [meals, startDate]
  )

  // Handler kliknięcia na posiłek (zobacz przepis)
  const handleMealClick = (meal: PlannedMealDTO) => {
    setRecipeModal({
      isOpen: true,
      recipe: meal.recipe,
    })
  }

  // Handler kliknięcia "Zmień posiłek"
  const handleSwapClick = (mealId: number, mealType: string) => {
    setReplacementsModal({
      isOpen: true,
      mealId,
      mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
    })
  }

  return (
    <>
      {/* Desktop: WeekTable (widoczny >= md) */}
      <div className='hidden md:block'>
        <WeekTable
          weekPlan={weekPlan}
          onMealClick={handleMealClick}
          onSwapClick={handleSwapClick}
        />
      </div>

      {/* Mobile: DayList (widoczny < md) */}
      <div className='block md:hidden'>
        <DayList
          weekPlan={weekPlan}
          onMealClick={handleMealClick}
          onSwapClick={handleSwapClick}
        />
      </div>

      {/* Modal podglądu przepisu */}
      <RecipeModal
        isOpen={recipeModal.isOpen}
        recipe={recipeModal.recipe}
        onOpenChange={(open) =>
          setRecipeModal((prev) => ({ ...prev, isOpen: open }))
        }
      />

      {/* Modal zamienników */}
      <ReplacementsModal
        isOpen={replacementsModal.isOpen}
        mealId={replacementsModal.mealId}
        mealType={replacementsModal.mealType}
        onOpenChange={(open) =>
          setReplacementsModal((prev) => ({ ...prev, isOpen: open }))
        }
      />
    </>
  )
}
