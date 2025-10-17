/**
 * Komponent karty pojedynczego posiłku
 *
 * Wyświetla szczegóły posiłku z checkboxem do oznaczania jako zjedzony.
 * Wzorowany na RecipeCard.tsx z dodatkową funkcjonalnością śledzenia.
 */

'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { MEAL_TYPE_LABELS, formatMacro } from '@/types/recipes-view.types'
import { useMealToggle } from '@/hooks/useMealToggle'
import type { PlannedMealDTO } from '@/types/dto.types'
import { UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MealCardProps {
  meal: PlannedMealDTO
}

/**
 * Komponent karty pojedynczego posiłku z funkcją oznaczania jako zjedzony
 *
 * @example
 * ```tsx
 * <MealCard meal={plannedMealDTO} />
 * ```
 */
export function MealCard({ meal }: MealCardProps) {
  const { mutate: toggleMeal, isPending } = useMealToggle()

  const handleToggle = (checked: boolean) => {
    toggleMeal({
      mealId: meal.id,
      isEaten: checked,
    })
  }

  return (
    <Card
      className={cn(
        'transition-all',
        meal.is_eaten && 'border-green-500 bg-green-50/50',
        isPending && 'opacity-50'
      )}
    >
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-3'>
        {/* Badge z typem posiłku */}
        <Badge variant='secondary' className='text-sm'>
          {MEAL_TYPE_LABELS[meal.meal_type]}
        </Badge>

        {/* Checkbox "Zjedzono" */}
        <div className='flex items-center gap-2'>
          <label
            htmlFor={`meal-${meal.id}`}
            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Zjedzono
          </label>
          <Checkbox
            id={`meal-${meal.id}`}
            checked={meal.is_eaten}
            disabled={isPending}
            onCheckedChange={handleToggle}
            aria-label={`Oznacz ${meal.recipe.name} jako zjedzony`}
          />
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Obraz przepisu */}
        <div className='bg-muted relative aspect-video w-full overflow-hidden rounded-lg'>
          {meal.recipe.image_url ? (
            <Image
              src={meal.recipe.image_url}
              alt={meal.recipe.name}
              fill
              className='object-cover'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              onError={(e) => {
                // Fallback na placeholder przy błędzie ładowania
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className='text-muted-foreground flex h-full items-center justify-center'>
              <UtensilsCrossed className='h-12 w-12' />
            </div>
          )}
        </div>

        {/* Nazwa przepisu */}
        <div>
          <h3 className='line-clamp-2 text-lg leading-tight font-semibold'>
            {meal.recipe.name}
          </h3>
        </div>

        {/* Wartości odżywcze */}
        <div className='border-border space-y-2 border-t pt-3'>
          {/* Kalorie */}
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>Kalorie</span>
            <span className='text-base font-semibold'>
              {formatMacro(meal.recipe.total_calories, ' kcal')}
            </span>
          </div>

          {/* Makroskładniki w linii */}
          <div className='text-muted-foreground flex items-center justify-between text-xs'>
            <div className='flex gap-3'>
              <span>
                <span className='text-foreground font-medium'>B:</span>{' '}
                {formatMacro(meal.recipe.total_protein_g, 'g')}
              </span>
              <span>
                <span className='text-foreground font-medium'>W:</span>{' '}
                {formatMacro(meal.recipe.total_carbs_g, 'g')}
              </span>
              <span>
                <span className='text-foreground font-medium'>T:</span>{' '}
                {formatMacro(meal.recipe.total_fats_g, 'g')}
              </span>
            </div>
          </div>
        </div>

        {/* Oznaczenie modyfikacji składników (jeśli istnieją) */}
        {meal.ingredient_overrides && (
          <div className='text-xs text-amber-600'>
            <span className='font-medium'>
              ⚠️ Zmodyfikowane ilości składników
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
