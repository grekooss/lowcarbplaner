'use client'

/**
 * DayList - Lista dni dla widoku mobile
 * Każdy dzień to karta z posiłkami wewnątrz (dynamiczna liczba)
 */

import { memo } from 'react'
import { DayCard } from './DayCard'
import type { WeekPlanViewModel, MealType } from '@/types/meal-plan-view.types'
import type { PlannedMealDTO } from '@/types/dto.types'

interface DayListProps {
  weekPlan: WeekPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  mealTypes: MealType[]
}

export const DayList = memo(function DayList({
  weekPlan,
  onMealClick,
  mealTypes,
}: DayListProps) {
  return (
    <div className='flex flex-col gap-6'>
      {weekPlan.days.map((day) => (
        <DayCard
          key={day.date}
          day={day}
          onMealClick={onMealClick}
          mealTypes={mealTypes}
        />
      ))}
    </div>
  )
})
