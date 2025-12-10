'use client'

/**
 * MealCard component
 *
 * Glassmorphism style meal card with stepper design.
 */

import { useMemo, useState } from 'react'
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
import { SwapRecipeDialog } from '@/components/shared/SwapRecipeDialog'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MealCardProps {
  meal: PlannedMealDTO
  showSwapButton?: boolean
  enableEatenCheckbox?: boolean
  onRecipePreview: (meal: PlannedMealDTO) => void
}

const DIFFICULTY_LABEL: Record<'easy' | 'medium' | 'hard', string> = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
}

const getDifficultyColor = (difficulty: string | undefined) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-green-500'
    case 'medium':
      return 'bg-orange-500'
    case 'hard':
      return 'bg-red-600'
    default:
      return 'bg-gray-300'
  }
}

const formatValue = (
  value: number | null | undefined,
  unit: 'kcal' | 'g'
): string => {
  if (value === null || value === undefined) {
    return '--'
  }

  if (unit === 'kcal') {
    return `${Math.round(value)} kcal`
  }

  const rounded = Number(value.toFixed(1))
  return `${rounded}g`
}

export function MealCard({
  meal,
  showSwapButton = false,
  enableEatenCheckbox = true,
  onRecipePreview,
}: MealCardProps) {
  const [swapDialogOpen, setSwapDialogOpen] = useState(false)
  const { mutate: toggleMeal, isPending } = useMealToggle()

  const handleCardClick = () => {
    onRecipePreview(meal)
  }

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
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
  const carbs = nutrition.carbs_g
  const fats = nutrition.fats_g

  const difficultyKey = (meal.recipe.difficulty_level ??
    'medium') as keyof typeof DIFFICULTY_LABEL
  const difficulty = DIFFICULTY_LABEL[difficultyKey]

  return (
    <>
      <div className='relative z-10'>
        <div className='flex gap-3 sm:gap-6'>
          {/* Stepper Node */}
          {enableEatenCheckbox && (
            <div
              className='group flex cursor-pointer flex-col items-center gap-1'
              onClick={(e) => {
                e.stopPropagation()
                handleToggle()
              }}
            >
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-300 sm:h-10 sm:w-10',
                  meal.is_eaten
                    ? 'border-red-600 bg-red-600'
                    : 'border-white bg-white group-hover:border-red-400',
                  isPending && 'pointer-events-none'
                )}
              >
                {meal.is_eaten && (
                  <Check
                    className='h-3.5 w-3.5 text-white sm:h-5 sm:w-5'
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
              <h4 className='text-base font-bold tracking-wider text-gray-800 uppercase sm:text-lg'>
                {MEAL_TYPE_LABELS[meal.meal_type]}
              </h4>
            </div>

            {/* Meal Card */}
            <div
              data-testid='meal-card'
              data-meal-type={meal.meal_type}
              className='group mt-3 flex cursor-pointer flex-col gap-6 rounded-md border-2 border-white bg-white/40 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01] sm:rounded-2xl md:flex-row'
              role='button'
              tabIndex={0}
              onClick={handleCardClick}
              onKeyDown={handleCardKeyDown}
            >
              <div className='relative h-32 w-full flex-shrink-0 overflow-hidden rounded-md bg-white/60 md:w-32'>
                {meal.recipe.image_url ? (
                  <Image
                    src={meal.recipe.image_url}
                    alt={meal.recipe.name}
                    fill
                    className='object-cover grayscale-[10%]'
                    sizes='(max-width: 768px) 100vw, 128px'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center text-gray-400'>
                    <UtensilsCrossed className='h-10 w-10' />
                  </div>
                )}
                {/* Swap button on image */}
                {showSwapButton && (
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={(e) => {
                      e.stopPropagation()
                      setSwapDialogOpen(true)
                    }}
                    aria-label='Zmień przepis'
                    className='absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-500 opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:bg-white hover:text-red-600'
                  >
                    <RefreshCw className='h-5 w-5' />
                  </Button>
                )}
              </div>

              <div className='flex flex-1 flex-col justify-center'>
                <div className='mb-3 flex flex-wrap items-center gap-2'>
                  {/* Calories Badge */}
                  <div className='flex items-center gap-1.5 rounded-sm bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm shadow-red-500/20'>
                    <Flame className='h-3.5 w-3.5' />{' '}
                    {formatValue(calories, 'kcal')}
                  </div>

                  {/* Difficulty Badge */}
                  <div className='hidden items-center gap-1.5 rounded-sm border border-white bg-white px-2.5 py-1 text-xs font-bold tracking-wider text-gray-800 uppercase sm:flex'>
                    <span
                      className={`h-3 w-1 rounded-full ${getDifficultyColor(meal.recipe.difficulty_level)}`}
                    />
                    {difficulty}
                  </div>
                </div>

                <h3
                  data-testid='recipe-name'
                  className='mb-4 text-lg leading-tight font-bold text-gray-800'
                >
                  {meal.recipe.name}
                </h3>

                <div className='flex flex-wrap items-center gap-6 text-sm font-medium text-black'>
                  {/* Carbs */}
                  <div className='flex items-center gap-2' title='Węglowodany'>
                    <Wheat className='h-5 w-5 text-gray-900' />
                    <span className='font-bold text-gray-700'>
                      {formatValue(carbs, 'g')}
                    </span>
                  </div>

                  {/* Protein */}
                  <div className='flex items-center gap-2' title='Białko'>
                    <Beef className='h-5 w-5 text-gray-900' />
                    <span className='font-bold text-gray-700'>
                      {formatValue(protein, 'g')}
                    </span>
                  </div>

                  {/* Fat */}
                  <div className='flex items-center gap-2' title='Tłuszcze'>
                    <Droplet className='h-5 w-5 text-gray-900' />
                    <span className='font-bold text-gray-700'>
                      {formatValue(fats, 'g')}
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

      <SwapRecipeDialog
        meal={meal}
        open={swapDialogOpen}
        onOpenChange={setSwapDialogOpen}
      />
    </>
  )
}
