/**
 * MealsList component
 *
 * Renders the meals for a selected day using the new vertical layout.
 */

'use client'

import { MealCard } from './MealCard'
import { EmptyState } from './EmptyState'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MealsListProps {
  meals: PlannedMealDTO[]
  date: string // YYYY-MM-DD
}

export function MealsList({ meals, date }: MealsListProps) {
  const mealsForDate = meals.filter((meal) => meal.meal_date === date)

  const breakfast = mealsForDate.find((meal) => meal.meal_type === 'breakfast')
  const lunch = mealsForDate.find((meal) => meal.meal_type === 'lunch')
  const dinner = mealsForDate.find((meal) => meal.meal_type === 'dinner')

  if (mealsForDate.length === 0) {
    return <EmptyState date={date} />
  }

  const orderedMeals = [breakfast, lunch, dinner].filter(
    (meal): meal is PlannedMealDTO => Boolean(meal)
  )

  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Posilki</h2>
        <p className='text-muted-foreground text-sm'>
          {mealsForDate.filter((meal) => meal.is_eaten).length} /{' '}
          {mealsForDate.length} zjedzonych
        </p>
      </div>

      <div className='space-y-4'>
        {orderedMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>

      {mealsForDate.length > 0 && mealsForDate.length < 3 && (
        <div className='text-muted-foreground text-sm'>
          Nie wszystkie posilki zostaly jeszcze zaplanowane na ten dzien.
        </div>
      )}
    </section>
  )
}
