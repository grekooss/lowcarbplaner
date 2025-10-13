/**
 * Komponent hero section dla szczegółów przepisu
 *
 * Wyświetla główne zdjęcie, nazwę, meal types i kolorowe karty makroskładników.
 */

'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MacroCard } from './MacroCard'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeDetailHeroProps {
  recipe: RecipeDTO
  onAddToMealPlan?: () => void
  isAuthenticated?: boolean
}

/**
 * Hero section dla widoku szczegółów przepisu
 *
 * @example
 * ```tsx
 * <RecipeDetailHero
 *   recipe={recipeDTO}
 *   onAddToMealPlan={() => handleAddToMealPlan()}
 *   isAuthenticated={true}
 * />
 * ```
 */
export function RecipeDetailHero({
  recipe,
  onAddToMealPlan,
  isAuthenticated,
}: RecipeDetailHeroProps) {
  return (
    <div className='space-y-6'>
      {/* Główne zdjęcie i informacje */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Zdjęcie */}
        <div className='relative aspect-video w-full overflow-hidden rounded-lg'>
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.name}
              fill
              className='object-cover'
              sizes='(max-width: 768px) 100vw, 50vw'
              priority
            />
          ) : (
            <div className='bg-muted flex h-full items-center justify-center'>
              <p className='text-muted-foreground'>Brak zdjęcia</p>
            </div>
          )}
        </div>

        {/* Informacje */}
        <div className='flex flex-col justify-between space-y-4'>
          <div className='space-y-4'>
            {/* Nazwa */}
            <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>
              {recipe.name}
            </h1>

            {/* Meal types */}
            <div className='flex flex-wrap gap-2'>
              {recipe.meal_types.map((type) => (
                <Badge key={type} variant='secondary' className='text-sm'>
                  {MEAL_TYPE_LABELS[type]}
                </Badge>
              ))}
            </div>

            {/* Tagi */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant='outline' className='text-xs'>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Przycisk Add to Meal Plan - tylko dla zalogowanych */}
          {isAuthenticated && onAddToMealPlan && (
            <Button
              size='lg'
              className='w-full bg-green-500 hover:bg-green-600'
              onClick={onAddToMealPlan}
            >
              Add to Meal Plan
            </Button>
          )}
        </div>
      </div>

      {/* Kolorowe karty makroskładników */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <MacroCard
          label='Calories'
          value={recipe.total_calories}
          unit='kcal'
          variant='calories'
        />
        <MacroCard
          label='Carbs'
          value={recipe.total_carbs_g}
          unit='gr'
          variant='carbs'
        />
        <MacroCard
          label='Proteins'
          value={recipe.total_protein_g}
          unit='gr'
          variant='protein'
        />
        <MacroCard
          label='Fats'
          value={recipe.total_fats_g}
          unit='gr'
          variant='fat'
        />
      </div>
    </div>
  )
}
