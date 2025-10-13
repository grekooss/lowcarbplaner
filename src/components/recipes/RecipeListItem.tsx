/**
 * Komponent elementu listy przepisów
 *
 * Wyświetla przepis w widoku listy z miniaturką i szczegółami.
 */

'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MEAL_TYPE_LABELS, formatMacro } from '@/types/recipes-view.types'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeListItemProps {
  recipe: RecipeDTO
  onClick: (recipeId: number) => void
  onAddToMealPlan?: (recipeId: number) => void
  isAuthenticated?: boolean
}

/**
 * Komponent pojedynczego elementu w widoku listy przepisów
 *
 * @example
 * ```tsx
 * <RecipeListItem
 *   recipe={recipeDTO}
 *   onClick={(id) => handleRecipeClick(id)}
 *   onAddToMealPlan={(id) => handleAddToMealPlan(id)}
 *   isAuthenticated={true}
 * />
 * ```
 */
export function RecipeListItem({
  recipe,
  onClick,
  onAddToMealPlan,
  isAuthenticated,
}: RecipeListItemProps) {
  const handleClick = () => {
    onClick(recipe.id)
  }

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToMealPlan?.(recipe.id)
  }

  return (
    <Card
      className='group cursor-pointer transition-all hover:shadow-lg'
      onClick={handleClick}
    >
      <CardContent className='p-0'>
        <div className='flex flex-col gap-4 p-4 sm:flex-row'>
          {/* Miniaturka */}
          <div className='bg-muted relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-48'>
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.name}
                fill
                className='object-cover transition-transform group-hover:scale-105'
                sizes='(max-width: 640px) 100vw, 192px'
              />
            ) : (
              <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
                Brak zdjęcia
              </div>
            )}
          </div>

          {/* Informacje */}
          <div className='flex flex-1 flex-col justify-between gap-3'>
            {/* Górna sekcja */}
            <div className='space-y-2'>
              {/* Meal type badge */}
              <div className='flex flex-wrap gap-1'>
                {recipe.meal_types.map((type) => (
                  <Badge key={type} variant='secondary' className='text-xs'>
                    {MEAL_TYPE_LABELS[type]}
                  </Badge>
                ))}
              </div>

              {/* Nazwa */}
              <h3 className='line-clamp-1 text-lg leading-tight font-semibold'>
                {recipe.name}
              </h3>
            </div>

            {/* Dolna sekcja - makro i przycisk */}
            <div className='flex flex-wrap items-center justify-between gap-3'>
              {/* Makroskładniki */}
              <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm'>
                <div className='flex items-center gap-1'>
                  <span className='text-muted-foreground'>Kalorie:</span>
                  <span className='font-semibold'>
                    {formatMacro(recipe.total_calories, ' kcal')}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-muted-foreground'>B:</span>
                  <span className='font-medium'>
                    {formatMacro(recipe.total_protein_g, 'g')}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-muted-foreground'>W:</span>
                  <span className='font-medium'>
                    {formatMacro(recipe.total_carbs_g, 'g')}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-muted-foreground'>T:</span>
                  <span className='font-medium'>
                    {formatMacro(recipe.total_fats_g, 'g')}
                  </span>
                </div>
              </div>

              {/* Przycisk Add to Meal Plan - tylko dla zalogowanych */}
              {isAuthenticated && onAddToMealPlan && (
                <Button
                  size='sm'
                  className='bg-green-500 hover:bg-green-600'
                  onClick={handleAddClick}
                >
                  Add to Meal Plan
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
