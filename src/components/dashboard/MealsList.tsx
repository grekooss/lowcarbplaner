/**
 * MealsList component
 *
 * Renders the meals for a selected day with stepper timeline design.
 * Supports all meal types: breakfast, snack_morning, lunch, snack_afternoon, dinner
 */

'use client'

import { MealCard } from './MealCard'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MealsListProps {
  meals: PlannedMealDTO[]
  date: string // YYYY-MM-DD
  onRecipePreview: (meal: PlannedMealDTO) => void
}

export function MealsList({ meals, date, onRecipePreview }: MealsListProps) {
  const mealsForDate = meals.filter((meal) => meal.meal_date === date)

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
        <div className='absolute top-4 -bottom-6 left-[13px] z-0 w-0.5 bg-white sm:top-6 sm:left-[19px]' />
      )}

      <div className='space-y-8'>
        {orderedMeals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            showSwapButton={isTodayOrFuture}
            enableEatenCheckbox={isCurrentDate}
            onRecipePreview={onRecipePreview}
          />
        ))}
      </div>
    </section>
  )
}
