/**
 * WeekTable - desktop week view for the meal plan.
 * Displays week plan as vertical rows with day cards and meal cards.
 */

'use client'

import type { WeekPlanViewModel } from '@/types/meal-plan-view.types'
import type { PlannedMealDTO } from '@/types/dto.types'
import { MealCard } from './MealCard'

interface WeekTableProps {
  weekPlan: WeekPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}

interface DayRowProps {
  day: string
  date: string
  meals: {
    meal: PlannedMealDTO | null
    mealType: 'breakfast' | 'lunch' | 'dinner'
  }[]
  onMealClick: (meal: PlannedMealDTO) => void
}

const DayRow = ({ day, date, meals, onMealClick }: DayRowProps) => {
  return (
    <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-[140px_1fr]'>
      <div className='bg-dayCard flex flex-col justify-center rounded-2xl p-4'>
        <h2 className='text-foreground mb-1 text-xl font-semibold'>{day}</h2>
        <p className='text-muted-foreground text-sm'>{date}</p>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {meals.map((item, index) =>
          item.meal ? (
            <MealCard
              key={index}
              meal={item.meal}
              mealType={item.mealType}
              onMealClick={onMealClick}
            />
          ) : null
        )}
      </div>
    </div>
  )
}

export function WeekTable({ weekPlan, onMealClick }: WeekTableProps) {
  return (
    <div className='space-y-4'>
      {weekPlan.days.map((day) => {
        const meals = [
          { meal: day.breakfast, mealType: 'breakfast' as const },
          { meal: day.lunch, mealType: 'lunch' as const },
          { meal: day.dinner, mealType: 'dinner' as const },
        ]

        const dateStr = `${day.dayNumber} ${day.monthName}`

        return (
          <DayRow
            key={day.date}
            day={day.dayName}
            date={dateStr}
            meals={meals}
            onMealClick={onMealClick}
          />
        )
      })}
    </div>
  )
}
