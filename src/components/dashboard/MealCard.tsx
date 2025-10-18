/**
 * MealCard component
 *
 * Vertical list style meal item with quick macro overview.
 */

'use client'

import Image from 'next/image'
import { Flame, UtensilsCrossed } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useMealToggle } from '@/hooks/useMealToggle'
import { MEAL_TYPE_LABELS, formatMacro } from '@/types/recipes-view.types'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MealCardProps {
  meal: PlannedMealDTO
}

export function MealCard({ meal }: MealCardProps) {
  const { mutate: toggleMeal, isPending } = useMealToggle()

  const handleToggle = (checked: boolean) => {
    toggleMeal({
      mealId: meal.id,
      isEaten: checked,
    })
  }

  const calories = meal.recipe.total_calories ?? 0
  const protein = meal.recipe.total_protein_g ?? 0
  const carbs = meal.recipe.total_carbs_g ?? 0
  const fats = meal.recipe.total_fats_g ?? 0

  return (
    <div
      className={cn(
        'border-border/60 flex flex-col gap-4 rounded-3xl border bg-white p-4 shadow-sm transition-all hover:shadow-md',
        meal.is_eaten && 'border-[#a3d463] bg-[#f3f8e6]',
        isPending && 'opacity-60'
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant='secondary'
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase',
              meal.is_eaten
                ? 'text-foreground bg-[#c9ea84]'
                : 'bg-muted text-foreground'
            )}
          >
            {MEAL_TYPE_LABELS[meal.meal_type]}
          </Badge>

          <div className='text-foreground flex items-center gap-1 rounded-full bg-[#f3f0eb] px-3 py-1 text-xs font-semibold'>
            <Flame className='h-3.5 w-3.5 text-[#f5ac4b]' />
            {Math.round(calories)} kcal
          </div>
        </div>

        <label className='text-muted-foreground flex items-center gap-2 text-xs font-medium'>
          Zjedzone
          <Checkbox
            id={`meal-${meal.id}`}
            checked={meal.is_eaten}
            disabled={isPending}
            onCheckedChange={handleToggle}
            aria-label={`Oznacz ${meal.recipe.name} jako zjedzony`}
          />
        </label>
      </div>

      <div className='flex items-start gap-4'>
        <div className='bg-muted relative h-20 w-20 overflow-hidden rounded-2xl sm:h-24 sm:w-24'>
          {meal.recipe.image_url ? (
            <Image
              src={meal.recipe.image_url}
              alt={meal.recipe.name}
              fill
              className='object-cover'
              sizes='96px'
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
              <UtensilsCrossed className='h-8 w-8' />
            </div>
          )}
        </div>

        <div className='flex flex-1 flex-col gap-3'>
          <h3 className='text-foreground text-base leading-tight font-semibold sm:text-lg'>
            {meal.recipe.name}
          </h3>

          <div className='text-muted-foreground flex flex-wrap items-center gap-5 text-xs sm:text-sm'>
            <span>
              <span className='text-foreground font-semibold'>C</span>{' '}
              {formatMacro(carbs, 'g')}
            </span>
            <span>
              <span className='text-foreground font-semibold'>P</span>{' '}
              {formatMacro(protein, 'g')}
            </span>
            <span>
              <span className='text-foreground font-semibold'>F</span>{' '}
              {formatMacro(fats, 'g')}
            </span>
          </div>
        </div>
      </div>

      {meal.ingredient_overrides && (
        <div className='text-xs font-medium text-amber-600'>
          Zmienione skladniki w tym posilku
        </div>
      )}
    </div>
  )
}
