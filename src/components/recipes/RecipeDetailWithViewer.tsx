/**
 * Wrapper dla RecipeDetailClient z useIngredientViewer
 *
 * Używany w modalach gdzie potrzebujemy edycji gramatur bez zapisu.
 */

'use client'

import { RecipeDetailClient } from './detail/RecipeDetailClient'
import { useIngredientViewer } from '@/hooks/useIngredientViewer'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeDetailWithViewerProps {
  recipe: RecipeDTO
}

/**
 * RecipeDetailClient z możliwością dostosowania gramatur (bez zapisu)
 */
export function RecipeDetailWithViewer({
  recipe,
}: RecipeDetailWithViewerProps) {
  const {
    adjustedNutrition,
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
  } = useIngredientViewer({ recipe })

  return (
    <RecipeDetailClient
      recipe={recipe}
      showBackButton={false}
      enableIngredientEditing={true}
      getIngredientAmount={getIngredientAmount}
      isAutoAdjusted={isAutoAdjusted}
      updateIngredientAmount={updateIngredientAmount}
      incrementAmount={incrementAmount}
      decrementAmount={decrementAmount}
      adjustedNutrition={adjustedNutrition}
      hasChanges={false}
      isSaving={false}
    />
  )
}
