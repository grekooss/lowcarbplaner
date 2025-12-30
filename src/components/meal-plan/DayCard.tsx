'use client'

/**
 * DayCard - Karta pojedynczego dnia zawierająca posiłki (widok mobile)
 * Dynamicznie renderuje posiłki na podstawie mealTypes z profilu użytkownika
 */

import { memo } from 'react'
import { MealCard } from './MealCard'
import type { DayPlanViewModel, MealType } from '@/types/meal-plan-view.types'
import type { PlannedMealDTO } from '@/types/dto.types'

interface DayCardProps {
  day: DayPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  mealTypes: MealType[]
}

export const DayCard = memo(function DayCard({
  day,
  onMealClick,
  mealTypes,
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

  // Dynamicznie buduj listę posiłków na podstawie mealTypes
  const meals = mealTypes.map((mealType) => ({
    meal: day[mealType],
    type: mealType,
  }))

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
