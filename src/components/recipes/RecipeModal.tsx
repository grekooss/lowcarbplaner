/**
 * Modal z szczegółami przepisu
 * Wyświetlany nad stroną /recipes przy nawigacji do /recipes/[id]
 */

'use client'

import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { RecipeDetailClient } from './detail/RecipeDetailClient'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeModalProps {
  recipe: RecipeDTO
}

/**
 * Modal wyświetlający szczegóły przepisu
 * Używany w intercepting route (.)[id]
 */
export function RecipeModal({ recipe }: RecipeModalProps) {
  const router = useRouter()

  const handleClose = (open: boolean) => {
    if (!open) {
      router.back()
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] max-w-[95vw] overflow-y-auto p-4 lg:max-w-[1440px]'>
        <VisuallyHidden>
          <DialogTitle>{recipe.name}</DialogTitle>
        </VisuallyHidden>
        <div className='pr-6'>
          <RecipeDetailClient recipe={recipe} showBackButton={false} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
