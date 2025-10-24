﻿'use client'

/**
 * MealPlanClient - Glowny wrapper po stronie klienta
 * Zarzadza stanem modali, responsywnoscia i integracja z TanStack Query
 */

import React, { useState, useMemo, useEffect } from 'react'
import { usePlannedMealsQuery } from '@/hooks/usePlannedMealsQuery'
import { useAutoGenerateMealPlan } from '@/hooks/useAutoGenerateMealPlan'
import { transformToWeekPlan } from '@/lib/utils/meal-plan'
import { WeekTable } from './WeekTable'
import { DayList } from './DayList'
import { RecipeModal } from './RecipeModal'
import { ReplacementsModal } from './ReplacementsModal'
import type { PlannedMealDTO } from '@/types/dto.types'
import type { ReplacementsModalState } from '@/types/meal-plan-view.types'
import { Loader2 } from 'lucide-react'

interface MealPlanClientProps {
  initialMeals: PlannedMealDTO[]
  startDate: string // YYYY-MM-DD
}

/**
 * Glowny komponent kliencki widoku Plan Posiolkow
 * Renderuje responsywnie: WeekTable (desktop) lub DayList (mobile)
 */
export const MealPlanClient = ({
  initialMeals,
  startDate,
}: MealPlanClientProps) => {
  // Stan modali
  const [recipeModal, setRecipeModal] = useState<{
    isOpen: boolean
    meal: PlannedMealDTO | null
  }>({
    isOpen: false,
    meal: null,
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
  const { data: meals = initialMeals, isLoading } = usePlannedMealsQuery(
    startDate,
    endDate
  )

  const { mutate: generatePlan, isPending: isGenerating } =
    useAutoGenerateMealPlan()

  // Auto-generuj plan tylko raz gdy brak danych lub dane niekompletne
  // Uzywamy ref aby sledzic czy juz probowalismy wygenerowac plan
  const hasAttemptedGeneration = React.useRef(false)

  useEffect(() => {
    // 7 dni x 3 posilki = 21 posilkow oczekiwanych
    const expectedMealsCount = 7 * 3
    const hasIncompletePlan = meals.length < expectedMealsCount
    const shouldGenerate =
      !isLoading &&
      !isGenerating &&
      hasIncompletePlan &&
      !hasAttemptedGeneration.current

    console.log('MealPlanClient auto-generation check:', {
      mealsLength: meals.length,
      expectedMealsCount,
      hasIncompletePlan,
      isLoading,
      isGenerating,
      hasAttemptedGeneration: hasAttemptedGeneration.current,
      shouldGenerate,
    })

    if (shouldGenerate) {
      hasAttemptedGeneration.current = true
      console.log(
        `Auto-generating meal plan for week ${startDate} (ma ${meals.length}/${expectedMealsCount} posilkow)`
      )
      generatePlan()
    }
  }, [isLoading, isGenerating, meals.length, startDate, generatePlan])

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
      primary: `${startMonth} ${startYear}`,
      secondary: `${endMonth} ${endYear}`,
    }
  }, [weekPlan.endDate, weekPlan.startDate])

  // Handler klikniecia na posilek (zobacz przepis)
  const handleMealClick = (meal: PlannedMealDTO) => {
    setRecipeModal({
      isOpen: true,
      meal: meal,
    })
  }

  // Handler klikniecia "Zmien posilek"
  const handleSwapClick = (mealId: number, mealType: string) => {
    setReplacementsModal({
      isOpen: true,
      mealId,
      mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
    })
  }

  return (
    <>
      {/* Wskaznik generowania planu */}
      {isGenerating && (
        <div className='mb-6 rounded-2xl border bg-blue-50 p-4'>
          <div className='flex items-center gap-3'>
            <Loader2 className='h-5 w-5 animate-spin text-blue-600' />
            <div>
              <p className='font-semibold text-blue-900'>
                Generowanie planu posilkow...
              </p>
              <p className='text-sm text-blue-700'>
                To moze potrwac chwile. Tworzymy spersonalizowany plan na 7 dni.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: WeekTable (widoczny >= md) */}
      <div className='hidden md:block'>
        <div
          className='relative rounded-[32px] border-none bg-white px-6 pt-4 pb-6 shadow-none'
          style={{ border: 'none', boxShadow: 'none' }}
        >
          <WeekTable
            weekPlan={weekPlan}
            monthHeader={monthHeader}
            onMealClick={handleMealClick}
            onSwapClick={handleSwapClick}
          />
        </div>
      </div>

      {/* Mobile: DayList (widoczny < md) */}
      {monthHeader && (
        <div className='mb-2 rounded-md bg-[#F5EFE7] px-4 py-2 text-slate-900 md:hidden'>
          <span className='text-base font-semibold'>{monthHeader.primary}</span>
        </div>
      )}
      <div className='block md:hidden'>
        <div
          className='rounded-[32px] border-none bg-white px-4 py-4 shadow-none'
          style={{ border: 'none', boxShadow: 'none' }}
        >
          <DayList
            weekPlan={weekPlan}
            onMealClick={handleMealClick}
            onSwapClick={handleSwapClick}
          />
        </div>
      </div>

      {/* Modal podgladu przepisu */}
      <RecipeModal
        isOpen={recipeModal.isOpen}
        meal={recipeModal.meal}
        onOpenChange={(open) =>
          setRecipeModal((prev) => ({ ...prev, isOpen: open }))
        }
        enableIngredientEditing={false}
      />

      {/* Modal zamiennikow */}
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
