/**
 * Komponent hero section dla szczegółów przepisu
 *
 * Layout: 3 kolumny
 * - Kolumny 1-2: Wspólne brązowe tło z zaokrąglonymi rogami
 *   - Kolumna 1: Zdjęcie przepisu
 *   - Kolumna 2: Tytuł, meal type badge, 4 ikony z metadanymi (difficulty, prep time, cook time, steps), przycisk
 * - Kolumna 3: 4 kolorowe karty makro (pionowo)
 */

'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MacroCard } from './MacroCard'
import { RecipeImagePlaceholder } from '@/components/recipes/RecipeImagePlaceholder'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import { Star, BarChart3, Clock, Timer, ListOrdered } from 'lucide-react'
import type { RecipeDTO } from '@/types/dto.types'
import { getMealTypeBadgeClasses } from '@/lib/styles/mealTypeBadge'

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
  // Oblicz total steps z instrukcji
  const totalSteps = Array.isArray(recipe.instructions)
    ? recipe.instructions.length
    : 0

  // Czasy przygotowania i gotowania są obecnie niedostępne w nowym formacie
  const prepTime = 0
  const cookTime = 0

  return (
    <div className='grid gap-6 rounded-3xl bg-[var(--bg-card)] p-6 lg:grid-cols-5'>
      {/* Kolumny 1-4: wspólne tło (zdjęcie + informacje) */}
      <div className='grid gap-6 overflow-hidden lg:col-span-4 lg:h-[380px] lg:grid-cols-[380px_1fr] lg:items-center'>
        {/* Kolumna 1: Zdjęcie */}
        <div className='flex h-full items-center justify-start'>
          <div className='relative aspect-square w-full max-w-[380px] overflow-hidden rounded-3xl'>
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.name}
                fill
                className='object-cover'
                sizes='(max-width: 1024px) 100vw, 380px'
                priority
              />
            ) : (
              <RecipeImagePlaceholder recipeName={recipe.name} />
            )}
          </div>
        </div>

        {/* Kolumna 2: Informacje */}
        <div className='flex h-full flex-col gap-4 lg:h-full lg:justify-between'>
          {/* Tytuł */}
          <div className='space-y-3'>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
              {recipe.name}
            </h1>

            {/* Meal type badge + Rating */}
            <div className='flex flex-wrap items-center gap-3'>
              {recipe.meal_types.length > 0 && recipe.meal_types[0] && (
                <Badge
                  className={getMealTypeBadgeClasses(recipe.meal_types[0])}
                >
                  {MEAL_TYPE_LABELS[recipe.meal_types[0]]}
                </Badge>
              )}

              {recipe.average_rating && recipe.reviews_count > 0 && (
                <div className='flex items-center gap-1.5 text-sm'>
                  <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                  <span className='font-semibold text-gray-900'>
                    {recipe.average_rating.toFixed(1)}/5
                  </span>
                  <span className='text-black'>
                    ({recipe.reviews_count} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Tagi z bazy */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className='flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap text-black'>
                {recipe.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className='rounded-full bg-white/70 px-2.5 py-0.5 font-medium text-gray-700'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 4 ikony z metadanymi (w siatce 2x2) */}
          <div className='mt-auto grid grid-cols-2 gap-3'>
            {/* Difficulty */}
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-white p-3'>
                <BarChart3 className='h-5 w-5 text-black' />
              </div>
              <div className='space-y-0.5'>
                <p className='text-xs text-black'>Trudność</p>
                <p className='text-sm font-semibold text-gray-900'>
                  {recipe.difficulty_level === 'easy'
                    ? 'Łatwy'
                    : recipe.difficulty_level === 'medium'
                      ? 'Średni'
                      : 'Trudny'}
                </p>
              </div>
            </div>

            {/* Prep Time */}
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-white p-3'>
                <Clock className='h-5 w-5 text-black' />
              </div>
              <div className='space-y-0.5'>
                <p className='text-xs text-black'>Czas przygotowania</p>
                <p className='text-sm font-semibold text-gray-900'>
                  {prepTime > 0 ? `${prepTime} min` : '—'}
                </p>
              </div>
            </div>

            {/* Cook Time */}
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-white p-3'>
                <Timer className='h-5 w-5 text-black' />
              </div>
              <div className='space-y-0.5'>
                <p className='text-xs text-black'>Czas gotowania</p>
                <p className='text-sm font-semibold text-gray-900'>
                  {cookTime > 0 ? `${cookTime} min` : '—'}
                </p>
              </div>
            </div>

            {/* Total Steps */}
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-white p-3'>
                <ListOrdered className='h-5 w-5 text-black' />
              </div>
              <div className='space-y-0.5'>
                <p className='text-xs text-black'>Liczba kroków</p>
                <p className='text-sm font-semibold text-gray-900'>
                  {totalSteps > 0 ? `${totalSteps}` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Przycisk Zobacz przepis - tylko dla zalogowanych */}
          {isAuthenticated && onAddToMealPlan && (
            <Button
              size='lg'
              className='w-full rounded-full bg-[color:var(--secondary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary-hover)]'
              onClick={onAddToMealPlan}
            >
              Zobacz przepis
            </Button>
          )}
        </div>
      </div>

      {/* Kolumna 5: Karty makro (pionowo) */}
      <div className='flex flex-col gap-3 lg:col-span-1 lg:h-[380px] lg:justify-between'>
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
          label='Węgl. netto'
          value={recipe.total_net_carbs_g}
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
  )
}
