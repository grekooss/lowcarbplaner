/**
 * RecipePreviewModal - Modal podglądu przepisu (tylko do odczytu)
 * Używany w SwapRecipeDialog do podglądu zamienników
 */

'use client'

import { RecipeViewModal } from './RecipeViewModal'
import { useRecipeViewModal } from '@/hooks/useRecipeViewModal'
import { useAuthCheck } from '@/lib/hooks/useAuthCheck'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipePreviewModalProps {
  recipe: RecipeDTO
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal podglądu przepisu - wersja tylko do odczytu
 * Używany w SwapRecipeDialog do podglądu zamienników bez edycji
 */
export function RecipePreviewModal({
  recipe,
  isOpen,
  onClose,
}: RecipePreviewModalProps) {
  const { ingredientEditor } = useRecipeViewModal({ recipe })
  const { isAuthenticated } = useAuthCheck()

  return (
    <RecipeViewModal
      recipe={recipe}
      isOpen={isOpen}
      onClose={onClose}
      ingredientEditor={ingredientEditor}
      testId='recipe-preview-modal'
      preventOutsideClose={true}
      zIndexClass='z-[60]'
      isAuthenticated={isAuthenticated ?? false}
    />
  )
}
