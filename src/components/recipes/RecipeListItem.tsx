/**
 * Element listy przepisu – używa wyglądu kafelkowego z widoku siatki.
 */

'use client'

import Image from 'next/image'
import { Flame, Wheat, Beef, Droplet, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RecipeImagePlaceholder } from '@/components/recipes/RecipeImagePlaceholder'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { RecipeDTO } from '@/types/dto.types'
import { MacroSummaryRow } from './MacroSummaryRow'

interface RecipeListItemProps {
  recipe: RecipeDTO
  onClick: (recipeId: number) => void
  onAddToMealPlan?: (recipeId: number) => void
  isAuthenticated?: boolean
}

const difficultyLabel: Record<RecipeDTO['difficulty_level'], string> = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
}

export function RecipeListItem({
  recipe,
  onClick,
  onAddToMealPlan,
  isAuthenticated,
}: RecipeListItemProps) {
  const handleClick = () => onClick(recipe.id)

  const handleAddClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onAddToMealPlan?.(recipe.id)
  }

  const calories =
    recipe.total_calories !== null && recipe.total_calories !== undefined
      ? Math.round(recipe.total_calories)
      : null
  const carbs =
    recipe.total_carbs_g !== null && recipe.total_carbs_g !== undefined
      ? Math.round(recipe.total_carbs_g)
      : null
  const protein =
    recipe.total_protein_g !== null && recipe.total_protein_g !== undefined
      ? Math.round(recipe.total_protein_g)
      : null
  const fats =
    recipe.total_fats_g !== null && recipe.total_fats_g !== undefined
      ? Math.round(recipe.total_fats_g)
      : null

  const macroItems = [
    {
      icon: Flame,
      text: calories !== null ? `${calories} kcal` : '—',
    },
    {
      icon: Wheat,
      text: carbs !== null ? `${carbs} g` : '—',
    },
    {
      icon: Beef,
      text: protein !== null ? `${protein} g` : '—',
    },
    {
      icon: Droplet,
      text: fats !== null ? `${fats} g` : '—',
    },
  ]

  return (
    <Card
      className='w-full cursor-pointer rounded-3xl border-0 bg-[var(--bg-card)] p-0 transition-none'
      onClick={handleClick}
      role='button'
      tabIndex={0}
      aria-label={`Zobacz przepis ${recipe.name}`}
    >
      <CardContent className='flex flex-col gap-3.5 p-3.5 sm:flex-row sm:items-center sm:gap-5'>
        <div className='flex w-full flex-shrink-0 items-center justify-center sm:w-32'>
          <div className='from-primary via-primary-light to-primary-dark relative h-20 w-full overflow-hidden rounded-2xl bg-gradient-to-br sm:h-24'>
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.name}
                fill
                className='object-cover transition-none'
                sizes='(max-width: 640px) 100vw, 128px'
              />
            ) : (
              <RecipeImagePlaceholder recipeName={recipe.name} />
            )}
          </div>
        </div>

        <div className='flex flex-1 flex-col gap-3.5'>
          <div className='flex flex-wrap items-center gap-1.5'>
            {recipe.meal_types.length > 0 && recipe.meal_types[0] && (
              <Badge className='bg-breakfast-bg text-breakfast-text rounded-full px-3 py-1 text-xs font-semibold shadow-sm'>
                {MEAL_TYPE_LABELS[recipe.meal_types[0]]}
              </Badge>
            )}

            <div className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600'>
              <BarChart3 className='h-4 w-4 text-slate-600' />
              {difficultyLabel[recipe.difficulty_level]}
            </div>
          </div>

          <h3 className='text-lg leading-tight font-semibold text-slate-900 sm:text-xl'>
            {recipe.name}
          </h3>

          <div className='flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center'>
            <MacroSummaryRow items={macroItems} />

            <div className='ml-auto flex flex-wrap items-center gap-2'>
              <Button
                size='sm'
                className='bg-primary text-text-main hover:bg-primary-hover rounded-full px-6 text-sm font-semibold'
                onClick={(event) => {
                  event.stopPropagation()
                  onClick(recipe.id)
                }}
              >
                Zobacz przepis
              </Button>

              {isAuthenticated && onAddToMealPlan && (
                <Button
                  size='sm'
                  variant='secondary'
                  className='rounded-full px-5'
                  onClick={handleAddClick}
                >
                  Dodaj
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
