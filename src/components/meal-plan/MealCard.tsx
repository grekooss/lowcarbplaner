'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { UtensilsCrossed, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LazySwapRecipeDialog } from '@/components/shared/lazy-modals'
import type { PlannedMealDTO } from '@/types/dto.types'
import type { MealType } from '@/types/meal-plan-view.types'
import { MEAL_TYPE_LABELS } from '@/types/meal-plan-view.types'

interface MealCardProps {
  meal: PlannedMealDTO | null
  mealType: MealType
  onMealClick: (meal: PlannedMealDTO) => void
  showSwapButton?: boolean
  columnCount?: number
}

export const MealCard = memo(function MealCard({
  meal,
  mealType,
  onMealClick,
  showSwapButton = false,
  columnCount = 3,
}: MealCardProps) {
  const [swapDialogOpen, setSwapDialogOpen] = useState(false)

  // Empty state - show placeholder
  if (!meal) {
    return (
      <div className='group relative flex h-[72px] cursor-pointer items-center gap-3 rounded-md border-2 border-white bg-white/40 px-3 py-2 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.01]'>
        <div className='text-text-disabled flex h-full flex-1 flex-col items-center justify-center'>
          <div className='border-border text-text-disabled group-hover:border-primary/60 group-hover:text-primary/60 mb-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed text-xs transition-colors'>
            +
          </div>
          <span className='text-text-disabled group-hover:text-primary/60 text-[9px] font-bold tracking-wider uppercase transition-colors'>
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
    // Blokuj kliknięcie dla zjedzonych posiłków
    if (meal.is_eaten) return
    onMealClick(meal)
  }

  return (
    <>
      <div
        className={cn(
          'group relative flex h-[72px] items-center gap-3 rounded-md border-2 border-white bg-white/40 px-3 py-2 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300',
          meal.is_eaten
            ? 'pointer-events-none opacity-60 grayscale-[40%]'
            : 'cursor-pointer hover:scale-[1.01]'
        )}
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
            <div className='text-text-muted flex h-full w-full items-center justify-center'>
              <UtensilsCrossed className='h-6 w-6' />
            </div>
          )}
          {/* Swap button on image - center on mobile, hover-reveal on desktop */}
          {/* Ukryj przycisk swap dla zjedzonych posiłków */}
          {showSwapButton && !meal.is_eaten && (
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={(e) => {
                e.stopPropagation()
                setSwapDialogOpen(true)
              }}
              aria-label='Zmień przepis'
              className='text-text-secondary hover:text-primary absolute top-1/2 left-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 p-1 shadow-md transition-all hover:bg-white xl:bg-white/90 xl:opacity-0 xl:group-hover:opacity-100 [&_svg]:size-3.5 xl:[&_svg]:size-4'
            >
              <RefreshCw />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className='min-w-0 flex-1'>
          {/* Mobile meal type label */}
          <span className='text-text-muted mb-0.5 block text-[9px] font-bold tracking-wider uppercase xl:hidden'>
            {MEAL_TYPE_LABELS[mealType]}
          </span>
          <p
            className={cn(
              'text-text-main line-clamp-3 leading-snug font-semibold',
              columnCount >= 5 ? 'text-xs' : 'text-sm'
            )}
          >
            {meal.recipe.name}
          </p>
        </div>
      </div>

      <LazySwapRecipeDialog
        meal={meal}
        open={swapDialogOpen}
        onOpenChange={setSwapDialogOpen}
      />
    </>
  )
})
