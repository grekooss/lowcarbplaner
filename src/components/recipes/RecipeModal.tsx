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
      <DialogContent
        coverMainPanel
        className='overflow-y-auto rounded-2xl border-2 border-white bg-white/40 p-0 shadow-2xl backdrop-blur-md md:rounded-3xl'
      >
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
