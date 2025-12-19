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
  // Hide the swap button for past days (allow today and future)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayDate = new Date(dateStr)
  dayDate.setHours(0, 0, 0, 0)
  const isTodayOrFuture = dayDate >= today

  // Formatuj pełną datę
  const month = dayDate.toLocaleDateString('pl-PL', { month: 'long' })
  const year = dayDate.getFullYear()

  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-[80px_1fr_1fr_1fr]'>
      {/* Day Column - Red badge */}
      {/* Mobile/Tablet: full date info */}
      <div className='bg-primary flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-white shadow-sm xl:hidden'>
        <span className='font-semibold capitalize'>{day}</span>
        <span className='font-bold'>{date}</span>
        <span>{month}</span>
        <span className='text-sm opacity-80'>{year}</span>
      </div>
      {/* Desktop: compact day + date only, stacked vertically */}
      <div className='bg-primary hidden w-20 flex-col items-center justify-center rounded-md px-2 py-2 text-white shadow-sm xl:flex'>
        <span className='text-[10px] font-medium'>{day}</span>
        <span className='text-xl font-bold'>{date}</span>
      </div>

      {/* Meals */}
      {meals.map((item, index) => (
        <MealCard
          key={`${dateStr}-${item.mealType}-${index}`}
          meal={item.meal}
          mealType={item.mealType}
          onMealClick={onMealClick}
          showSwapButton={isTodayOrFuture}
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
      <div className='hidden gap-4 xl:grid xl:grid-cols-[80px_1fr_1fr_1fr]'>
        {/* Month header spacer - matches day column width */}
        <div className='flex w-20 flex-col items-center justify-center'>
          {monthHeader && (
            <>
              <span className='text-text-main text-sm font-bold'>
                {monthHeader.primary}
              </span>
              {monthHeader.secondary && (
                <span className='text-text-muted text-xs'>
                  {monthHeader.secondary}
                </span>
              )}
            </>
          )}
        </div>
        <h4 className='border-text-main bg-text-main rounded-[14px] border-2 px-3 py-1.5 text-center text-sm font-bold tracking-wider text-white uppercase shadow-sm'>
          Śniadanie
        </h4>
        <h4 className='border-text-main bg-text-main rounded-[14px] border-2 px-3 py-1.5 text-center text-sm font-bold tracking-wider text-white uppercase shadow-sm'>
          Obiad
        </h4>
        <h4 className='border-text-main bg-text-main rounded-[14px] border-2 px-3 py-1.5 text-center text-sm font-bold tracking-wider text-white uppercase shadow-sm'>
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
