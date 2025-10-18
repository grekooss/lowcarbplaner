/**
 * WeekTable - desktop week view for the meal plan.
 * Builds a grid with colored day column and meal pills similar to the reference UI.
 */

'use client'

import { cn } from '@/lib/utils'
import type { WeekPlanViewModel } from '@/types/meal-plan-view.types'
import type { PlannedMealDTO } from '@/types/dto.types'
import { MEAL_TYPE_LABELS } from '@/types/meal-plan-view.types'
import { MealCell, type MealCellStyle } from './MealCell'

interface WeekTableProps {
  weekPlan: WeekPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}

const mealTypes: ('breakfast' | 'lunch' | 'dinner')[] = [
  'breakfast',
  'lunch',
  'dinner',
]

const mealTypeStyles: Record<
  (typeof mealTypes)[number],
  MealCellStyle & { headerBg: string; headerText: string }
> = {
  breakfast: {
    headerBg: 'bg-[#c9ea84]',
    headerText: 'text-[#304b17]',
    cellBg: 'bg-[#f3f8e6]',
    border: 'border-[#d9eeb2]',
    pillBg: 'bg-[#e3f8b5]',
    imageBorder: 'border-[#d2eca0]',
  },
  lunch: {
    headerBg: 'bg-[#f9d37d]',
    headerText: 'text-[#6b4600]',
    cellBg: 'bg-[#fef1d7]',
    border: 'border-[#f3d099]',
    pillBg: 'bg-[#fde7b8]',
    imageBorder: 'border-[#f2cfa1]',
  },
  dinner: {
    headerBg: 'bg-[#d9d7d4]',
    headerText: 'text-[#3e3a37]',
    cellBg: 'bg-[#f4f2f1]',
    border: 'border-[#e2dedb]',
    pillBg: 'bg-[#ece9e6]',
    imageBorder: 'border-[#d8d3ce]',
  },
}

export function WeekTable({
  weekPlan,
  onMealClick,
  onSwapClick,
}: WeekTableProps) {
  return (
    <div className='overflow-x-auto pb-6'>
      <div className='min-w-[980px] space-y-4'>
        <div className='grid grid-cols-[180px_repeat(3,minmax(0,1fr))] gap-3 px-2'>
          <div className='text-muted-foreground rounded-full px-6 py-3 text-center text-sm font-semibold tracking-wide uppercase'>
            Tydzien
          </div>

          {mealTypes.map((mealType) => (
            <div
              key={`header-${mealType}`}
              className={cn(
                'rounded-full px-6 py-3 text-center text-sm font-semibold tracking-wide uppercase shadow-sm',
                mealTypeStyles[mealType].headerBg,
                mealTypeStyles[mealType].headerText
              )}
            >
              {MEAL_TYPE_LABELS[mealType]}
            </div>
          ))}
        </div>

        <div className='space-y-3 px-2'>
          {weekPlan.days.map((day) => (
            <div
              key={day.date}
              className='grid grid-cols-[180px_repeat(3,minmax(0,1fr))] gap-3'
            >
              <div className='rounded-3xl bg-[#faefe3] px-5 py-4 text-[#5f3625] shadow-sm'>
                <p className='text-sm font-semibold'>{day.dayName}</p>
                <p className='text-xs opacity-80'>
                  {day.dayNumber} {day.monthName}
                </p>
                {day.isToday && (
                  <span className='mt-3 inline-flex items-center justify-center rounded-full bg-[#c9ea84] px-3 py-1 text-[10px] font-semibold text-[#304b17] uppercase'>
                    Dzisiaj
                  </span>
                )}
              </div>

              {mealTypes.map((mealType) => (
                <MealCell
                  key={`${day.date}-${mealType}`}
                  mealType={mealType}
                  meal={day[mealType]}
                  onMealClick={onMealClick}
                  onSwapClick={onSwapClick}
                  style={mealTypeStyles[mealType]}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
