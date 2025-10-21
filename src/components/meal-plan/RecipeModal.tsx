'use client'

/**
 * RecipeModal - Modal ze szczegółowym podglądem przepisu
 * Używa tego samego layoutu co RecipeDetailClient
 */

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { RecipeDetailClient } from '@/components/recipes/detail/RecipeDetailClient'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeModalProps {
  isOpen: boolean
  recipe: RecipeDTO | null
  onOpenChange: (open: boolean) => void
}

/**
 * Modal z podglądem przepisu
 * Wyświetla pełne szczegóły przepisu bez konieczności nawigacji
 */
export const RecipeModal = ({
  isOpen,
  recipe,
  onOpenChange,
}: RecipeModalProps) => {
  if (!recipe) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-[95vw] overflow-y-auto p-0 lg:max-w-[1400px]'>
        <RecipeDetailClient recipe={recipe} showBackButton={false} />
      </DialogContent>
    </Dialog>
  )
}
