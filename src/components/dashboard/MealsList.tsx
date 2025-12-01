/**
 * MealsList component
 *
 * Renders the meals for a selected day with stepper timeline design.
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
  const isFutureDate = selectedDate > today
  const isCurrentDate = selectedDate.getTime() === today.getTime()

  const breakfast = mealsForDate.find((meal) => meal.meal_type === 'breakfast')
  const lunch = mealsForDate.find((meal) => meal.meal_type === 'lunch')
  const dinner = mealsForDate.find((meal) => meal.meal_type === 'dinner')

  if (mealsForDate.length === 0) {
    return null
  }

  const orderedMeals = [breakfast, lunch, dinner].filter(
    (meal): meal is PlannedMealDTO => Boolean(meal)
  )

  return (
    <section className='relative'>
      {/* Vertical Line - only show when we have stepper checkboxes */}
      {isCurrentDate && orderedMeals.length > 1 && (
        <div className='absolute top-6 -bottom-6 left-[19px] z-0 w-0.5 bg-white' />
      )}

      <div className='space-y-8'>
        {orderedMeals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            showSwapButton={isFutureDate}
            enableEatenCheckbox={isCurrentDate}
            onRecipePreview={onRecipePreview}
          />
        ))}
      </div>

      {mealsForDate.length > 0 && mealsForDate.length < 3 && (
        <div className='mt-6 ml-16 text-sm text-gray-500'>
          Nie wszystkie posiłki zostały jeszcze zaplanowane na ten dzień.
        </div>
      )}
    </section>
  )
}
