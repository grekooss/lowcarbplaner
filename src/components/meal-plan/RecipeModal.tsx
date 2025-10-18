'use client'

/**
 * RecipeModal - Modal ze szczegółowym podglądem przepisu
 * Reużywa komponenty z RecipeDetailClient
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RecipeHeader } from '@/components/recipes/detail/RecipeHeader'
import { MacroSummary } from '@/components/recipes/detail/MacroSummary'
import { IngredientsList } from '@/components/recipes/detail/IngredientsList'
import { InstructionsList } from '@/components/recipes/detail/InstructionsList'
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
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Szczegóły przepisu</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Header z obrazem i nazwą */}
          <RecipeHeader
            name={recipe.name}
            imageUrl={recipe.image_url}
            tags={recipe.tags}
            mealTypes={recipe.meal_types}
          />

          {/* Makro summary */}
          <MacroSummary
            calories={recipe.total_calories}
            protein_g={recipe.total_protein_g}
            carbs_g={recipe.total_carbs_g}
            fats_g={recipe.total_fats_g}
          />

          {/* Lista składników */}
          <IngredientsList ingredients={recipe.ingredients} />

          {/* Instrukcje przygotowania */}
          <InstructionsList instructions={recipe.instructions} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
