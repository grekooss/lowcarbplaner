'use client'

/**
 * DayCard - Karta pojedynczego dnia zawierająca 3 posiłki (widok mobile)
 */

import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { MealCard } from './MealCard'
import type { DayPlanViewModel } from '@/types/meal-plan-view.types'
import type { PlannedMealDTO } from '@/types/dto.types'

interface DayCardProps {
  day: DayPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}

export const DayCard = ({ day, onMealClick }: DayCardProps) => {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>
            {day.dayName}, {day.dayNumber} {day.monthName}
          </h3>
          {day.isToday && (
            <span className='text-primary bg-primary/10 rounded-full px-2 py-1 text-xs font-semibold'>
              Dziś
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
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
      </CardContent>
    </Card>
  )
}
