/**
 * Modal z szczegółami przepisu
 * Wyświetlany nad stroną /recipes przy nawigacji do /recipes/[id]
 * Umożliwia podgląd i dostosowanie gramatur składników (bez zapisu)
 */

'use client'

import { useRouter } from 'next/navigation'
import { LazyRecipeViewModal } from '@/components/shared/lazy-modals'
import { useRecipeViewModal } from '@/hooks/useRecipeViewModal'
import { useAuthCheck } from '@/lib/hooks/useAuthCheck'
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
  const { isAuthenticated } = useAuthCheck()

  const { ingredientEditor } = useRecipeViewModal({ recipe })

  const handleClose = () => {
    router.back()
  }

  return (
    <LazyRecipeViewModal
      recipe={recipe}
      isOpen={true}
      onClose={handleClose}
      ingredientEditor={ingredientEditor}
      testId='recipes-recipe-modal'
      isAuthenticated={isAuthenticated ?? false}
    />
  )
}
