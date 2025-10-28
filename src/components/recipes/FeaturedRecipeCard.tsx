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
import { MacroCard } from '@/components/recipes/detail/MacroCard'
import { RecipeImagePlaceholder } from '@/components/recipes/RecipeImagePlaceholder'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { RecipeDTO } from '@/types/dto.types'
import { BarChart3, Clock, ListOrdered, Timer } from 'lucide-react'
import { getMealTypeBadgeClasses } from '@/lib/styles/mealTypeBadge'

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

  // Czasy przygotowania i gotowania są obecnie niedostępne w nowym formacie
  const prepTime = 0
  const cookTime = 0
  const totalSteps = Array.isArray(recipe.instructions)
    ? recipe.instructions.length
    : 0
  const primaryMealType = recipe.meal_types[0]
  const difficultyLabel: Record<RecipeDTO['difficulty_level'], string> = {
    easy: 'Łatwy',
    medium: 'Średni',
    hard: 'Zaawansowany',
  }

  return (
    <Card className='w-full border-0 bg-transparent shadow-none'>
      <CardContent className='p-0'>
        <div className='grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,0.85fr)]'>
          <div
            className='grid overflow-hidden rounded-2xl p-3 lg:h-[320px] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-center'
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className='flex h-full flex-shrink-0 items-center justify-start pl-3'>
              <div className='from-primary via-primary-light to-primary-dark relative aspect-square h-[calc(100%-24px)] overflow-hidden rounded-3xl bg-gradient-to-br'>
                {recipe.image_url ? (
                  <Image
                    src={recipe.image_url}
                    alt={recipe.name}
                    fill
                    className='object-cover'
                    priority
                    sizes='(max-width: 1024px) 100vw, 320px'
                  />
                ) : (
                  <RecipeImagePlaceholder recipeName={recipe.name} />
                )}
              </div>
            </div>

            <div className='flex h-full flex-1 flex-col gap-3 lg:justify-between'>
              <div className='space-y-3'>
                <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
                  {recipe.name}
                </h2>

                {primaryMealType && (
                  <Badge className={getMealTypeBadgeClasses(primaryMealType)}>
                    {MEAL_TYPE_LABELS[primaryMealType]}
                  </Badge>
                )}
              </div>

              <div className='mt-auto space-y-3'>
                <div className='grid grid-cols-2 gap-2.5'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-sm bg-white p-3'>
                      <BarChart3 className='h-5 w-5 text-gray-600' />
                    </div>
                    <div className='space-y-0.5'>
                      <p className='text-xs text-gray-600'>Trudność</p>
                      <p className='text-sm font-semibold text-gray-900'>
                        {difficultyLabel[recipe.difficulty_level]}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='rounded-sm bg-white p-3'>
                      <Clock className='h-5 w-5 text-gray-600' />
                    </div>
                    <div className='space-y-0.5'>
                      <p className='text-xs text-gray-600'>
                        Czas przygotowania
                      </p>
                      <p className='text-sm font-semibold text-gray-900'>
                        {prepTime > 0 ? `${prepTime} min` : '—'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='rounded-sm bg-white p-3'>
                      <Timer className='h-5 w-5 text-gray-600' />
                    </div>
                    <div className='space-y-0.5'>
                      <p className='text-xs text-gray-600'>Czas gotowania</p>
                      <p className='text-sm font-semibold text-gray-900'>
                        {cookTime > 0 ? `${cookTime} min` : '—'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='rounded-sm bg-white p-3'>
                      <ListOrdered className='h-5 w-5 text-gray-600' />
                    </div>
                    <div className='space-y-0.5'>
                      <p className='text-xs text-gray-600'>Liczba kroków</p>
                      <p className='text-sm font-semibold text-gray-900'>
                        {totalSteps > 0 ? `${totalSteps}` : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='pr-3 pb-3'>
                  <Button
                    size='lg'
                    className='w-full bg-[color:var(--primary)] text-black hover:bg-[color:var(--primary-hover)]'
                    onClick={handleClick}
                  >
                    Zobacz przepis
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-3 lg:h-[320px] lg:justify-center'>
            <MacroCard
              label='Kalorie'
              value={recipe.total_calories}
              unit='kcal'
              variant='calories'
              size='compact'
            />
            <MacroCard
              label='Tłuszcze'
              value={recipe.total_fats_g}
              unit='g'
              variant='fat'
              size='compact'
            />
            <MacroCard
              label='Węglowodany'
              value={recipe.total_carbs_g}
              unit='g'
              variant='carbs'
              size='compact'
            />
            <MacroCard
              label='Białko'
              value={recipe.total_protein_g}
              unit='g'
              variant='protein'
              size='compact'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
