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
  // Step mode props (controlled from parent modal)
  isStepMode?: boolean
  currentStep?: number
  onOpenStepMode?: () => void
  totalSteps?: number
  // Hide steps button (when parent handles it in fixed footer)
  hideStepsButton?: boolean
}

/**
 * RecipeDetailClient z możliwością dostosowania gramatur (bez zapisu)
 */
export function RecipeDetailWithViewer({
  recipe,
  isStepMode = false,
  currentStep = 1,
  onOpenStepMode,
  totalSteps,
  hideStepsButton = false,
}: RecipeDetailWithViewerProps) {
  const {
    adjustedNutrition,
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
  } = useIngredientViewer({ recipe })

  // Oblicz total steps jeśli nie podano
  const calculatedTotalSteps =
    totalSteps ??
    (Array.isArray(recipe.instructions) ? recipe.instructions.length : 0)

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
      isStepMode={isStepMode}
      currentStep={currentStep}
      onOpenStepMode={onOpenStepMode}
      totalSteps={calculatedTotalSteps}
      hideStepsButton={hideStepsButton}
    />
  )
}
