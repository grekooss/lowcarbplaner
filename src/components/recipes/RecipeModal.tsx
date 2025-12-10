/**
 * Modal z szczegółami przepisu
 * Wyświetlany nad stroną /recipes przy nawigacji do /recipes/[id]
 * Umożliwia podgląd i dostosowanie gramatur składników (bez zapisu)
 */

'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { RecipeDetailClient } from './detail/RecipeDetailClient'
import { useIngredientViewer } from '@/hooks/useIngredientViewer'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeModalProps {
  recipe: RecipeDTO
}

/**
 * Modal wyświetlający szczegóły przepisu
 * Używany w intercepting route (.)[id]
 * Umożliwia dostosowanie gramatur składników (tylko podgląd, bez zapisu)
 */
export function RecipeModal({ recipe }: RecipeModalProps) {
  const router = useRouter()

  const {
    adjustedNutrition,
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
  } = useIngredientViewer({ recipe })

  const handleClose = (open: boolean) => {
    if (!open) {
      router.back()
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent
        coverMainPanel
        className='overflow-y-auto rounded-md border-2 border-white bg-white/40 p-0 shadow-2xl backdrop-blur-md sm:rounded-2xl md:rounded-3xl'
      >
        <VisuallyHidden>
          <DialogTitle>{recipe.name}</DialogTitle>
        </VisuallyHidden>

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
      </DialogContent>
    </Dialog>
  )
}
