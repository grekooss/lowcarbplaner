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
        constrainToMainPanel
        className='max-h-[85vh] w-[calc(100%-2rem)] max-w-[1340px] overflow-y-auto rounded-[20px] border-2 border-[var(--glass-border)] bg-white/40 p-0 shadow-[var(--shadow-elevated)] backdrop-blur-[20px]'
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
