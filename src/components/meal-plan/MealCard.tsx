'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'
import type { PlannedMealDTO } from '@/types/dto.types'
import Image from 'next/image'

interface MealCardProps {
  meal: PlannedMealDTO | null
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner'
  onMealClick: (meal: PlannedMealDTO) => void
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

export const MealCard = ({ meal, mealType, onMealClick }: MealCardProps) => {
  const theme = mealTheme[mealType]

  if (!meal) {
    return null
  }

  return (
    <Card
      className={cn(
        'cursor-pointer overflow-hidden border-0 p-0 transition-transform hover:scale-105 hover:shadow-lg',
        theme.bg
      )}
      onClick={() => onMealClick(meal)}
    >
      <div className='flex h-full items-stretch'>
        <div className='relative w-24 flex-shrink-0 overflow-hidden rounded-r-xl bg-white'>
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
        <div className='flex flex-1 items-center p-4'>
          <h3 className={cn('text-base font-medium', theme.text)}>
            {meal.recipe.name}
          </h3>
        </div>
      </div>
    </Card>
  )
}
