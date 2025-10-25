'use client'

/**
 * RecipeModal - Modal ze szczegółowym podglądem przepisu
 * Używa tego samego layoutu co RecipeDetailClient
 * W kontekście Dashboard - pokazuje inline ingredient editing
 */

import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { Button } from '@/components/ui/button'
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
      <DialogContent className='max-h-[90vh] max-w-[95vw] overflow-y-auto p-0 lg:max-w-[1400px]'>
        <VisuallyHidden>
          <DialogTitle>{meal.recipe.name}</DialogTitle>
        </VisuallyHidden>

        <div className='relative'>
          {/* Save button - sticky at top right */}
          {enableIngredientEditing && hasChanges && !isSaveSuccessful && (
            <div className='sticky top-0 z-10 flex justify-end border-b bg-white p-4'>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size='sm'
                className='gap-2'
              >
                {isSaving ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4' />
                    Zapisz zmiany
                  </>
                )}
              </Button>
            </div>
          )}

          {isSaveSuccessful && (
            <div className='sticky top-0 z-10 border-b bg-green-50 p-4 text-center text-sm font-medium text-green-600'>
              ✓ Zapisano zmiany
            </div>
          )}

          {error && (
            <div className='sticky top-0 z-10 border-b bg-red-50 p-4 text-sm text-red-600'>
              {error}
            </div>
          )}

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
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
