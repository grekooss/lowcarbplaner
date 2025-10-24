'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UtensilsCrossed, RefreshCw } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SwapRecipeDialog } from '@/components/shared/SwapRecipeDialog'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MealCardProps {
  meal: PlannedMealDTO | null
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner'
  onMealClick: (meal: PlannedMealDTO) => void
  showSwapButton?: boolean // Kontrola widocznosci przycisku podmiany
}

const mealTheme = {
  breakfast: {
    bg: 'bg-breakfast',
    text: 'text-breakfast-foreground',
  },
  lunch: {
    bg: 'bg-lunch',
    text: 'text-lunch-foreground',
  },
  snack: {
    bg: 'bg-snack',
    text: 'text-snack-foreground',
  },
  dinner: {
    bg: 'bg-dinner',
    text: 'text-dinner-foreground',
  },
} as const

export const MealCard = ({
  meal,
  mealType,
  onMealClick,
  showSwapButton = false,
}: MealCardProps) => {
  const [swapDialogOpen, setSwapDialogOpen] = useState(false)
  const theme = mealTheme[mealType]

  if (!meal) {
    return null
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onMealClick(meal)
  }

  return (
    <>
      <Card
        className={cn(
          'min-h-[104px] cursor-pointer overflow-hidden rounded-md border-0 p-0 transition-transform hover:scale-105 hover:shadow-lg',
          theme.bg
        )}
        onClick={handleCardClick}
      >
        <div className='relative flex h-full flex-col'>
          {showSwapButton && (
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={(e) => {
                e.stopPropagation()
                setSwapDialogOpen(true)
              }}
              aria-label='Zmien przepis'
              className='absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/80 text-slate-700 shadow-sm transition-all hover:-translate-y-px hover:bg-white hover:text-slate-900 hover:shadow-md'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
          )}

          <div className='flex flex-1 items-stretch'>
            <div className='relative w-26 flex-shrink-0 overflow-hidden rounded-md bg-white'>
              {meal.recipe.image_url ? (
                <Image
                  src={meal.recipe.image_url}
                  alt={meal.recipe.name}
                  fill
                  className='object-cover'
                  sizes='96px'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center'>
                  <UtensilsCrossed className='text-muted-foreground h-8 w-8' />
                </div>
              )}
            </div>
            <div className='flex min-h-[66px] flex-1 items-center p-3 pr-10'>
              <h3
                className={cn(
                  'line-clamp-3 text-base leading-tight font-medium',
                  theme.text
                )}
              >
                {meal.recipe.name}
              </h3>
            </div>
          </div>
        </div>
      </Card>

      <SwapRecipeDialog
        meal={meal}
        open={swapDialogOpen}
        onOpenChange={setSwapDialogOpen}
      />
    </>
  )
}
