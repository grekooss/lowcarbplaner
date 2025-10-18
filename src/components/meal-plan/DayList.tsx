'use client'

/**
 * DayList - Lista dni dla widoku mobile
 * Każdy dzień to karta z 3 posiłkami wewnątrz
 */

import { DayCard } from './DayCard'
import type { WeekPlanViewModel } from '@/types/meal-plan-view.types'
import type { PlannedMealDTO } from '@/types/dto.types'

interface DayListProps {
  weekPlan: WeekPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}

export const DayList = ({
  weekPlan,
  onMealClick,
  onSwapClick,
}: DayListProps) => {
  return (
    <div className='flex flex-col gap-6'>
      {weekPlan.days.map((day) => (
        <DayCard
          key={day.date}
          day={day}
          onMealClick={onMealClick}
          onSwapClick={onSwapClick}
        />
      ))}
    </div>
  )
}
