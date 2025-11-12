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

  // Jeśli nie ma posiłków dla wybranej daty, ale są jakieś posiłki w tablicy,
  // to znaczy że ładujemy nowe dane - pokaż poprzednie posiłki
  const hasAnyMeals = meals.length > 0
  const hasMealsForOtherDates = hasAnyMeals && mealsForDate.length === 0

  if (hasMealsForOtherDates) {
    // Pokazujemy ostatnie dostępne posiłki zamiast pustego stanu
    const fallbackMeals = meals.slice(0, 3)
    return (
      <section className='space-y-6 opacity-50 transition-opacity'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Posiłki</h2>
        </div>
        <div className='space-y-4'>
          {fallbackMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              enableEatenCheckbox={false}
              onRecipePreview={onRecipePreview}
            />
          ))}
        </div>
      </section>
    )
  }

  if (mealsForDate.length === 0) {
    return <EmptyState date={date} />
  }

  const orderedMeals = [breakfast, lunch, dinner].filter(
    (meal): meal is PlannedMealDTO => Boolean(meal)
  )

  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Posiłki</h2>
        <p className='text-muted-foreground text-sm'>
          {mealsForDate.filter((meal) => meal.is_eaten).length} /{' '}
          {mealsForDate.length} zjedzonych
        </p>
      </div>

      <div className='space-y-4'>
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
        <div className='text-muted-foreground text-sm'>
          Nie wszystkie posiłki zostały jeszcze zaplanowane na ten dzień.
        </div>
      )}
    </section>
  )
}
