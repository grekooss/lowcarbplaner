'use client'

/**
 * MealCard - Karta posiłku w widoku mobile
 * Bardziej rozbudowana niż MealCell - więcej informacji i przestrzeni
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { UtensilsCrossed } from 'lucide-react'
import type { PlannedMealDTO } from '@/types/dto.types'
import { MEAL_TYPE_LABELS } from '@/types/meal-plan-view.types'

interface MealCardProps {
  meal: PlannedMealDTO | null
  mealType: 'breakfast' | 'lunch' | 'dinner'
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}

export const MealCard = ({
  meal,
  mealType,
  onMealClick,
  onSwapClick,
}: MealCardProps) => {
  // Pusta karta gdy brak posiłku
  if (!meal) {
    return (
      <Card className='bg-muted/30'>
        <CardContent className='p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <Badge variant='secondary'>{MEAL_TYPE_LABELS[mealType]}</Badge>
          </div>
          <div className='text-muted-foreground flex h-24 items-center justify-center'>
            <span className='text-sm'>Brak posiłku</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardContent className='p-4'>
        {/* Header z typem posiłku */}
        <div className='mb-3 flex items-center justify-between'>
          <Badge variant='default'>{MEAL_TYPE_LABELS[mealType]}</Badge>
        </div>

        <div className='flex gap-4'>
          {/* Image */}
          <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg'>
            {meal.recipe.image_url ? (
              <Image
                src={meal.recipe.image_url}
                alt={meal.recipe.name}
                fill
                className='object-cover'
                sizes='100px'
              />
            ) : (
              <div className='bg-muted flex h-full w-full items-center justify-center'>
                <UtensilsCrossed className='text-muted-foreground h-8 w-8' />
              </div>
            )}
          </div>

          {/* Content */}
          <div className='min-w-0 flex-1'>
            <h4 className='mb-2 line-clamp-2 text-sm font-semibold'>
              {meal.recipe.name}
            </h4>

            {/* Makro summary */}
            <div className='text-muted-foreground mb-3 flex flex-wrap gap-x-3 gap-y-1 text-xs'>
              <span className='font-medium'>
                {meal.recipe.total_calories || 0} kcal
              </span>
              <span>B: {meal.recipe.total_protein_g || 0}g</span>
              <span>W: {meal.recipe.total_carbs_g || 0}g</span>
              <span>T: {meal.recipe.total_fats_g || 0}g</span>
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => onMealClick(meal)}
                className='flex-1'
              >
                Zobacz przepis
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onSwapClick(meal.id, meal.meal_type)}
              >
                Zmień
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
