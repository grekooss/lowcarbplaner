/**
 * IngredientEditor - Main component for editing ingredient quantities
 *
 * Displays list of ingredients with editable quantities and real-time macro preview
 * Only used in Dashboard RecipeModal (not in meal-plan view)
 */

'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditableIngredientRow } from './EditableIngredientRow'
import { LiveMacroPreview } from './LiveMacroPreview'
import { useIngredientEditor } from '@/hooks/useIngredientEditor'
import type { RecipeDTO, IngredientOverrides } from '@/types/dto.types'

interface IngredientEditorProps {
  mealId: number
  recipe: RecipeDTO
  initialOverrides: IngredientOverrides | null
  onSaveSuccess?: () => void
}

export function IngredientEditor({
  mealId,
  recipe,
  initialOverrides,
  onSaveSuccess,
}: IngredientEditorProps) {
  const [isSaveSuccessful, setIsSaveSuccessful] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    hasChanges,
    adjustedNutrition,
    getIngredientAmount,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
    saveChanges,
    isSaving,
  } = useIngredientEditor({
    mealId,
    recipe,
    initialOverrides,
  })

  const handleSave = () => {
    setError(null)
    saveChanges(undefined, {
      onSuccess: () => {
        setIsSaveSuccessful(true)
        onSaveSuccess?.()
      },
      onError: (err) => {
        setError(
          err instanceof Error ? err.message : 'Nie udało się zapisać zmian'
        )
      },
    })
  }

  const originalNutrition = {
    calories: recipe.total_calories,
    protein_g: recipe.total_protein_g,
    carbs_g: recipe.total_carbs_g,
    fats_g: recipe.total_fats_g,
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Składniki</h3>
          <p className='text-muted-foreground text-sm'>
            Dostosuj gramatury składników (±10%)
          </p>
        </div>

        {/* Save button */}
        {hasChanges && !isSaveSuccessful && (
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
        )}

        {isSaveSuccessful && (
          <div className='text-sm font-medium text-green-600'>✓ Zapisano</div>
        )}
      </div>

      {/* Ingredients list */}
      <div
        data-testid='ingredients-list'
        className='space-y-3 rounded-xl border bg-white p-4'
      >
        {recipe.ingredients.map((ingredient, index) => (
          <EditableIngredientRow
            key={ingredient.id}
            ingredient={ingredient}
            currentAmount={getIngredientAmount(ingredient.id)}
            onAmountChange={updateIngredientAmount}
            onIncrement={incrementAmount}
            onDecrement={decrementAmount}
            index={index}
          />
        ))}
      </div>

      {/* Live macro preview */}
      <LiveMacroPreview
        original={originalNutrition}
        adjusted={adjustedNutrition}
      />

      {/* Error message */}
      {error && (
        <p className='rounded-lg bg-red-50 p-3 text-sm text-red-600'>{error}</p>
      )}

      {/* Info message */}
      {hasChanges && !isSaveSuccessful && !error && (
        <p className='text-xs text-amber-600'>
          * Masz niezapisane zmiany. Kliknij &quot;Zapisz zmiany&quot; aby je
          zachować.
        </p>
      )}
    </div>
  )
}
