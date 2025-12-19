'use client'

/**
 * DayCard - Karta pojedynczego dnia zawierająca 3 posiłki (widok mobile)
 */

import { MealCard } from './MealCard'
import type { DayPlanViewModel } from '@/types/meal-plan-view.types'
import type { PlannedMealDTO } from '@/types/dto.types'

interface DayCardProps {
  day: DayPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}

export const DayCard = ({ day, onMealClick }: DayCardProps) => {
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
        {/* Śniadanie */}
        {day.breakfast && (
          <MealCard
            meal={day.breakfast}
            mealType='breakfast'
            onMealClick={onMealClick}
            showSwapButton={isTodayOrFuture}
          />
        )}

        {/* Obiad */}
        {day.lunch && (
          <MealCard
            meal={day.lunch}
            mealType='lunch'
            onMealClick={onMealClick}
            showSwapButton={isTodayOrFuture}
          />
        )}

        {/* Kolacja */}
        {day.dinner && (
          <MealCard
            meal={day.dinner}
            mealType='dinner'
            onMealClick={onMealClick}
            showSwapButton={isTodayOrFuture}
          />
        )}
      </div>
    </div>
  )
}
