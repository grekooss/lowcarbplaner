/**
 * SwapRecipeDialog - Dialog do podmiany przepisu w zaplanowanym posiłku
 *
 * Wyświetla listę sugerowanych zamienników przepisu, filtrowanych według:
 * - Tego samego typu posiłku (śniadanie/obiad/kolacja)
 * - Podobnej kaloryczności (±15%)
 */

'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  Loader2,
  UtensilsCrossed,
  Flame,
  Wheat,
  Beef,
  Droplet,
  X,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'
import { useReplacementRecipes } from '@/hooks/useReplacementRecipes'
import { useSwapRecipe } from '@/hooks/useSwapRecipe'
import { useRecipeQuery } from '@/lib/react-query/queries/useRecipeQuery'
import { RecipePreviewModal } from './RecipePreviewModal'
import type { PlannedMealDTO } from '@/types/dto.types'

interface SwapRecipeDialogProps {
  meal: PlannedMealDTO
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SwapRecipeDialog({
  meal,
  open,
  onOpenChange,
}: SwapRecipeDialogProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
  const [previewRecipeId, setPreviewRecipeId] = useState<number | null>(null)

  const {
    data: replacements = [],
    isLoading,
    error,
  } = useReplacementRecipes(meal.id, open)

  const { mutate: swapRecipe, isPending: isSwapping } = useSwapRecipe()

  // Pobierz pełne dane przepisu do podglądu
  const { data: previewRecipe } = useRecipeQuery({
    recipeId: previewRecipeId ?? 0,
    enabled: !!previewRecipeId,
  })

  const handleSwap = () => {
    if (!selectedRecipeId) return

    swapRecipe(
      { mealId: meal.id, newRecipeId: selectedRecipeId },
      {
        onSuccess: () => {
          onOpenChange(false)
          setSelectedRecipeId(null)
        },
      }
    )
  }

  // Oblicz aktualne kalorie z uwzględnieniem ingredient_overrides
  const currentNutrition = useMemo(
    () =>
      calculateRecipeNutritionWithOverrides(
        meal.recipe,
        meal.ingredient_overrides
      ),
    [meal.recipe, meal.ingredient_overrides]
  )

  const originalCalories = currentNutrition.calories

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          // Blokuj zamknięcie SwapRecipeDialog gdy RecipePreviewModal jest otwarty
          if (!newOpen && previewRecipeId) return
          onOpenChange(newOpen)
        }}
      >
        <DialogContent
          coverMainPanelOnMobile
          hideCloseButton
          className='flex max-h-[90vh] flex-col overflow-hidden rounded-md border-2 border-white bg-white/40 p-0 shadow-2xl backdrop-blur-md sm:max-w-xl sm:rounded-2xl md:max-w-2xl md:rounded-3xl'
        >
          {/* Fixed Header */}
          <div className='relative flex-shrink-0 border-b-2 border-white bg-[var(--bg-card)] p-4 pb-3'>
            <DialogHeader>
              <DialogTitle className='text-text-main text-center text-base font-bold sm:text-lg'>
                Zmień przepis
              </DialogTitle>
            </DialogHeader>
            <DialogClose className='absolute top-3 right-3 opacity-70 transition-opacity hover:opacity-100 sm:top-5 sm:right-5'>
              <X className='h-5 w-5' />
              <span className='sr-only'>Zamknij</span>
            </DialogClose>
          </div>

          {/* Scrollable Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4'>
            {isLoading && (
              <div className='flex items-center justify-center py-8 sm:py-12'>
                <Loader2 className='text-muted-foreground h-6 w-6 animate-spin sm:h-8 sm:w-8' />
              </div>
            )}

            {error && (
              <div className='border-error/30 bg-error-bg text-error rounded-lg border p-3 text-xs backdrop-blur-sm sm:rounded-2xl sm:p-4 sm:text-sm'>
                Błąd podczas wczytywania zamienników: {(error as Error).message}
              </div>
            )}

            {!isLoading && !error && replacements.length === 0 && (
              <div className='rounded-lg border border-[var(--glass-border)] bg-white/30 px-4 py-8 text-center backdrop-blur-sm sm:rounded-2xl sm:px-6 sm:py-12'>
                <UtensilsCrossed className='text-muted-foreground/60 mx-auto mb-2 h-10 w-10 sm:h-12 sm:w-12' />
                <p className='text-muted-foreground text-sm'>
                  Brak dostępnych zamienników dla tego przepisu.
                </p>
              </div>
            )}

            {!isLoading && !error && replacements.length > 0 && (
              <div className='space-y-2 sm:space-y-3'>
                {/* Aktualny przepis */}
                <div className='relative flex gap-3 rounded-lg border-2 border-white bg-white/40 p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl sm:gap-4 sm:rounded-2xl sm:p-3'>
                  {/* Aktualny Badge - prawy górny róg */}
                  <div className='bg-primary absolute top-1.5 right-2 flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase sm:top-2 sm:right-4 sm:px-2 sm:text-xs'>
                    Aktualny
                  </div>

                  <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-white/60 sm:h-20 sm:w-20'>
                    {meal.recipe.image_url ? (
                      <Image
                        src={meal.recipe.image_url}
                        alt={meal.recipe.name}
                        fill
                        className='object-cover grayscale-[10%]'
                        sizes='(max-width: 640px) 64px, 80px'
                      />
                    ) : (
                      <div className='text-text-muted flex h-full w-full items-center justify-center'>
                        <UtensilsCrossed className='h-8 w-8 sm:h-10 sm:w-10' />
                      </div>
                    )}
                  </div>

                  <div className='flex flex-1 flex-col justify-center'>
                    <div className='mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2'>
                      {/* Calories Badge */}
                      <div className='bg-primary shadow-primary/20 flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 text-[10px] text-white shadow-sm sm:gap-1 sm:px-2 sm:text-xs'>
                        <Flame className='h-2.5 w-2.5 sm:h-3 sm:w-3' />
                        <span className='font-bold'>
                          {originalCalories}
                        </span>{' '}
                        kcal
                      </div>
                    </div>

                    <h3 className='text-text-main mb-1.5 text-sm leading-tight font-bold sm:mb-2 sm:text-base'>
                      {meal.recipe.name}
                    </h3>

                    <div className='flex flex-wrap items-center gap-2.5 text-xs text-black sm:gap-4 sm:text-sm'>
                      <div className='flex items-center gap-1' title='Tłuszcze'>
                        <Droplet className='text-success h-4 w-4 sm:h-5 sm:w-5' />
                        <span className='text-text-secondary flex items-baseline gap-0.5'>
                          <span className='font-bold'>
                            {Math.round(currentNutrition.fats_g)}
                          </span>
                          <span>g</span>
                        </span>
                      </div>
                      <div
                        className='flex items-center gap-1'
                        title='Węglowodany'
                      >
                        <Wheat className='text-tertiary h-4 w-4 sm:h-5 sm:w-5' />
                        <span className='text-text-secondary flex items-baseline gap-0.5'>
                          <span className='font-bold'>
                            {Math.round(currentNutrition.carbs_g)}
                          </span>
                          <span>g</span>
                        </span>
                      </div>
                      <div className='flex items-center gap-1' title='Białko'>
                        <Beef className='text-info h-4 w-4 sm:h-5 sm:w-5' />
                        <span className='text-text-secondary flex items-baseline gap-0.5'>
                          <span className='font-bold'>
                            {Math.round(currentNutrition.protein_g)}
                          </span>
                          <span>g</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nagłówek listy zamienników */}
                <div className='py-1.5 sm:py-2'>
                  <p className='text-muted-foreground text-xs sm:text-sm'>
                    Wybierz zamiennik o podobnej kaloryczności (±15%)
                  </p>
                </div>

                {replacements.map((replacement) => {
                  const isSelected = selectedRecipeId === replacement.id

                  return (
                    <button
                      key={replacement.id}
                      onClick={() => setSelectedRecipeId(replacement.id)}
                      className={cn(
                        'relative flex w-full gap-3 rounded-lg border-2 bg-white/40 p-2.5 text-left shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-all hover:scale-[1.01] sm:gap-4 sm:rounded-2xl sm:p-3',
                        isSelected ? 'border-primary' : 'border-white'
                      )}
                    >
                      {/* Zobacz Button - prawy górny róg */}
                      <span
                        role='button'
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewRecipeId(replacement.id)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation()
                            setPreviewRecipeId(replacement.id)
                          }
                        }}
                        className='text-text-main hover:text-primary absolute top-1.5 right-2 flex cursor-pointer items-center gap-1 rounded-sm bg-white px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-colors sm:top-2 sm:right-4 sm:px-2 sm:text-xs'
                      >
                        Zobacz
                      </span>

                      <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-white/60 sm:h-20 sm:w-20'>
                        {replacement.image_url ? (
                          <Image
                            src={replacement.image_url}
                            alt={replacement.name}
                            fill
                            className='object-cover grayscale-[10%]'
                            sizes='(max-width: 640px) 64px, 80px'
                          />
                        ) : (
                          <div className='text-text-muted flex h-full w-full items-center justify-center'>
                            <UtensilsCrossed className='h-8 w-8 sm:h-10 sm:w-10' />
                          </div>
                        )}
                      </div>

                      <div className='flex flex-1 flex-col justify-center'>
                        <div className='mb-1.5 flex flex-wrap items-center gap-1.5 sm:mb-2 sm:gap-2'>
                          {/* Calories Badge */}
                          <div className='bg-primary shadow-primary/20 flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 text-[10px] text-white shadow-sm sm:gap-1 sm:px-2 sm:text-xs'>
                            <Flame className='h-2.5 w-2.5 sm:h-3 sm:w-3' />
                            <span className='font-bold'>
                              {replacement.total_calories}
                            </span>{' '}
                            kcal
                          </div>
                        </div>

                        <h3 className='text-text-main mb-1.5 text-sm leading-tight font-bold sm:mb-2 sm:text-base'>
                          {replacement.name}
                        </h3>

                        <div className='flex flex-wrap items-center gap-2.5 text-xs text-black sm:gap-4 sm:text-sm'>
                          <div
                            className='flex items-center gap-1'
                            title='Tłuszcze'
                          >
                            <Droplet className='text-success h-4 w-4 sm:h-5 sm:w-5' />
                            <span className='text-text-secondary flex items-baseline gap-0.5'>
                              <span className='font-bold'>
                                {Math.round(replacement.total_fats_g ?? 0)}
                              </span>
                              <span>g</span>
                            </span>
                          </div>
                          <div
                            className='flex items-center gap-1'
                            title='Węglowodany'
                          >
                            <Wheat className='text-tertiary h-4 w-4 sm:h-5 sm:w-5' />
                            <span className='text-text-secondary flex items-baseline gap-0.5'>
                              <span className='font-bold'>
                                {Math.round(replacement.total_carbs_g ?? 0)}
                              </span>
                              <span>g</span>
                            </span>
                          </div>
                          <div
                            className='flex items-center gap-1'
                            title='Białko'
                          >
                            <Beef className='text-info h-4 w-4 sm:h-5 sm:w-5' />
                            <span className='text-text-secondary flex items-baseline gap-0.5'>
                              <span className='font-bold'>
                                {Math.round(replacement.total_protein_g ?? 0)}
                              </span>
                              <span>g</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <div className='flex flex-shrink-0 justify-center border-t-2 border-white bg-[var(--bg-card)] p-3 sm:p-4'>
            <Button
              onClick={handleSwap}
              disabled={!selectedRecipeId || isSwapping}
              className='h-7 rounded-sm px-6 text-sm font-bold tracking-wide uppercase'
            >
              {isSwapping ? (
                <>
                  <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin sm:mr-2 sm:h-4 sm:w-4' />
                  ZMIENIAM...
                </>
              ) : (
                'ZMIEŃ PRZEPIS'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal podglądu przepisu - poza głównym Dialog aby uniknąć propagacji zamknięcia */}
      {previewRecipe && (
        <RecipePreviewModal
          recipe={previewRecipe}
          isOpen={!!previewRecipeId}
          onClose={() => setPreviewRecipeId(null)}
        />
      )}
    </>
  )
}
