/**
 * Komponent wyróżnionej karty przepisu (Featured/Hero)
 *
 * Duża karta prezentująca losowy/wyróżniony przepis w formie hero section.
 * Zawiera full-width image, nazwę, tagi, makro i CTA button.
 */

'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MEAL_TYPE_LABELS, formatMacro } from '@/types/recipes-view.types'
import type { RecipeDTO } from '@/types/dto.types'

interface FeaturedRecipeCardProps {
  recipe: RecipeDTO
  onClick: (recipeId: number) => void
}

/**
 * Komponent interaktywny featured recipe
 *
 * @example
 * ```tsx
 * <FeaturedRecipeCard
 *   recipe={featuredRecipe}
 *   onClick={(id) => handleRecipeClick(id)}
 * />
 * ```
 */
export function FeaturedRecipeCard({
  recipe,
  onClick,
}: FeaturedRecipeCardProps) {
  const handleClick = () => {
    onClick(recipe.id)
  }

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-0'>
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Image section */}
          <div className='relative aspect-[4/3] w-full md:aspect-auto md:min-h-[400px]'>
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.name}
                fill
                className='object-cover'
                priority
                sizes='(max-width: 768px) 100vw, 50vw'
              />
            ) : (
              <div className='bg-muted text-muted-foreground flex h-full items-center justify-center'>
                Brak zdjęcia
              </div>
            )}
          </div>

          {/* Content section */}
          <div className='flex flex-col justify-center space-y-6 p-6 md:p-8'>
            {/* Badge "Polecany" */}
            <Badge className='w-fit' variant='secondary'>
              ⭐ Polecany przepis
            </Badge>

            {/* Nazwa */}
            <div className='space-y-3'>
              <h2 className='text-3xl leading-tight font-bold md:text-4xl'>
                {recipe.name}
              </h2>

              {/* Meal types i tags */}
              <div className='flex flex-wrap gap-2'>
                {recipe.meal_types.map((type) => (
                  <Badge key={type} variant='default'>
                    {MEAL_TYPE_LABELS[type]}
                  </Badge>
                ))}
                {recipe.tags &&
                  recipe.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant='outline'>
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Makro summary */}
            <div className='border-border bg-muted/50 grid grid-cols-4 gap-4 rounded-lg border p-4'>
              <div className='text-center'>
                <p className='text-muted-foreground text-xs'>Kalorie</p>
                <p className='mt-1 text-lg font-bold text-orange-600'>
                  {formatMacro(recipe.total_calories, '')}
                </p>
                <p className='text-muted-foreground text-xs'>kcal</p>
              </div>
              <div className='text-center'>
                <p className='text-muted-foreground text-xs'>Białko</p>
                <p className='mt-1 text-lg font-bold text-blue-600'>
                  {formatMacro(recipe.total_protein_g, '')}
                </p>
                <p className='text-muted-foreground text-xs'>g</p>
              </div>
              <div className='text-center'>
                <p className='text-muted-foreground text-xs'>Węgle</p>
                <p className='mt-1 text-lg font-bold text-green-600'>
                  {formatMacro(recipe.total_carbs_g, '')}
                </p>
                <p className='text-muted-foreground text-xs'>g</p>
              </div>
              <div className='text-center'>
                <p className='text-muted-foreground text-xs'>Tłuszcze</p>
                <p className='mt-1 text-lg font-bold text-purple-600'>
                  {formatMacro(recipe.total_fats_g, '')}
                </p>
                <p className='text-muted-foreground text-xs'>g</p>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              size='lg'
              className='w-full md:w-auto'
              onClick={handleClick}
            >
              Zobacz przepis
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
