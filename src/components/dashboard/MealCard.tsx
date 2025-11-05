'use client'

/**
 * MealCard component
 *
 * Vertical list style meal item with quick macro overview.
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
  BarChart3,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMealToggle } from '@/hooks/useMealToggle'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import { SwapRecipeDialog } from '@/components/shared/SwapRecipeDialog'
import { MacroSummaryRow } from '@/components/recipes/MacroSummaryRow'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MealCardProps {
  meal: PlannedMealDTO
  showSwapButton?: boolean // Kontrola widocznosci przycisku podmiany
  enableEatenCheckbox?: boolean // Kontrola mozliwosci zaznaczania jako zjedzone (tylko dzisiaj)
  onRecipePreview: (meal: PlannedMealDTO) => void
}

const DIFFICULTY_LABEL: Record<'easy' | 'medium' | 'hard', string> = {
  easy: 'Latwy',
  medium: 'Sredni',
  hard: 'Trudny',
}

const MEAL_BADGE_VARIANT: Record<
  PlannedMealDTO['meal_type'],
  'breakfast' | 'lunch' | 'dinner'
> = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
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
  return `${rounded} g`
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

  const handleToggle = (checked: boolean) => {
    toggleMeal({
      mealId: meal.id,
      isEaten: checked,
    })
  }

  // Oblicz wartości odżywcze z uwzględnieniem ingredient_overrides
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

  const macroItems = useMemo(
    () => [
      { icon: Wheat, text: formatValue(carbs, 'g') },
      { icon: Beef, text: formatValue(protein, 'g') },
      { icon: Droplet, text: formatValue(fats, 'g') },
    ],
    [carbs, protein, fats]
  )

  return (
    <>
      <div
        data-testid='meal-card'
        data-meal-type={meal.meal_type}
        className={cn(
          'focus-visible:ring-primary/40 cursor-pointer rounded-3xl border-0 bg-[var(--bg-card)] p-0 shadow-none transition-transform duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none',
          'hover:scale-[1.02] hover:shadow-[0_12px_28px_rgba(36,25,15,0.1)]',
          meal.is_eaten && 'bg-[#f4f8ea] ring-2 ring-[#c4e67f]',
          isPending && 'opacity-60'
        )}
        role='button'
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
      >
        <div className='flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5'>
          <div className='relative h-20 w-full overflow-hidden rounded-2xl bg-white/60 sm:h-24 sm:w-28 sm:flex-shrink-0'>
            {meal.recipe.image_url ? (
              <Image
                src={meal.recipe.image_url}
                alt={meal.recipe.name}
                fill
                className='object-cover'
                sizes='(max-width: 640px) 100vw, 112px'
              />
            ) : (
              <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                <UtensilsCrossed className='h-8 w-8' />
              </div>
            )}
          </div>

          <div className='flex w-full flex-1 flex-col gap-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge
                  variant={MEAL_BADGE_VARIANT[meal.meal_type]}
                  className='rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase'
                >
                  {MEAL_TYPE_LABELS[meal.meal_type]}
                </Badge>

                <div className='flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700'>
                  <Flame className='h-4 w-4 text-[#f5ac4b]' />
                  {formatValue(calories, 'kcal')}
                </div>

                <div className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600'>
                  <BarChart3 className='h-4 w-4 text-slate-500' />
                  {difficulty}
                </div>
              </div>

              {enableEatenCheckbox && (
                <label
                  className='text-muted-foreground flex items-center justify-end gap-2 text-xs font-medium'
                  onClick={(event) => event.stopPropagation()}
                >
                  Zjedzone
                  <Checkbox
                    id={`meal-${meal.id}`}
                    checked={meal.is_eaten}
                    disabled={isPending}
                    onCheckedChange={handleToggle}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Oznacz ${meal.recipe.name} jako zjedzony`}
                  />
                </label>
              )}
            </div>

            <h3
              data-testid='recipe-name'
              className='text-lg leading-tight font-semibold text-slate-900 sm:text-xl'
            >
              {meal.recipe.name}
            </h3>

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <MacroSummaryRow
                items={macroItems}
                className='bg-white px-3 py-1 text-slate-700'
              />

              <div className='ml-auto flex flex-wrap items-center gap-2'>
                {showSwapButton && (
                  <Button
                    variant='secondary'
                    size='sm'
                    className='rounded-full px-4 text-sm'
                    onClick={(event) => {
                      event.stopPropagation()
                      setSwapDialogOpen(true)
                    }}
                  >
                    <RefreshCw className='h-4 w-4' />
                    Zamień
                  </Button>
                )}
              </div>
            </div>

            {meal.ingredient_overrides &&
              meal.ingredient_overrides.some(
                (override) => !override.auto_adjusted
              ) && (
                <div className='text-xs font-semibold text-amber-600'>
                  Zmienione skladniki w tym posilku
                </div>
              )}
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
