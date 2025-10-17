/**
 * Komponent siatki przepisów
 *
 * Responsive grid layout wyświetlający karty przepisów.
 * 1 kolumna mobile, 2 tablet, 3 desktop.
 */

'use client'

import { RecipeCard } from './RecipeCard'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipesGridProps {
  recipes: RecipeDTO[]
  onRecipeClick: (recipeId: number) => void
}

/**
 * Komponent prezentacyjny siatki przepisów
 *
 * @example
 * ```tsx
 * <RecipesGrid
 *   recipes={recipesArray}
 *   onRecipeClick={(id) => handleRecipeClick(id)}
 * />
 * ```
 */
export function RecipesGrid({ recipes, onRecipeClick }: RecipesGridProps) {
  if (recipes.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-muted-foreground text-lg'>
          Brak przepisów do wyświetlenia
        </p>
      </div>
    )
  }

  return (
    <div className='grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onClick={onRecipeClick} />
      ))}
    </div>
  )
}
