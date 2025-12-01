/**
 * Komponent karty przepisu w widoku siatki
 *
 * Styl zgodny z RecipeListItem – glassmorphism z białym tłem.
 */

'use client'

import Image from 'next/image'
import { Flame, Wheat, Beef, Droplet } from 'lucide-react'
import { RecipeImagePlaceholder } from '@/components/recipes/RecipeImagePlaceholder'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeCardProps {
  recipe: RecipeDTO
  onClick: (recipeId: number) => void
  /** Ukryj badge z typem posiłku (gdy filtr jest aktywny) */
  hideMealTypeBadge?: boolean
}

const difficultyLabel: Record<RecipeDTO['difficulty_level'], string> = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
}

const getDifficultyColor = (difficulty: RecipeDTO['difficulty_level']) => {
  switch (difficulty) {
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

export function RecipeCard({
  recipe,
  onClick,
  hideMealTypeBadge = false,
}: RecipeCardProps) {
  const handleClick = () => onClick(recipe.id)

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

  return (
    <div
      className='group flex h-full cursor-pointer flex-col rounded-2xl border-2 border-white bg-white/40 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01]'
      onClick={handleClick}
      role='button'
      tabIndex={0}
      aria-label={`Zobacz przepis ${recipe.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {/* Image */}
      <div className='relative mb-4 h-40 w-full overflow-hidden rounded-md bg-white/60'>
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            fill
            className='object-cover grayscale-[10%]'
            sizes='(max-width: 768px) 100vw, 350px'
          />
        ) : (
          <RecipeImagePlaceholder recipeName={recipe.name} />
        )}
      </div>

      {/* Badges Row */}
      <div className='mb-3 flex flex-wrap items-center gap-2'>
        {/* Meal Type Badge - ukryty gdy filtr jest aktywny */}
        {!hideMealTypeBadge &&
          recipe.meal_types.length > 0 &&
          recipe.meal_types[0] && (
            <span className='rounded-sm border border-white bg-white px-2.5 py-1 text-xs font-bold tracking-wider text-gray-800 uppercase'>
              {MEAL_TYPE_LABELS[recipe.meal_types[0]]}
            </span>
          )}

        {/* Calories Badge */}
        <div className='flex items-center gap-1.5 rounded-sm bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm shadow-red-500/20'>
          <Flame className='h-3.5 w-3.5' /> {calories ?? '—'} kcal
        </div>

        {/* Difficulty Badge */}
        <div className='flex items-center gap-1.5 rounded-sm border border-white bg-white px-2.5 py-1 text-xs font-bold tracking-wider text-gray-800 uppercase'>
          <span
            className={`h-3 w-1 rounded-full ${getDifficultyColor(recipe.difficulty_level)}`}
          />
          {difficultyLabel[recipe.difficulty_level]}
        </div>
      </div>

      {/* Title */}
      <h4 className='mb-4 line-clamp-2 text-lg leading-tight font-bold text-gray-800'>
        {recipe.name}
      </h4>

      {/* Macros Row */}
      <div className='mt-auto flex flex-wrap items-center gap-4 text-sm font-medium text-black'>
        {/* Carbs */}
        <div className='flex items-center gap-2' title='Węglowodany'>
          <Wheat className='h-5 w-5 text-gray-900' />
          <span className='font-bold text-gray-700'>{carbs ?? '—'}g</span>
        </div>

        {/* Protein */}
        <div className='flex items-center gap-2' title='Białko'>
          <Beef className='h-5 w-5 text-gray-900' />
          <span className='font-bold text-gray-700'>{protein ?? '—'}g</span>
        </div>

        {/* Fat */}
        <div className='flex items-center gap-2' title='Tłuszcze'>
          <Droplet className='h-5 w-5 text-gray-900' />
          <span className='font-bold text-gray-700'>{fats ?? '—'}g</span>
        </div>
      </div>
    </div>
  )
}
