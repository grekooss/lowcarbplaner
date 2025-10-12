/**
 * Komponent karty przepisu
 *
 * Klikalna karta z hover effects, fully keyboard accessible.
 * Wyświetla miniaturę, nazwę, meal types, tagi i makro w kompaktowej formie.
 */

'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MEAL_TYPE_LABELS, formatMacro } from '@/types/recipes-view.types'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeCardProps {
  recipe: RecipeDTO
  onClick: (recipeId: number) => void
}

/**
 * Komponent interaktywny karty przepisu
 *
 * @example
 * ```tsx
 * <RecipeCard
 *   recipe={recipeDTO}
 *   onClick={(id) => handleRecipeClick(id)}
 * />
 * ```
 */
export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const handleClick = () => {
    onClick(recipe.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(recipe.id)
    }
  }

  return (
    <Card
      className='group cursor-pointer transition-all hover:shadow-lg'
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='button'
      aria-label={`Zobacz przepis ${recipe.name}`}
    >
      <CardContent className='p-0'>
        {/* Thumbnail image */}
        <div className='bg-muted relative aspect-video w-full overflow-hidden rounded-t-lg'>
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.name}
              fill
              className='object-cover transition-transform group-hover:scale-105'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          ) : (
            <div className='text-muted-foreground flex h-full items-center justify-center'>
              Brak zdjęcia
            </div>
          )}
        </div>

        {/* Content */}
        <div className='space-y-3 p-4'>
          {/* Nazwa */}
          <h3 className='line-clamp-2 text-lg leading-tight font-semibold'>
            {recipe.name}
          </h3>

          {/* Meal types */}
          <div className='flex flex-wrap gap-1'>
            {recipe.meal_types.map((type) => (
              <Badge key={type} variant='secondary' className='text-xs'>
                {MEAL_TYPE_LABELS[type]}
              </Badge>
            ))}
          </div>

          {/* Makro - kompaktowa forma */}
          <div className='border-border flex items-center justify-between border-t pt-3 text-sm'>
            <div>
              <p className='text-foreground font-semibold'>
                {formatMacro(recipe.total_calories, ' kcal')}
              </p>
            </div>
            <div className='text-muted-foreground text-xs'>
              B: {formatMacro(recipe.total_protein_g, 'g')} | W:{' '}
              {formatMacro(recipe.total_carbs_g, 'g')} | T:{' '}
              {formatMacro(recipe.total_fats_g, 'g')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
