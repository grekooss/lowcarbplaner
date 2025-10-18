'use client'

/**
 * ReplacementsModal - Modal z listą sugerowanych zamienników dla posiłku
 * Integruje API endpoint GET /planned-meals/{id}/replacements
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ReplacementCard } from './ReplacementCard'
import { useReplacementsQuery } from '@/lib/hooks/useReplacementsQuery'
import { useMealSwap } from '@/lib/hooks/useMealSwap'
import { SearchX } from 'lucide-react'

interface ReplacementsModalProps {
  isOpen: boolean
  mealId: number | null
  mealType: 'breakfast' | 'lunch' | 'dinner' | null
  onOpenChange: (open: boolean) => void
}

/**
 * Modal z listą zamienników przepisu
 * Loading/Error/Empty/Success states
 */
export const ReplacementsModal = ({
  isOpen,
  mealId,
  onOpenChange,
}: ReplacementsModalProps) => {
  // Query dla zamienników
  const {
    data: replacements = [],
    isLoading,
    isError,
    error,
  } = useReplacementsQuery(mealId)

  // Mutation do wymiany posiłku
  const { mutate: swapMeal, isPending } = useMealSwap()

  // Handler wyboru zamiennika
  const handleSelectReplacement = (recipeId: number) => {
    if (!mealId) return

    swapMeal(
      { mealId, newRecipeId: recipeId },
      {
        onSuccess: () => {
          onOpenChange(false) // Zamknij modal po udanej wymianie
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Sugerowane zamienniki</DialogTitle>
          <DialogDescription>
            Wybierz przepis o podobnej kaloryczności do zamiany
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          {/* Loading state */}
          {isLoading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className='flex gap-4 rounded-lg border p-4'>
                  <Skeleton className='h-20 w-24 rounded' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-3 w-1/2' />
                    <Skeleton className='h-8 w-20' />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Error state */}
          {isError && (
            <div className='text-muted-foreground py-8 text-center'>
              <p className='text-sm'>
                Wystąpił błąd podczas pobierania zamienników.
              </p>
              <p className='mt-1 text-xs'>
                {error?.message || 'Spróbuj ponownie później.'}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && replacements.length === 0 && (
            <div className='py-12 text-center'>
              <SearchX className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
              <h4 className='mb-2 text-base font-medium'>Brak zamienników</h4>
              <p className='text-muted-foreground mx-auto max-w-sm text-sm'>
                Nie znaleźliśmy przepisów o podobnej kaloryczności dla tego typu
                posiłku.
              </p>
            </div>
          )}

          {/* Success state - lista zamienników */}
          {!isLoading &&
            !isError &&
            replacements.length > 0 &&
            replacements.map((recipe) => (
              <ReplacementCard
                key={recipe.id}
                recipe={recipe}
                onSelect={handleSelectReplacement}
                isLoading={isPending}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
