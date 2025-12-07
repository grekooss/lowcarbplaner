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
  RefreshCw,
  UtensilsCrossed,
  Flame,
  Wheat,
  Beef,
  Droplet,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'
import { useReplacementRecipes } from '@/hooks/useReplacementRecipes'
import { useSwapRecipe } from '@/hooks/useSwapRecipe'
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

  const {
    data: replacements = [],
    isLoading,
    error,
  } = useReplacementRecipes(meal.id, open)

  const { mutate: swapRecipe, isPending: isSwapping } = useSwapRecipe()

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        constrainToMainPanel
        className='max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-[20px] border-2 border-[var(--glass-border)] bg-white/40 p-0 shadow-[var(--shadow-elevated)] backdrop-blur-[20px]'
      >
        <div className='p-6 pb-4'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-gray-800'>
              Zmień przepis
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className='max-h-[calc(85vh-180px)] px-4'>
          {isLoading && (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
            </div>
          )}

          {error && (
            <div className='rounded-2xl border border-red-200/50 bg-red-50/50 p-4 text-sm text-red-600 backdrop-blur-sm'>
              Błąd podczas wczytywania zamienników: {(error as Error).message}
            </div>
          )}

          {!isLoading && !error && replacements.length === 0 && (
            <div className='rounded-2xl border border-[var(--glass-border)] bg-white/30 px-6 py-12 text-center backdrop-blur-sm'>
              <UtensilsCrossed className='text-muted-foreground/60 mx-auto mb-2 h-12 w-12' />
              <p className='text-muted-foreground'>
                Brak dostępnych zamienników dla tego przepisu.
              </p>
            </div>
          )}

          {!isLoading && !error && replacements.length > 0 && (
            <div className='space-y-3 px-2 pb-2'>
              {/* Aktualny przepis */}
              <div className='relative flex gap-4 rounded-2xl border-2 border-white bg-white/40 p-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl'>
                {/* Aktualny Badge - prawy górny róg */}
                <div className='absolute top-2 right-4 flex items-center gap-1 rounded-sm border border-white bg-white px-2 py-0.5 text-xs font-bold tracking-wider text-gray-800 uppercase'>
                  Aktualny
                </div>

                <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-white/60'>
                  {meal.recipe.image_url ? (
                    <Image
                      src={meal.recipe.image_url}
                      alt={meal.recipe.name}
                      fill
                      className='object-cover grayscale-[10%]'
                      sizes='96px'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-gray-400'>
                      <UtensilsCrossed className='h-10 w-10' />
                    </div>
                  )}
                </div>

                <div className='flex flex-1 flex-col justify-center'>
                  <div className='mb-2 flex flex-wrap items-center gap-2'>
                    {/* Calories Badge */}
                    <div className='flex items-center gap-1 rounded-sm bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm shadow-red-500/20'>
                      <Flame className='h-3 w-3' />
                      {originalCalories} kcal
                    </div>
                  </div>

                  <h3 className='mb-2 text-base leading-tight font-bold text-gray-800'>
                    {meal.recipe.name}
                  </h3>

                  <div className='flex flex-wrap items-center gap-4 text-sm font-medium text-black'>
                    <div
                      className='flex items-center gap-1.5'
                      title='Węglowodany'
                    >
                      <Wheat className='h-4 w-4 text-gray-900' />
                      <span className='font-bold text-gray-700'>
                        {Math.round(currentNutrition.carbs_g)}g
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5' title='Białko'>
                      <Beef className='h-4 w-4 text-gray-900' />
                      <span className='font-bold text-gray-700'>
                        {Math.round(currentNutrition.protein_g)}g
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5' title='Tłuszcze'>
                      <Droplet className='h-4 w-4 text-gray-900' />
                      <span className='font-bold text-gray-700'>
                        {Math.round(currentNutrition.fats_g)}g
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nagłówek listy zamienników */}
              <div className='py-2'>
                <p className='text-muted-foreground text-sm'>
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
                      'relative flex w-full gap-4 rounded-2xl border-2 bg-white/40 p-3 text-left shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-all hover:scale-[1.01]',
                      isSelected ? 'border-red-600' : 'border-white'
                    )}
                  >
                    {/* Wybrano Badge - prawy górny róg */}
                    {isSelected && (
                      <div className='absolute top-2 right-4 flex items-center gap-1 rounded-sm bg-red-600 px-2 py-0.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm shadow-red-500/20'>
                        Wybrano
                      </div>
                    )}

                    <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-white/60'>
                      {replacement.image_url ? (
                        <Image
                          src={replacement.image_url}
                          alt={replacement.name}
                          fill
                          className='object-cover grayscale-[10%]'
                          sizes='96px'
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-gray-400'>
                          <UtensilsCrossed className='h-10 w-10' />
                        </div>
                      )}
                    </div>

                    <div className='flex flex-1 flex-col justify-center'>
                      <div className='mb-2 flex flex-wrap items-center gap-2'>
                        {/* Calories Badge */}
                        <div className='flex items-center gap-1 rounded-sm bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm shadow-red-500/20'>
                          <Flame className='h-3 w-3' />
                          {replacement.total_calories} kcal
                        </div>
                      </div>

                      <h3 className='mb-2 text-base leading-tight font-bold text-gray-800'>
                        {replacement.name}
                      </h3>

                      <div className='flex flex-wrap items-center gap-4 text-sm font-medium text-black'>
                        <div
                          className='flex items-center gap-1.5'
                          title='Węglowodany'
                        >
                          <Wheat className='h-4 w-4 text-gray-900' />
                          <span className='font-bold text-gray-700'>
                            {Math.round(replacement.total_carbs_g ?? 0)}g
                          </span>
                        </div>
                        <div
                          className='flex items-center gap-1.5'
                          title='Białko'
                        >
                          <Beef className='h-4 w-4 text-gray-900' />
                          <span className='font-bold text-gray-700'>
                            {Math.round(replacement.total_protein_g ?? 0)}g
                          </span>
                        </div>
                        <div
                          className='flex items-center gap-1.5'
                          title='Tłuszcze'
                        >
                          <Droplet className='h-4 w-4 text-gray-900' />
                          <span className='font-bold text-gray-700'>
                            {Math.round(replacement.total_fats_g ?? 0)}g
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className='flex justify-end border-t border-[var(--glass-border)] bg-white/20 p-6'>
          <Button
            onClick={handleSwap}
            disabled={!selectedRecipeId || isSwapping}
            className='rounded-xl'
          >
            {isSwapping ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Zmieniam...
              </>
            ) : (
              <>
                <RefreshCw className='mr-2 h-4 w-4' />
                Zmień przepis
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
