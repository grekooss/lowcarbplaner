/**
 * MealCell - single meal entry inside the desktop week plan.
 * Matches the pill layout shown in the reference UI (image on the left, text on the right).
 */

'use client'

import type { KeyboardEvent, MouseEvent } from 'react'
import Image from 'next/image'
import { UtensilsCrossed } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { PlannedMealDTO } from '@/types/dto.types'

export interface MealCellStyle {
  cellBg: string
  border: string
  pillBg: string
  imageBorder: string
}

interface MealCellProps {
  meal: PlannedMealDTO | null
  mealType: 'breakfast' | 'lunch' | 'dinner'
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
  style: MealCellStyle
}

export function MealCell({
  meal,
  mealType,
  onMealClick,
  onSwapClick,
  style,
}: MealCellProps) {
  const handleActivate = () => {
    if (meal) {
      onMealClick(meal)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleActivate()
    }
  }

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (meal) {
      onSwapClick(meal.id, mealType)
    }
  }

  if (!meal) {
    return (
      <div className='p-2'>
        <div
          className={cn(
            'text-muted-foreground flex min-h-[120px] items-center justify-center rounded-3xl border-2 border-dashed text-sm font-semibold',
            style.cellBg,
            style.border
          )}
        >
          Brak posilku
        </div>
      </div>
    )
  }

  return (
    <div className='p-2'>
      <div
        role='button'
        tabIndex={0}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
        className={cn(
          'group focus-visible:ring-primary flex min-h-[110px] items-stretch overflow-hidden rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          style.pillBg
        )}
      >
        <div
          className={cn(
            'relative flex h-full w-24 shrink-0 items-center justify-center bg-white sm:w-28',
            'rounded-3xl rounded-r-none border-2',
            style.imageBorder
          )}
        >
          {meal.recipe.image_url ? (
            <Image
              src={meal.recipe.image_url}
              alt={meal.recipe.name}
              fill
              className='object-cover'
              sizes='112px'
            />
          ) : (
            <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
              <UtensilsCrossed className='h-8 w-8' />
            </div>
          )}
        </div>

        <div className='flex flex-1 items-center px-4 py-3'>
          <h4 className='text-foreground line-clamp-2 w-full text-sm leading-snug font-semibold sm:text-base'>
            {meal.recipe.name}
          </h4>
        </div>
      </div>
    </div>
  )
}
