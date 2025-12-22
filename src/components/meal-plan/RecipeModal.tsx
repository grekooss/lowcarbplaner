'use client'

/**
 * RecipeModal - Modal ze szczegółowym podglądem przepisu
 * Używa RecipeViewModal z możliwością zapisu zmian gramatur
 * W kontekście Dashboard - pokazuje inline ingredient editing z zapisem
 */

import { useState } from 'react'
import { RecipeViewModal } from '@/components/shared/RecipeViewModal'
import { useIngredientEditor } from '@/hooks/useIngredientEditor'
import type { PlannedMealDTO, RecipeDTO } from '@/types/dto.types'

interface RecipeModalProps {
  isOpen: boolean
  meal: PlannedMealDTO | null
  onOpenChange: (open: boolean) => void
  /**
   * Enable ingredient editing (only for Dashboard)
   */
  enableIngredientEditing?: boolean
  /**
   * External checked ingredients state (persisted by parent)
   */
  checkedIngredients?: Set<number>
  /**
   * Callback to toggle checked state (persisted by parent)
   */
  onToggleChecked?: (ingredientId: number) => void
}

/**
 * Modal z podglądem przepisu
 * Wyświetla pełne szczegóły przepisu bez konieczności nawigacji
 * W trybie edycji (Dashboard) - umożliwia dostosowanie gramatur składników inline z zapisem
 */
export const RecipeModal = ({
  isOpen,
  meal,
  onOpenChange,
  enableIngredientEditing = false,
  checkedIngredients,
  onToggleChecked,
}: RecipeModalProps) => {
  const [error, setError] = useState<string | null>(null)

  // Create a stable key for ingredient_overrides to detect real changes
  const overridesKey = JSON.stringify(meal?.ingredient_overrides ?? null)

  const {
    hasChanges,
    adjustedNutrition,
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
    saveChanges,
    isSaving,
    isSaveSuccess,
  } = useIngredientEditor({
    mealId: meal?.id ?? 0,
    recipe: meal?.recipe ?? ({ ingredients: [] } as unknown as RecipeDTO),
    initialOverrides: meal?.ingredient_overrides ?? null,
    // Force re-init when overrides change from server
    _overridesKey: overridesKey,
  })

  const handleSave = () => {
    setError(null)
    saveChanges(undefined, {
      onError: (err) => {
        setError(
          err instanceof Error ? err.message : 'Nie udało się zapisać zmian'
        )
      },
    })
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  if (!meal) return null

  // Noop functions for disabled editing
  const noopUpdate = () => ({
    success: false as const,
    error: 'Edycja wyłączona',
  })

  const ingredientEditor = {
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount: enableIngredientEditing
      ? updateIngredientAmount
      : noopUpdate,
    incrementAmount: enableIngredientEditing ? incrementAmount : noopUpdate,
    decrementAmount: enableIngredientEditing ? decrementAmount : noopUpdate,
    adjustedNutrition,
  }

  const saveConfig = enableIngredientEditing
    ? {
        hasChanges,
        isSaving,
        isSaveSuccessful: isSaveSuccess,
        saveError: error,
        onSave: handleSave,
      }
    : undefined

  return (
    <RecipeViewModal
      recipe={meal.recipe}
      isOpen={isOpen}
      onClose={handleClose}
      ingredientEditor={ingredientEditor}
      saveConfig={saveConfig}
      testId='recipe-modal'
      checkedIngredients={checkedIngredients}
      onToggleChecked={onToggleChecked}
    />
  )
}
