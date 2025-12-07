'use client'

/**
 * RecipeModal - Modal ze szczegółowym podglądem przepisu
 * Używa tego samego layoutu co RecipeDetailClient
 * W kontekście Dashboard - pokazuje inline ingredient editing
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { RecipeDetailClient } from '@/components/recipes/detail/RecipeDetailClient'
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
}

/**
 * Modal z podglądem przepisu
 * Wyświetla pełne szczegóły przepisu bez konieczności nawigacji
 * W trybie edycji (Dashboard) - umożliwia dostosowanie gramatur składników inline
 */
export const RecipeModal = ({
  isOpen,
  meal,
  onOpenChange,
  enableIngredientEditing = false,
}: RecipeModalProps) => {
  const [isSaveSuccessful, setIsSaveSuccessful] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  } = useIngredientEditor({
    mealId: meal?.id ?? 0,
    recipe: meal?.recipe ?? ({ ingredients: [] } as unknown as RecipeDTO),
    initialOverrides: meal?.ingredient_overrides ?? null,
  })

  const handleSave = () => {
    setError(null)
    saveChanges(undefined, {
      onSuccess: () => {
        setIsSaveSuccessful(true)
        // Don't reset immediately - wait for hasChanges to become false
      },
      onError: (err) => {
        setError(
          err instanceof Error ? err.message : 'Nie udało się zapisać zmian'
        )
      },
    })
  }

  // Reset success message after hasChanges becomes false (data synced)
  useEffect(() => {
    if (isSaveSuccessful && !hasChanges) {
      const timer = setTimeout(() => {
        setIsSaveSuccessful(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSaveSuccessful, hasChanges])

  if (!meal) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid='recipe-modal'
        constrainToMainPanel
        className='max-h-[85vh] w-[calc(100%-2rem)] max-w-[1340px] overflow-y-auto rounded-[20px] border-2 border-[var(--glass-border)] bg-white/40 p-0 shadow-[var(--shadow-elevated)] backdrop-blur-[20px]'
      >
        <VisuallyHidden>
          <DialogTitle>{meal.recipe.name}</DialogTitle>
        </VisuallyHidden>

        <RecipeDetailClient
          recipe={meal.recipe}
          showBackButton={false}
          enableIngredientEditing={enableIngredientEditing}
          getIngredientAmount={getIngredientAmount}
          isAutoAdjusted={isAutoAdjusted}
          updateIngredientAmount={
            enableIngredientEditing ? updateIngredientAmount : undefined
          }
          incrementAmount={
            enableIngredientEditing ? incrementAmount : undefined
          }
          decrementAmount={
            enableIngredientEditing ? decrementAmount : undefined
          }
          adjustedNutrition={adjustedNutrition}
          hasChanges={hasChanges}
          isSaving={isSaving}
          onSave={handleSave}
          saveError={error}
          isSaveSuccessful={isSaveSuccessful}
        />
      </DialogContent>
    </Dialog>
  )
}
