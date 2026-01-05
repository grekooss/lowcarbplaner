/**
 * MealsList component
 *
 * Renders the meals for a selected day with stepper timeline design.
 * Supports all meal types: breakfast, snack_morning, lunch, snack_afternoon, dinner
 */

'use client'

import { useMemo } from 'react'
import { MealCard } from './MealCard'
import type { PlannedMealDTO } from '@/types/dto.types'
import type { Enums } from '@/types/database.types'
import { calculateMealSchedule } from '@/types/onboarding-view.types'

interface MealScheduleConfig {
  eatingStartTime: string
  eatingEndTime: string
  mealPlanType: Enums<'meal_plan_type_enum'>
}

interface MealsListProps {
  meals: PlannedMealDTO[]
  date: string // YYYY-MM-DD
  onRecipePreview: (meal: PlannedMealDTO) => void
  mealScheduleConfig: MealScheduleConfig
}

export function MealsList({
  meals,
  date,
  onRecipePreview,
  mealScheduleConfig,
}: MealsListProps) {
  const mealsForDate = meals.filter((meal) => meal.meal_date === date)

  // Oblicz harmonogram godzin posiłków na podstawie konfiguracji profilu
  const mealTimeMap = useMemo(() => {
    const schedule = calculateMealSchedule(
      mealScheduleConfig.mealPlanType,
      mealScheduleConfig.eatingStartTime,
      mealScheduleConfig.eatingEndTime
    )
    return new Map(schedule.map((s) => [s.type, s.time]))
  }, [mealScheduleConfig])

  // Sprawdź czy wybrany dzień jest dzisiaj lub innym dniem
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selectedDate = new Date(date)
  selectedDate.setHours(0, 0, 0, 0)
  const isCurrentDate = selectedDate.getTime() === today.getTime()
  const isTodayOrFuture = selectedDate >= today

  // Pobierz posiłki według typu
  const breakfast = mealsForDate.find((meal) => meal.meal_type === 'breakfast')
  const snackMorning = mealsForDate.find(
    (meal) => meal.meal_type === 'snack_morning'
  )
  const lunch = mealsForDate.find((meal) => meal.meal_type === 'lunch')
  const snackAfternoon = mealsForDate.find(
    (meal) => meal.meal_type === 'snack_afternoon'
  )
  const dinner = mealsForDate.find((meal) => meal.meal_type === 'dinner')

  if (mealsForDate.length === 0) {
    return null
  }

  // Uporządkuj posiłki według kolejności w ciągu dnia
  const orderedMeals = [
    breakfast,
    snackMorning,
    lunch,
    snackAfternoon,
    dinner,
  ].filter((meal): meal is PlannedMealDTO => Boolean(meal))

  return (
    <section className='relative'>
      {/* Vertical Line - only show when we have stepper checkboxes */}
      {isCurrentDate && orderedMeals.length > 1 && (
        <div className='absolute top-4 -bottom-6 left-[73px] z-0 w-0.5 bg-white sm:top-6 sm:left-[91px]' />
      )}

      <div className='space-y-6'>
        {orderedMeals.map((meal, index) => (
          <MealCard
            key={meal.id}
            meal={meal}
            showSwapButton={isTodayOrFuture}
            enableEatenCheckbox={isCurrentDate}
            onRecipePreview={onRecipePreview}
            mealTime={mealTimeMap.get(meal.meal_type)}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}
