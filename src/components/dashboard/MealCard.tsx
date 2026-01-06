'use client'

/**
 * MealCard component
 *
 * Glassmorphism style meal card with stepper design.
 */

import { memo, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Flame,
  Wheat,
  Beef,
  Droplet,
  RefreshCw,
  UtensilsCrossed,
  Check,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMealToggle } from '@/hooks/useMealToggle'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import { LazySwapRecipeDialog } from '@/components/shared/lazy-modals'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MealCardProps {
  meal: PlannedMealDTO
  showSwapButton?: boolean
  enableEatenCheckbox?: boolean
  onRecipePreview: (meal: PlannedMealDTO) => void
  mealTime?: string // Format HH:MM, np. "07:00"
  /** Indeks karty w liście - używany do optymalizacji LCP (priority dla pierwszej) */
  index?: number
}

const DIFFICULTY_LABEL: Record<'easy' | 'medium' | 'hard', string> = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
}

const getDifficultyColor = (difficulty: string | undefined) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-success'
    case 'medium':
      return 'bg-tertiary'
    case 'hard':
      return 'bg-primary'
    default:
      return 'bg-text-muted'
  }
}

const formatNumber = (
  value: number | null | undefined,
  unit: 'kcal' | 'g'
): string => {
  if (value === null || value === undefined) {
    return '—'
  }

  if (unit === 'kcal') {
    return String(Math.round(value))
  }

  return String(Number(value.toFixed(1)))
}

