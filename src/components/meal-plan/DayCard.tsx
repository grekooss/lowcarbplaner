'use client'

/**
 * DayCard - Karta pojedynczego dnia zawierająca posiłki (widok mobile)
 * Obsługuje wszystkie typy posiłków: breakfast, snack_morning, lunch, snack_afternoon, dinner
 */

import { memo } from 'react'
import { MealCard } from './MealCard'
import type { DayPlanViewModel, MealType } from '@/types/meal-plan-view.types'
import type { PlannedMealDTO } from '@/types/dto.types'

interface DayCardProps {
  day: DayPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
}

export const DayCard = memo(function DayCard({
  day,
  onMealClick,
}: DayCardProps) {
  // Formatuj pełną datę: "Środa 10 grudzień 2025"
  const fullDate = new Date(day.date)
  const month = fullDate.toLocaleDateString('pl-PL', { month: 'long' })
  const year = fullDate.getFullYear()

  // Pokaż przycisk zmiany tylko dla dziś i przyszłych dni
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayDate = new Date(day.date)
  dayDate.setHours(0, 0, 0, 0)
  const isTodayOrFuture = dayDate >= today

  // Lista posiłków w kolejności
  const meals: { meal: PlannedMealDTO | null; type: MealType }[] = [
    { meal: day.breakfast, type: 'breakfast' },
    { meal: day.snack_morning, type: 'snack_morning' },
    { meal: day.lunch, type: 'lunch' },
    { meal: day.snack_afternoon, type: 'snack_afternoon' },
    { meal: day.dinner, type: 'dinner' },
  ]

  return (
    <div className='space-y-3'>
      {/* Nagłówek dnia */}
      <div className='flex items-baseline gap-2 pl-2'>
        <span className='text-text-main font-semibold capitalize'>
          {day.dayName}
        </span>
        <span className='bg-primary flex h-9 w-9 items-center justify-center rounded-sm text-xl font-bold text-white'>
          {day.dayNumber}
        </span>
        <span className='text-text-main'>{month}</span>
        <span className='text-text-muted text-xs'>{year}</span>
      </div>

      {/* Posiłki */}
      <div className='space-y-3'>
        {meals.map(({ meal, type }) =>
          meal ? (
            <MealCard
              key={meal.id}
              meal={meal}
              mealType={type}
              onMealClick={onMealClick}
              showSwapButton={isTodayOrFuture}
            />
          ) : null
        )}
      </div>
    </div>
  )
})
