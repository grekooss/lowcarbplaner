/**
 * WeekTable - desktop week view for the meal plan.
 * Displays week plan as vertical rows with day cards and meal cards.
 */

'use client'

import type { WeekPlanViewModel } from '@/types/meal-plan-view.types'
import type { PlannedMealDTO } from '@/types/dto.types'
import { MealCard } from './MealCard'

type MonthHeader = { primary: string; secondary?: string } | null

interface WeekTableProps {
  weekPlan: WeekPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
  monthHeader?: MonthHeader
}

interface DayRowProps {
  day: string
  date: string
  dateStr: string // YYYY-MM-DD format
  meals: {
    meal: PlannedMealDTO | null
    mealType: 'breakfast' | 'lunch' | 'dinner'
  }[]
  onMealClick: (meal: PlannedMealDTO) => void
}

const DayRow = ({ day, date, dateStr, meals, onMealClick }: DayRowProps) => {
  // Hide the swap button for past days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayDate = new Date(dateStr)
  dayDate.setHours(0, 0, 0, 0)
  const isFutureDate = dayDate > today

  return (
    <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-[140px_1fr]'>
      <div className='flex flex-col justify-center rounded-md border-none bg-[#F5EFE7] p-4'>
        <h2 className='text-foreground text-sm font-semibold tracking-wide uppercase'>
          {day}
        </h2>
        <p className='text-foreground text-2xl font-semibold'>{date}</p>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {meals.map((item, index) =>
          item.meal ? (
            <MealCard
              key={`${dateStr}-${item.mealType}-${index}`}
              meal={item.meal}
              mealType={item.mealType}
              onMealClick={onMealClick}
              showSwapButton={isFutureDate}
            />
          ) : null
        )}
      </div>
    </div>
  )
}

export function WeekTable({
  weekPlan,
  monthHeader,
  onMealClick,
}: WeekTableProps) {
  return (
    <div className='space-y-4'>
      {/* Column headings for the meal categories */}
      <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-[140px_1fr] md:items-center'>
        <div className='hidden flex-col justify-center rounded-md bg-[#F5EFE7] px-5 py-4 text-slate-900 md:flex'>
          {monthHeader ? (
            <span className='text-lg leading-tight font-semibold'>
              {monthHeader.primary}
            </span>
          ) : null}
        </div>
        <div className='hidden grid-cols-3 gap-4 md:grid'>
          <div className='flex items-center justify-center rounded-md bg-[#C8E6C9] px-6 py-3 text-base font-semibold text-slate-900'>
            Śniadanie
          </div>
          <div className='flex items-center justify-center rounded-md bg-[#FFE082] px-6 py-3 text-base font-semibold text-slate-900'>
            Obiad
          </div>
          <div className='flex items-center justify-center rounded-md bg-[#FFAB91] px-6 py-3 text-base font-semibold text-slate-900'>
            Kolacja
          </div>
        </div>
      </div>

      {weekPlan.days.map((day) => {
        const meals = [
          { meal: day.breakfast, mealType: 'breakfast' as const },
          { meal: day.lunch, mealType: 'lunch' as const },
          { meal: day.dinner, mealType: 'dinner' as const },
        ]

        return (
          <DayRow
            key={day.date}
            day={day.dayName}
            date={String(day.dayNumber)}
            dateStr={day.date}
            meals={meals}
            onMealClick={onMealClick}
          />
        )
      })}
    </div>
  )
}
