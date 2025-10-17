/**
 * Komponent listy posiłków
 *
 * Wyświetla 3 karty posiłków (śniadanie, obiad, kolacja) z obsługą pustego stanu.
 */

'use client'

import { MealCard } from './MealCard'
import { EmptyState } from './EmptyState'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MealsListProps {
  meals: PlannedMealDTO[]
  date: string // YYYY-MM-DD
}

/**
 * Komponent listy posiłków na dany dzień
 *
 * Filtruje posiłki według meal_type i renderuje w kolejności:
 * śniadanie → obiad → kolacja
 *
 * @example
 * ```tsx
 * <MealsList
 *   meals={plannedMeals}
 *   date="2025-10-15"
 * />
 * ```
 */
export function MealsList({ meals, date }: MealsListProps) {
  // Filtruj posiłki po meal_date
  const mealsForDate = meals.filter((meal) => meal.meal_date === date)

  // Pogrupuj według typu
  const breakfast = mealsForDate.find((m) => m.meal_type === 'breakfast')
  const lunch = mealsForDate.find((m) => m.meal_type === 'lunch')
  const dinner = mealsForDate.find((m) => m.meal_type === 'dinner')

  // Pusty stan jeśli brak posiłków
  if (mealsForDate.length === 0) {
    return <EmptyState date={date} />
  }

  return (
    <section className='space-y-6'>
      {/* Nagłówek sekcji */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Posiłki</h2>
        <p className='text-muted-foreground text-sm'>
          {mealsForDate.filter((m) => m.is_eaten).length} /{' '}
          {mealsForDate.length} zjedzonych
        </p>
      </div>

      {/* Karty posiłków */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {/* Śniadanie */}
        {breakfast && (
          <div className='space-y-2'>
            <MealCard meal={breakfast} />
          </div>
        )}

        {/* Obiad */}
        {lunch && (
          <div className='space-y-2'>
            <MealCard meal={lunch} />
          </div>
        )}

        {/* Kolacja */}
        {dinner && (
          <div className='space-y-2'>
            <MealCard meal={dinner} />
          </div>
        )}
      </div>

      {/* Informacja o brakujących posiłkach */}
      {mealsForDate.length > 0 && mealsForDate.length < 3 && (
        <div className='text-muted-foreground text-sm'>
          ℹ️ Niektóre posiłki nie zostały jeszcze zaplanowane na ten dzień.
        </div>
      )}
    </section>
  )
}
