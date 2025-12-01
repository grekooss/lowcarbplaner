/**
 * WeekTable - desktop week view for the meal plan.
 * Displays week plan as vertical rows with day cards and meal cards.
 * Design based on Gemini Design system with glassmorphism.
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
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-[110px_1fr_1fr_1fr]'>
      {/* Day Column - Red badge */}
      <div className='flex h-[72px] flex-col items-center justify-center rounded-md border-2 border-red-600 bg-red-600 p-3 text-center shadow-lg shadow-red-500/30'>
        <span className='mb-1 text-[10px] font-bold tracking-wider text-white/80 uppercase'>
          {day}
        </span>
        <span className='text-2xl font-bold text-white'>{date}</span>
      </div>

      {/* Meals */}
      {meals.map((item, index) => (
        <MealCard
          key={`${dateStr}-${item.mealType}-${index}`}
          meal={item.meal}
          mealType={item.mealType}
          onMealClick={onMealClick}
          showSwapButton={isFutureDate}
        />
      ))}
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
      {/* Column Headers (Desktop) */}
      <div className='hidden gap-4 px-1 xl:grid xl:grid-cols-[110px_1fr_1fr_1fr]'>
        {/* Month header spacer */}
        <div className='flex flex-col items-center justify-center'>
          {monthHeader && (
            <>
              <span className='text-sm font-bold text-gray-900'>
                {monthHeader.primary}
              </span>
              {monthHeader.secondary && (
                <span className='text-xs text-gray-500'>
                  {monthHeader.secondary}
                </span>
              )}
            </>
          )}
        </div>
        <h4 className='rounded-[14px] border-2 border-gray-900 bg-gray-900 px-3 py-1.5 text-center text-sm font-bold tracking-wider text-white uppercase shadow-sm'>
          Śniadanie
        </h4>
        <h4 className='rounded-[14px] border-2 border-gray-900 bg-gray-900 px-3 py-1.5 text-center text-sm font-bold tracking-wider text-white uppercase shadow-sm'>
          Obiad
        </h4>
        <h4 className='rounded-[14px] border-2 border-gray-900 bg-gray-900 px-3 py-1.5 text-center text-sm font-bold tracking-wider text-white uppercase shadow-sm'>
          Kolacja
        </h4>
      </div>

      <div className='space-y-4'>
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
    </div>
  )
}