export const MealCard = memo(function MealCard({
  meal,
  showSwapButton = false,
  enableEatenCheckbox = true,
  onRecipePreview,
  mealTime,
  index,
}: MealCardProps) {
  const [swapDialogOpen, setSwapDialogOpen] = useState(false)
  const { mutate: toggleMeal, isPending } = useMealToggle()

  const handleCardClick = () => {
    // Blokuj kliknięcie dla zjedzonych posiłków
    if (meal.is_eaten) return
    onRecipePreview(meal)
  }

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      // Blokuj klawiaturę dla zjedzonych posiłków
      if (meal.is_eaten) return
      onRecipePreview(meal)
    }
  }

  const handleToggle = () => {
    toggleMeal({
      mealId: meal.id,
      isEaten: !meal.is_eaten,
    })
  }

  const nutrition = useMemo(
    () =>
      calculateRecipeNutritionWithOverrides(
        meal.recipe,
        meal.ingredient_overrides
      ),
    [meal.recipe, meal.ingredient_overrides]
  )

  const calories = nutrition.calories
  const protein = nutrition.protein_g
  const netCarbs = nutrition.net_carbs_g
  const fats = nutrition.fats_g

  const difficultyKey = (meal.recipe.difficulty_level ??
    'medium') as keyof typeof DIFFICULTY_LABEL
  const difficulty = DIFFICULTY_LABEL[difficultyKey]

  return (
    <>
      <div className='relative z-10'>
        <div className='flex gap-3 sm:gap-4'>
          {/* Meal Time - left of checkbox */}
          {mealTime && (
            <div className='flex h-7 w-12 items-center justify-end sm:h-10 sm:w-14'>
              <span className='text-sm font-bold text-gray-600 sm:text-base'>
                {mealTime}
              </span>
            </div>
          )}

          {/* Stepper Node */}
          {enableEatenCheckbox && (
            <div
              className='group flex h-7 cursor-pointer items-center sm:h-10'
              onClick={(e) => {
                e.stopPropagation()
                handleToggle()
              }}
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-300 sm:h-8 sm:w-8',
                  meal.is_eaten
                    ? 'border-primary bg-primary'
                    : 'group-hover:border-primary/40 border-white bg-white',
                  isPending && 'pointer-events-none'
                )}
              >
                {meal.is_eaten && (
                  <Check
                    className='h-3 w-3 text-white sm:h-4 sm:w-4'
                    strokeWidth={3}
                  />
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className='flex-1'>
            {/* Stepper Label */}
            <div className='mb-0 flex h-7 items-center gap-3 sm:h-10'>
              <h4
                className={cn(
                  'text-base font-bold tracking-wider text-gray-800 uppercase transition-all duration-300 sm:text-lg',
                  meal.is_eaten && 'opacity-60 grayscale-[40%]'
                )}
              >
                {MEAL_TYPE_LABELS[meal.meal_type]}
              </h4>
            </div>

            {/* Meal Card */}
            <div
              data-testid='meal-card'
              data-meal-type={meal.meal_type}
              className={cn(
                'group mt-2 flex flex-col gap-4 rounded-md border-2 border-white bg-white/40 p-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 sm:rounded-xl md:flex-row',
                meal.is_eaten
                  ? 'pointer-events-none opacity-60 grayscale-[40%]'
                  : 'cursor-pointer hover:scale-[1.01]'
              )}
              role='button'
              tabIndex={meal.is_eaten ? -1 : 0}
              onClick={handleCardClick}
              onKeyDown={handleCardKeyDown}
            >
              <div className='relative h-24 w-full flex-shrink-0 overflow-hidden rounded-md bg-white/60 md:h-24 md:w-24'>
                {meal.recipe.image_url ? (
                  <Image
                    src={meal.recipe.image_url}
                    alt={meal.recipe.name}
                    fill
                    className='object-cover grayscale-[10%]'
                    sizes='(max-width: 768px) 100vw, 96px'
                    priority={index === 0}
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center text-gray-400'>
                    <UtensilsCrossed className='h-8 w-8' />
                  </div>
                )}
                {/* Swap button on image - top-right on mobile, center on desktop */}
                {/* Ukryj przycisk swap dla zjedzonych posiłków */}
                {showSwapButton && !meal.is_eaten && (
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={(e) => {
                      e.stopPropagation()
                      setSwapDialogOpen(true)
                    }}
                    aria-label='Zmień przepis'
                    className='text-text-secondary hover:text-primary absolute top-1 right-1 h-8 w-8 rounded-full bg-white/90 p-1.5 shadow-md transition-all hover:bg-white md:top-1/2 md:right-auto md:left-1/2 md:h-10 md:w-10 md:-translate-x-1/2 md:-translate-y-1/2 md:p-2 md:opacity-0 md:group-hover:opacity-100'
                  >
                    <RefreshCw className='h-5 w-5' />
                  </Button>
                )}
              </div>

              <div className='flex flex-1 flex-col justify-center'>
                <div className='mb-3 flex flex-wrap items-center gap-2'>
                  {/* Calories Badge */}
                  <div className='bg-primary shadow-primary/20 flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs text-white shadow-sm'>
                    <Flame className='h-3.5 w-3.5' />{' '}
                    <span className='font-bold'>
                      {formatNumber(calories, 'kcal')}
                    </span>{' '}
                    kcal
                  </div>

                  {/* Difficulty Badge */}
                  <div className='flex items-center gap-1.5 rounded-sm border border-white bg-white px-2.5 py-1 text-xs font-bold tracking-wider text-gray-800 uppercase'>
                    <span
                      className={`h-3 w-1 rounded-full ${getDifficultyColor(meal.recipe.difficulty_level)}`}
                    />
                    {difficulty}
                  </div>
                </div>

                <h3
                  data-testid='recipe-name'
                  className='mb-4 text-base leading-tight font-bold text-gray-800 sm:text-lg'
                >
                  {meal.recipe.name}
                </h3>

                <div className='flex flex-wrap items-center justify-center gap-4 text-sm text-black md:justify-start'>
                  {/* Fat */}
                  <div className='flex items-center gap-1.5' title='Tłuszcze'>
                    <Droplet className='text-success h-5 w-5' />
                    <span className='flex items-baseline gap-0.5 text-gray-700'>
                      <span className='font-bold'>
                        {formatNumber(fats, 'g')}
                      </span>
                      <span>g</span>
                    </span>
                  </div>

                  {/* Net Carbs */}
                  <div
                    className='flex items-center gap-1.5'
                    title='Węglowodany netto (Net Carbs)'
                  >
                    <Wheat className='text-tertiary h-5 w-5' />
                    <span className='flex items-baseline gap-0.5 text-gray-700'>
                      <span className='font-bold'>
                        {formatNumber(netCarbs, 'g')}
                      </span>
                      <span>g</span>
                    </span>
                  </div>

                  {/* Protein */}
                  <div className='flex items-center gap-1.5' title='Białko'>
                    <Beef className='text-info h-5 w-5' />
                    <span className='flex items-baseline gap-0.5 text-gray-700'>
                      <span className='font-bold'>
                        {formatNumber(protein, 'g')}
                      </span>
                      <span>g</span>
                    </span>
                  </div>
                </div>

                {meal.ingredient_overrides &&
                  meal.ingredient_overrides.some(
                    (override) => !override.auto_adjusted
                  ) && (
                    <div className='mt-3 text-xs font-semibold text-[var(--primary)]'>
                      Zmienione składniki w tym posiłku
                    </div>
                  )}
              </div>
            </div>
          </div>
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
