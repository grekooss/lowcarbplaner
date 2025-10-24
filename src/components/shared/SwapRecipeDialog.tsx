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
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'
import { useReplacementRecipes } from '@/hooks/useReplacementRecipes'
import { useSwapRecipe } from '@/hooks/useSwapRecipe'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
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
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <RefreshCw className='h-5 w-5' />
            Zmień przepis: {meal.recipe.name}
          </DialogTitle>
          <DialogDescription>
            {MEAL_TYPE_LABELS[meal.meal_type]} • {originalCalories} kcal
            <br />
            Wybierz zamiennik o podobnej kaloryczności (±15%)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[500px] pr-4'>
          {isLoading && (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
            </div>
          )}

          {error && (
            <div className='text-destructive rounded-lg bg-red-50 p-4 text-sm'>
              Błąd podczas wczytywania zamienników: {(error as Error).message}
            </div>
          )}

          {!isLoading && !error && replacements.length === 0 && (
            <div className='text-muted-foreground py-12 text-center'>
              <UtensilsCrossed className='mx-auto mb-2 h-12 w-12' />
              <p>Brak dostępnych zamienników dla tego przepisu.</p>
            </div>
          )}

          {!isLoading && !error && replacements.length > 0 && (
            <div className='space-y-2'>
              {replacements.map((replacement) => {
                const isSelected = selectedRecipeId === replacement.id
                const caloriesDiff = replacement.calorie_diff
                const diffPercent = Math.abs(
                  (caloriesDiff / originalCalories) * 100
                )

                return (
                  <button
                    key={replacement.id}
                    onClick={() => setSelectedRecipeId(replacement.id)}
                    className={cn(
                      'border-border/60 flex w-full items-start gap-4 rounded-xl border bg-white p-4 text-left transition-all hover:shadow-md',
                      isSelected && 'ring-primary ring-2'
                    )}
                  >
                    <div className='bg-muted relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl'>
                      {replacement.image_url ? (
                        <Image
                          src={replacement.image_url}
                          alt={replacement.name}
                          fill
                          className='object-cover'
                          sizes='80px'
                        />
                      ) : (
                        <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                          <UtensilsCrossed className='h-8 w-8' />
                        </div>
                      )}
                    </div>

                    <div className='flex flex-1 flex-col gap-2'>
                      <div className='flex items-start justify-between gap-2'>
                        <h4 className='text-base font-semibold'>
                          {replacement.name}
                        </h4>
                        {isSelected && (
                          <Badge className='bg-primary text-primary-foreground'>
                            Wybrano
                          </Badge>
                        )}
                      </div>

                      <div className='flex flex-wrap items-center gap-3 text-sm'>
                        <span className='font-semibold'>
                          {replacement.total_calories} kcal
                        </span>

                        <div className='flex items-center gap-1'>
                          {caloriesDiff > 0 ? (
                            <TrendingUp className='h-4 w-4 text-orange-500' />
                          ) : (
                            <TrendingDown className='h-4 w-4 text-green-600' />
                          )}
                          <span
                            className={cn(
                              'text-xs font-medium',
                              caloriesDiff > 0
                                ? 'text-orange-600'
                                : 'text-green-600'
                            )}
                          >
                            {caloriesDiff > 0 ? '+' : ''}
                            {caloriesDiff} kcal ({diffPercent.toFixed(1)}%)
                          </span>
                        </div>

                        <span className='text-muted-foreground'>
                          C: {replacement.total_carbs_g}g
                        </span>
                        <span className='text-muted-foreground'>
                          P: {replacement.total_protein_g}g
                        </span>
                        <span className='text-muted-foreground'>
                          F: {replacement.total_fats_g}g
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className='flex justify-end gap-3 border-t pt-4'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSwapping}
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSwap}
            disabled={!selectedRecipeId || isSwapping}
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
