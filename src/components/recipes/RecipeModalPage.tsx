/**
 * RecipeModalPage - Wyświetla modal przepisu na tle listy przepisów
 *
 * Używany przy bezpośrednim wejściu na URL /recipes/[slug].
 * Modal jest zawsze otwarty, zamknięcie przekierowuje do /recipes.
 */

'use client'

import { useRouter } from 'next/navigation'
import { LazyRecipeViewModal } from '@/components/shared/lazy-modals'
import { useRecipeViewModal } from '@/hooks/useRecipeViewModal'
import { useAuthCheck } from '@/lib/hooks/useAuthCheck'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeModalPageProps {
  recipe: RecipeDTO
}

/**
 * Strona wyświetlająca modal przepisu na tle listy przepisów.
 * Używana przy bezpośrednim wejściu na /recipes/[slug].
 */
export function RecipeModalPage({ recipe }: RecipeModalPageProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuthCheck()

  const { ingredientEditor } = useRecipeViewModal({ recipe })

  const handleClose = () => {
    // Przy zamknięciu modala przekieruj do listy przepisów
    router.push('/recipes')
  }

  return (
    <LazyRecipeViewModal
      recipe={recipe}
      isOpen={true}
      onClose={handleClose}
      ingredientEditor={ingredientEditor}
      testId='recipe-modal-page'
      isAuthenticated={isAuthenticated ?? false}
    />
  )
}
