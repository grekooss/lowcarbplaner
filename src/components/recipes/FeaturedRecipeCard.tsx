/**
 * Komponent wyróżnionej karty przepisu (Featured/Hero)
 *
 * Mini karta w stylu dashboardu - zachowany layout z 3 kolumnami.
 */

'use client'

import { RecipeImage } from '@/components/recipes/RecipeImage'
import { RatingDisplay } from '@/components/recipes/RatingDisplay'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { RecipeDTO } from '@/types/dto.types'
import type { Enums } from '@/types/database.types'
import {
  ChefHat,
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
  onClick: (
    recipeSlug: string,
    recipeId: number,
    mealType?: Enums<'meal_type_enum'>
  ) => void
}

export function FeaturedRecipeCard({
  recipe,
  onClick,
}: FeaturedRecipeCardProps) {
  const primaryMealType = recipe.meal_types[0]
  const handleClick = () => {
    onClick(recipe.slug, recipe.id, primaryMealType)
  }

  const prepTime = recipe.prep_time_minutes ?? 0
  const cookTime = recipe.cook_time_minutes ?? 0
  const totalSteps = Array.isArray(recipe.instructions)
    ? recipe.instructions.length
    : 0
  const totalEquipment = Array.isArray(recipe.equipment)
    ? recipe.equipment.length
    : 0
  const difficultyLabel: Record<RecipeDTO['difficulty_level'], string> = {
    easy: 'Łatwy',
    medium: 'Średni',
    hard: 'Trudny',
  }

  const getDifficultyColor = (difficulty: RecipeDTO['difficulty_level']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success'
      case 'medium':
        return 'bg-tertiary'
      case 'hard':
        return 'bg-primary'
      default:
        return 'bg-text-muted'
    }
  }

  const calories = recipe.total_calories
    ? Math.round(recipe.total_calories)
    : null
  const fats = recipe.total_fats_g ? Math.round(recipe.total_fats_g) : null
  // Użyj Net Carbs zamiast Total Carbs dla diety keto/low-carb
  const netCarbs = recipe.total_net_carbs_g
    ? Math.round(recipe.total_net_carbs_g)
    : null
  const protein = recipe.total_protein_g
    ? Math.round(recipe.total_protein_g)
    : null

  return (
    <div className='flex gap-4 rounded-md border-2 border-white bg-white/40 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl sm:rounded-2xl lg:gap-6'>
      {/* Image Section - 1/3 width on tablet landscape, fixed width on desktop */}
      <div className='w-1/3 flex-shrink-0 lg:w-64'>
        <div className='relative h-full min-h-[200px] w-full overflow-hidden rounded-md bg-white/60 lg:min-h-[280px]'>
          <RecipeImage
            src={recipe.image_url}
            recipeName={recipe.name}
            alt={recipe.name}
            fill
            className='object-cover grayscale-[10%]'
            priority
            sizes='(max-width: 1024px) 33vw, 256px'
          />
        </div>
      </div>

      {/* Content Section - 2/3 width on tablet, flex-1 on desktop */}
      <div className='flex flex-1 flex-col justify-center'>
        {/* Badges Row */}
        <div className='mb-2 flex flex-wrap items-center gap-2 lg:mb-3'>
          {primaryMealType && (
            <span className='rounded-sm border border-white bg-white px-2 py-0.5 text-xs font-bold tracking-wider text-gray-800 uppercase lg:px-2.5 lg:py-1'>
              {MEAL_TYPE_LABELS[primaryMealType]}
            </span>
          )}

          {/* Difficulty Badge */}
          <div className='flex items-center gap-1.5 rounded-sm border border-white bg-white px-2 py-0.5 text-xs font-bold tracking-wider text-gray-800 uppercase lg:px-2.5 lg:py-1'>
            <span
              className={`h-3 w-1 rounded-full ${getDifficultyColor(recipe.difficulty_level)}`}
            />
            {difficultyLabel[recipe.difficulty_level]}
          </div>
        </div>

        <h3 className='mb-2 text-lg leading-tight font-bold text-gray-800 lg:mb-3 lg:text-2xl'>
          {recipe.name}
        </h3>

        {/* Rating */}
        <div className='mb-3 lg:mb-4'>
          <RatingDisplay
            rating={recipe.average_rating}
            reviewsCount={recipe.reviews_count}
            size='sm'
          />
        </div>

        {/* Inline Nutrition - visible on tablet, hidden on desktop */}
        <div className='mb-4 flex flex-wrap items-center gap-4 lg:hidden'>
          <span className='bg-primary shadow-primary/20 inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-bold text-white shadow-sm'>
            <Flame className='h-3.5 w-3.5' />
            {calories ?? '—'} kcal
          </span>
          <div className='flex items-center gap-2' title='Tłuszcze'>
            <div className='bg-success flex h-6 w-6 items-center justify-center rounded-sm'>
              <Droplet className='h-4 w-4 text-white' />
            </div>
            <span className='flex items-baseline gap-0.5 text-gray-700'>
              <span className='text-sm font-bold'>{fats ?? '—'}</span>
              <span className='text-xs'>g</span>
            </span>
          </div>
          <div
            className='flex items-center gap-2'
            title='Węglowodany netto (Net Carbs)'
          >
            <div className='bg-tertiary flex h-6 w-6 items-center justify-center rounded-sm'>
              <Wheat className='h-4 w-4 text-white' />
            </div>
            <span className='flex items-baseline gap-0.5 text-gray-700'>
              <span className='text-sm font-bold'>{netCarbs ?? '—'}</span>
              <span className='text-xs'>g</span>
            </span>
          </div>
          <div className='flex items-center gap-2' title='Białko'>
            <div className='bg-info flex h-6 w-6 items-center justify-center rounded-sm'>
              <Beef className='h-4 w-4 text-white' />
            </div>
            <span className='flex items-baseline gap-0.5 text-gray-700'>
              <span className='text-sm font-bold'>{protein ?? '—'}</span>
              <span className='text-xs'>g</span>
            </span>
          </div>
        </div>

        <div className='mb-4 grid grid-cols-2 gap-x-4 gap-y-2 lg:mb-6 lg:max-w-md lg:gap-x-8 lg:gap-y-4'>
          {/* Przygotowanie */}
          <div className='flex items-center gap-2 lg:gap-3'>
            <div className='rounded-sm border border-white bg-white p-1.5 text-gray-600 lg:p-2'>
              <Clock className='h-3.5 w-3.5 lg:h-4 lg:w-4' />
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase lg:text-xs'>
                Przygotowanie
              </p>
              <p className='text-xs font-bold text-gray-900 lg:text-sm'>
                {prepTime > 0 ? `${prepTime} min` : '—'}
              </p>
            </div>
          </div>

          {/* Kroki */}
          <div className='flex items-center gap-2 lg:gap-3'>
            <div className='rounded-sm border border-white bg-white p-1.5 text-gray-600 lg:p-2'>
              <ListOrdered className='h-3.5 w-3.5 lg:h-4 lg:w-4' />
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase lg:text-xs'>
                Kroki
              </p>
              <p className='text-xs font-bold text-gray-900 lg:text-sm'>
                {totalSteps > 0 ? `${totalSteps}` : '—'}
              </p>
            </div>
          </div>

          {/* Gotowanie */}
          <div className='flex items-center gap-2 lg:gap-3'>
            <div className='rounded-sm border border-white bg-white p-1.5 text-gray-600 lg:p-2'>
              <Timer className='h-3.5 w-3.5 lg:h-4 lg:w-4' />
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase lg:text-xs'>
                Gotowanie
              </p>
              <p className='text-xs font-bold text-gray-900 lg:text-sm'>
                {cookTime > 0 ? `${cookTime} min` : '—'}
              </p>
            </div>
          </div>

          {/* Sprzęt */}
          <div className='flex items-center gap-2 lg:gap-3'>
            <div className='rounded-sm border border-white bg-white p-1.5 text-gray-600 lg:p-2'>
              <ChefHat className='h-3.5 w-3.5 lg:h-4 lg:w-4' />
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase lg:text-xs'>
                Sprzęt
              </p>
              <p className='text-xs font-bold text-gray-900 lg:text-sm'>
                {totalEquipment > 0 ? `${totalEquipment}` : '—'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleClick}
          className='bg-primary shadow-primary/20 hover:bg-primary-hover w-full rounded-sm px-4 py-2 text-sm font-bold text-white shadow-sm transition-all lg:w-auto lg:px-6 lg:py-2.5'
        >
          Zobacz przepis
        </button>
      </div>

      {/* Quick Nutrition Panel - hidden on tablet landscape, visible on desktop */}
      <div className='hidden flex-col gap-2 lg:flex lg:w-32'>
        <div className='bg-primary shadow-primary/20 rounded-sm px-2.5 py-2 shadow-sm'>
          <p className='mb-1 text-center text-xs font-bold text-white uppercase'>
            Kalorie
          </p>
          <p className='flex items-center justify-center gap-1.5'>
            <Flame className='h-5 w-5 text-white' />
            <span className='flex items-baseline gap-0.5'>
              <span className='text-xl font-bold text-white'>
                {calories ?? '—'}
              </span>
              <span className='text-xs font-medium text-white'>kcal</span>
            </span>
          </p>
        </div>

        <div className='rounded-sm border border-white bg-white/60 px-2.5 py-2'>
          <p className='mb-1 text-center text-xs font-bold text-gray-500 uppercase'>
            Tłuszcze
          </p>
          <p className='flex items-center justify-center gap-1.5'>
            <span className='bg-success flex h-6 w-6 items-center justify-center rounded-sm'>
              <Droplet className='h-4 w-4 text-white' />
            </span>
            <span className='flex items-baseline gap-0.5'>
              <span className='text-xl font-bold text-gray-800'>
                {fats ?? '—'}
              </span>
              <span className='text-xs font-medium text-gray-500'>g</span>
            </span>
          </p>
        </div>

        <div className='rounded-sm border border-white bg-white/60 px-2.5 py-2'>
          <p className='mb-1 text-center text-xs font-bold text-gray-500 uppercase'>
            Węgl. netto
          </p>
          <p className='flex items-center justify-center gap-1.5'>
            <span className='bg-tertiary flex h-6 w-6 items-center justify-center rounded-sm'>
              <Wheat className='h-4 w-4 text-white' />
            </span>
            <span className='flex items-baseline gap-0.5'>
              <span className='text-xl font-bold text-gray-800'>
                {netCarbs ?? '—'}
              </span>
              <span className='text-xs font-medium text-gray-500'>g</span>
            </span>
          </p>
        </div>

        <div className='rounded-sm border border-white bg-white/60 px-2.5 py-2'>
          <p className='mb-1 text-center text-xs font-bold text-gray-500 uppercase'>
            Białko
          </p>
          <p className='flex items-center justify-center gap-1.5'>
            <span className='bg-info flex h-6 w-6 items-center justify-center rounded-sm'>
              <Beef className='h-4 w-4 text-white' />
            </span>
            <span className='flex items-baseline gap-0.5'>
              <span className='text-xl font-bold text-gray-800'>
                {protein ?? '—'}
              </span>
              <span className='text-xs font-medium text-gray-500'>g</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
