/**
 * Wrapper dla strony szczegółów przepisu
 *
 * Client Component który dodaje możliwość edycji gramatur składników
 * (bez zapisu - tylko podgląd).
 */

'use client'

import { RecipeDetailClient } from './RecipeDetailClient'
import { useIngredientViewer } from '@/hooks/useIngredientViewer'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeDetailPageProps {
  recipe: RecipeDTO
}

/**
 * Strona szczegółów przepisu z możliwością dostosowania gramatur
 */
export function RecipeDetailPage({ recipe }: RecipeDetailPageProps) {
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
      showBackButton={true}
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
