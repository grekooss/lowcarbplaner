/**
 * Komponent karty przepisu
 *
 * Styl inspirowany kartami z hero widoku – duże zdjęcie/placeholder, sekcja informacyjna
 * oraz pionowy stack kart makro. Całość utrzymana w pastelowej kolorystyce nawiązującej
 * do referencyjnych zrzutów ekranu.
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
import { getMealTypeBadgeClasses } from '@/lib/styles/mealTypeBadge'

interface RecipeCardProps {
  recipe: RecipeDTO
  onClick: (recipeId: number) => void
}

const difficultyLabel: Record<RecipeDTO['difficulty_level'], string> = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
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

  const handleActivate = () => onClick(recipe.id)

  return (
    <Card
      className='focus-visible:ring-primary/40 flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border-0 bg-[var(--bg-card)] transition-transform duration-200 ease-out hover:scale-[1.02] hover:shadow-[0_12px_28px_rgba(36,25,15,0.1)] focus-visible:ring-2 focus-visible:outline-none'
      role='button'
      tabIndex={0}
      aria-label={`Zobacz przepis ${recipe.name}`}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleActivate()
        }
      }}
    >
      <div className='from-primary via-primary-light to-primary-dark relative mx-4 mt-4 h-40 overflow-hidden rounded-3xl bg-gradient-to-br sm:h-48'>
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            fill
            className='object-cover transition-none'
            sizes='(max-width: 768px) 100vw, 300px'
          />
        ) : (
          <RecipeImagePlaceholder recipeName={recipe.name} />
        )}
      </div>

      <CardContent className='flex flex-1 flex-col gap-3.5 px-4 pt-3 pb-4'>
        <div className='flex flex-wrap items-center gap-1.5'>
          {recipe.meal_types.length > 0 && recipe.meal_types[0] && (
            <Badge className={getMealTypeBadgeClasses(recipe.meal_types[0])}>
              {MEAL_TYPE_LABELS[recipe.meal_types[0]]}
            </Badge>
          )}

          <div className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600'>
            <BarChart3 className='h-4 w-4 text-slate-600' />
            {difficultyLabel[recipe.difficulty_level]}
          </div>
        </div>

        <h3 className='line-clamp-2 text-xl leading-tight font-semibold text-slate-900'>
          {recipe.name}
        </h3>

        <MacroSummaryRow items={macroItems} />

        <div className='mt-auto pt-1.5'>
          <Button
            className='bg-primary text-text-main hover:bg-primary-hover w-full rounded-full px-5 text-sm font-semibold'
            onClick={(event) => {
              event.stopPropagation()
              handleActivate()
            }}
          >
            Zobacz przepis
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
