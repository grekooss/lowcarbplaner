/**
 * Komponent wyróżnionej karty przepisu (Featured/Hero)
 *
 * Mini karta w stylu dashboardu - zachowany layout z 3 kolumnami.
 */

'use client'

import Image from 'next/image'
import { RecipeImagePlaceholder } from '@/components/recipes/RecipeImagePlaceholder'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { RecipeDTO } from '@/types/dto.types'
import {
  BarChart3,
  Clock,
  ListOrdered,
  Timer,
  Flame,
  Wheat,
  Beef,
  Droplet,
} from 'lucide-react'

interface FeaturedRecipeCardProps {
  recipe: RecipeDTO
  onClick: (recipeId: number) => void
}

export function FeaturedRecipeCard({
  recipe,
  onClick,
}: FeaturedRecipeCardProps) {
  const handleClick = () => {
    onClick(recipe.id)
  }

  const prepTime = 0
  const cookTime = 0
  const totalSteps = Array.isArray(recipe.instructions)
    ? recipe.instructions.length
    : 0
  const primaryMealType = recipe.meal_types[0]
  const difficultyLabel: Record<RecipeDTO['difficulty_level'], string> = {
    easy: 'Łatwy',
    medium: 'Średni',
    hard: 'Trudny',
  }

  const calories = recipe.total_calories
    ? Math.round(recipe.total_calories)
    : null
  const fats = recipe.total_fats_g ? Math.round(recipe.total_fats_g) : null
  const carbs = recipe.total_carbs_g ? Math.round(recipe.total_carbs_g) : null
  const protein = recipe.total_protein_g
    ? Math.round(recipe.total_protein_g)
    : null

  return (
    <div className='flex flex-col gap-6 rounded-2xl border-2 border-white bg-white/40 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl lg:flex-row'>
      {/* Image Section */}
      <div className='flex-shrink-0 lg:w-64'>
        <div className='relative h-48 w-full overflow-hidden rounded-md bg-white/60 lg:h-full lg:min-h-[280px]'>
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.name}
              fill
              className='object-cover grayscale-[10%]'
              priority
              sizes='(max-width: 1024px) 100vw, 256px'
            />
          ) : (
            <RecipeImagePlaceholder recipeName={recipe.name} />
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className='flex flex-1 flex-col justify-center'>
        {primaryMealType && (
          <div className='mb-3'>
            <span className='rounded-sm border border-white bg-white px-2.5 py-1 text-xs font-bold tracking-wider text-gray-800 uppercase'>
              {MEAL_TYPE_LABELS[primaryMealType]}
            </span>
          </div>
        )}

        <h3 className='mb-6 text-2xl leading-tight font-bold text-gray-800'>
          {recipe.name}
        </h3>

        <div className='mb-6 grid max-w-md grid-cols-2 gap-x-8 gap-y-4'>
          <div className='flex items-center gap-3'>
            <div className='rounded-sm border border-white bg-white p-2 text-gray-600'>
              <BarChart3 className='h-4 w-4' />
            </div>
            <div>
              <p className='text-xs font-bold text-gray-400 uppercase'>
                Trudność
              </p>
              <p className='text-sm font-bold text-gray-900'>
                {difficultyLabel[recipe.difficulty_level]}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='rounded-sm border border-white bg-white p-2 text-gray-600'>
              <Clock className='h-4 w-4' />
            </div>
            <div>
              <p className='text-xs font-bold text-gray-400 uppercase'>
                Przygotowanie
              </p>
              <p className='text-sm font-bold text-gray-900'>
                {prepTime > 0 ? `${prepTime} min` : '—'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='rounded-sm border border-white bg-white p-2 text-gray-600'>
              <Timer className='h-4 w-4' />
            </div>
            <div>
              <p className='text-xs font-bold text-gray-400 uppercase'>
                Gotowanie
              </p>
              <p className='text-sm font-bold text-gray-900'>
                {cookTime > 0 ? `${cookTime} min` : '—'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='rounded-sm border border-white bg-white p-2 text-gray-600'>
              <ListOrdered className='h-4 w-4' />
            </div>
            <div>
              <p className='text-xs font-bold text-gray-400 uppercase'>Kroki</p>
              <p className='text-sm font-bold text-gray-900'>
                {totalSteps > 0 ? `${totalSteps}` : '—'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleClick}
          className='w-full rounded-sm bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-500/20 transition-all hover:bg-red-700 sm:w-auto'
        >
          Zobacz przepis
        </button>
      </div>

      {/* Quick Nutrition Panel */}
      <div className='flex flex-col gap-2 lg:w-32'>
        <div className='rounded-sm bg-red-600 px-2.5 py-2 shadow-sm shadow-red-500/20'>
          <p className='mb-1 text-center text-xs font-bold text-white uppercase'>
            Kalorie
          </p>
          <p className='flex items-center justify-center gap-1.5 text-xl font-bold text-white'>
            <Flame className='h-4 w-4' />
            {calories ?? '—'}{' '}
            <span className='text-xs font-medium text-white'>kcal</span>
          </p>
        </div>

        <div className='rounded-sm border border-white bg-white/60 px-2.5 py-2'>
          <p className='mb-1 text-center text-xs font-bold text-gray-500 uppercase'>
            Węglowodany
          </p>
          <p className='flex items-center justify-center gap-1.5 text-xl font-bold text-gray-800'>
            <span className='flex h-5 w-5 items-center justify-center rounded-sm bg-orange-500'>
              <Wheat className='h-3 w-3 text-white' />
            </span>
            {carbs ?? '—'}{' '}
            <span className='text-xs font-medium text-gray-500'>g</span>
          </p>
        </div>

        <div className='rounded-sm border border-white bg-white/60 px-2.5 py-2'>
          <p className='mb-1 text-center text-xs font-bold text-gray-500 uppercase'>
            Białko
          </p>
          <p className='flex items-center justify-center gap-1.5 text-xl font-bold text-gray-800'>
            <span className='flex h-5 w-5 items-center justify-center rounded-sm bg-blue-500'>
              <Beef className='h-3 w-3 text-white' />
            </span>
            {protein ?? '—'}{' '}
            <span className='text-xs font-medium text-gray-500'>g</span>
          </p>
        </div>

        <div className='rounded-sm border border-white bg-white/60 px-2.5 py-2'>
          <p className='mb-1 text-center text-xs font-bold text-gray-500 uppercase'>
            Tłuszcze
          </p>
          <p className='flex items-center justify-center gap-1.5 text-xl font-bold text-gray-800'>
            <span className='flex h-5 w-5 items-center justify-center rounded-sm bg-green-500'>
              <Droplet className='h-3 w-3 text-white' />
            </span>
            {fats ?? '—'}{' '}
            <span className='text-xs font-medium text-gray-500'>g</span>
          </p>
        </div>
      </div>
    </div>
  )
}
