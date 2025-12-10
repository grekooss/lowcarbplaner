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

  return (
    <div className='space-y-3'>
      {/* Czerwony button z dniem */}
      <div className='flex items-center justify-center gap-1.5 rounded-md bg-red-600 py-2.5 text-white shadow-sm'>
        <span className='font-semibold capitalize'>{day.dayName}</span>
        <span className='font-bold'>{day.dayNumber}</span>
        <span>{month}</span>
        <span className='text-sm opacity-80'>{year}</span>
      </div>

      {/* Posiłki */}
      <div className='space-y-3'>
        {/* Śniadanie */}
        {day.breakfast && (
          <MealCard
            meal={day.breakfast}
            mealType='breakfast'
            onMealClick={onMealClick}
          />
        )}

        {/* Obiad */}
        {day.lunch && (
          <MealCard
            meal={day.lunch}
            mealType='lunch'
            onMealClick={onMealClick}
          />
        )}

        {/* Kolacja */}
        {day.dinner && (
          <MealCard
            meal={day.dinner}
            mealType='dinner'
            onMealClick={onMealClick}
          />
        )}
      </div>
    </div>
  )
}
