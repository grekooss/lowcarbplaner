/**
 * Modal z szczegółami przepisu
 * Wyświetlany nad stroną /recipes przy nawigacji do /recipes/[id]
 * Umożliwia podgląd i dostosowanie gramatur składników (bez zapisu)
 */

'use client'

import { useRouter } from 'next/navigation'
import { RecipeViewModal } from '@/components/shared/RecipeViewModal'
import { useRecipeViewModal } from '@/hooks/useRecipeViewModal'
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

  const { ingredientEditor } = useRecipeViewModal({ recipe })

  const handleClose = () => {
    router.back()
  }

  return (
    <RecipeViewModal
      recipe={recipe}
      isOpen={true}
      onClose={handleClose}
      ingredientEditor={ingredientEditor}
      testId='recipes-recipe-modal'
    />
  )
}
