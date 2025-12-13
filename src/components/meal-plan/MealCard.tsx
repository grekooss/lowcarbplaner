'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UtensilsCrossed, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SwapRecipeDialog } from '@/components/shared/SwapRecipeDialog'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MealCardProps {
  meal: PlannedMealDTO | null
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner'
  onMealClick: (meal: PlannedMealDTO) => void
  showSwapButton?: boolean
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  snack: 'Przekąska',
  dinner: 'Kolacja',
}

export const MealCard = ({
  meal,
  mealType,
  onMealClick,
  showSwapButton = false,
}: MealCardProps) => {
  const [swapDialogOpen, setSwapDialogOpen] = useState(false)

  // Empty state - show placeholder
  if (!meal) {
    return (
      <div className='group relative flex h-[72px] cursor-pointer items-center gap-3 rounded-md border-2 border-white bg-white/40 px-3 py-2 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.01]'>
        <div className='flex h-full flex-1 flex-col items-center justify-center text-gray-300'>
          <div className='mb-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-gray-200 text-xs text-gray-300 transition-colors group-hover:border-red-400 group-hover:text-red-400'>
            +
          </div>
          <span className='text-[9px] font-bold tracking-wider text-gray-300 uppercase transition-colors group-hover:text-red-400'>
            Dodaj
          </span>
        </div>
      </div>
    )
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onMealClick(meal)
  }

  return (
    <>
      <div
        className='group relative flex h-[72px] cursor-pointer items-center gap-3 rounded-md border-2 border-white bg-white/40 px-3 py-2 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.01]'
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className='relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-white/60'>
          {meal.recipe.image_url ? (
            <Image
              src={meal.recipe.image_url}
              alt={meal.recipe.name}
              fill
              className='object-cover grayscale-[10%]'
              sizes='56px'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-gray-400'>
              <UtensilsCrossed className='h-6 w-6' />
            </div>
          )}
          {/* Swap button on image - center on mobile, hover-reveal on desktop */}
          {showSwapButton && (
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={(e) => {
                e.stopPropagation()
                setSwapDialogOpen(true)
              }}
              aria-label='Zmień przepis'
              className='absolute top-1/2 left-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 p-1 text-gray-600 shadow-md transition-all hover:bg-white hover:text-red-600 xl:bg-white/90 xl:opacity-0 xl:group-hover:opacity-100 [&_svg]:size-3.5 xl:[&_svg]:size-4'
            >
              <RefreshCw />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className='min-w-0 flex-1'>
          {/* Mobile meal type label */}
          <span className='mb-0.5 block text-[9px] font-bold tracking-wider text-gray-400 uppercase xl:hidden'>
            {mealTypeLabels[mealType]}
          </span>
          <p className='line-clamp-3 text-sm leading-snug font-semibold text-gray-800'>
            {meal.recipe.name}
          </p>
        </div>
      </div>

      <SwapRecipeDialog
        meal={meal}
        open={swapDialogOpen}
        onOpenChange={setSwapDialogOpen}
      />
    </>
  )
}
