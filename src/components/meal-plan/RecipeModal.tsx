'use client'

/**
 * RecipeModal - Modal ze szczegółowym podglądem przepisu
 * Używa tego samego layoutu co RecipeDetailClient
 * W kontekście Dashboard - pokazuje inline ingredient editing
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RecipeDetailClient } from '@/components/recipes/detail/RecipeDetailClient'
import { useIngredientEditor } from '@/hooks/useIngredientEditor'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { PlannedMealDTO, RecipeDTO } from '@/types/dto.types'

interface RecipeModalProps {
  isOpen: boolean
  meal: PlannedMealDTO | null
  onOpenChange: (open: boolean) => void
  /**
   * Enable ingredient editing (only for Dashboard)
   */
  enableIngredientEditing?: boolean
}

/**
 * Modal z podglądem przepisu
 * Wyświetla pełne szczegóły przepisu bez konieczności nawigacji
 * W trybie edycji (Dashboard) - umożliwia dostosowanie gramatur składników inline
 */
export const RecipeModal = ({
  isOpen,
  meal,
  onOpenChange,
  enableIngredientEditing = false,
}: RecipeModalProps) => {
  const [isSaveSuccessful, setIsSaveSuccessful] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mobile step-by-step mode state
  const [isStepMode, setIsStepMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const {
    hasChanges,
    adjustedNutrition,
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
    saveChanges,
    isSaving,
  } = useIngredientEditor({
    mealId: meal?.id ?? 0,
    recipe: meal?.recipe ?? ({ ingredients: [] } as unknown as RecipeDTO),
    initialOverrides: meal?.ingredient_overrides ?? null,
  })

  const handleSave = () => {
    setError(null)
    saveChanges(undefined, {
      onSuccess: () => {
        setIsSaveSuccessful(true)
        // Don't reset immediately - wait for hasChanges to become false
      },
      onError: (err) => {
        setError(
          err instanceof Error ? err.message : 'Nie udało się zapisać zmian'
        )
      },
    })
  }

  // Reset success message after hasChanges becomes false (data synced)
  useEffect(() => {
    if (isSaveSuccessful && !hasChanges) {
      const timer = setTimeout(() => {
        setIsSaveSuccessful(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSaveSuccessful, hasChanges])

  // Reset step mode when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsStepMode(false)
      setCurrentStep(1)
    }
  }, [isOpen])

  // Oblicz total steps z instrukcji
  const totalSteps = meal?.recipe?.instructions
    ? Array.isArray(meal.recipe.instructions)
      ? meal.recipe.instructions.length
      : 0
    : 0

  // Sortowane instrukcje dla step mode
  const sortedInstructions = meal?.recipe?.instructions
    ? Array.isArray(meal.recipe.instructions)
      ? [...meal.recipe.instructions].sort((a, b) => a.step - b.step)
      : []
    : []

  // Nawigacja step mode
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const openStepMode = () => {
    setCurrentStep(1)
    setIsStepMode(true)
  }

  const closeStepMode = () => {
    setIsStepMode(false)
  }

  if (!meal) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid='recipe-modal'
        coverMainPanel
        hideCloseButton
        className='flex flex-col overflow-hidden rounded-md border-2 border-white bg-white/40 p-0 shadow-2xl backdrop-blur-md sm:rounded-2xl md:rounded-3xl'
      >
        {/* Fixed Header */}
        <div className='relative flex-shrink-0 border-b-2 border-white bg-[var(--bg-card)] p-4 pb-3'>
          <DialogTitle className='pr-8 text-base font-bold text-gray-800 sm:text-lg lg:pr-0 lg:text-center lg:text-2xl'>
            {meal.recipe.name}
          </DialogTitle>
          <DialogClose className='absolute top-1/2 right-3 -translate-y-1/2 opacity-70 transition-opacity hover:opacity-100'>
            <X className='h-5 w-5' />
            <span className='sr-only'>Zamknij</span>
          </DialogClose>
        </div>

        {/* Scrollable Content */}
        <div className='custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto'>
          <RecipeDetailClient
            recipe={meal.recipe}
            showBackButton={false}
            enableIngredientEditing={enableIngredientEditing}
            getIngredientAmount={getIngredientAmount}
            isAutoAdjusted={isAutoAdjusted}
            updateIngredientAmount={
              enableIngredientEditing ? updateIngredientAmount : undefined
            }
            incrementAmount={
              enableIngredientEditing ? incrementAmount : undefined
            }
            decrementAmount={
              enableIngredientEditing ? decrementAmount : undefined
            }
            adjustedNutrition={adjustedNutrition}
            hasChanges={hasChanges}
            isSaving={isSaving}
            onSave={handleSave}
            saveError={error}
            isSaveSuccessful={isSaveSuccessful}
            isStepMode={isStepMode}
            currentStep={currentStep}
            onOpenStepMode={openStepMode}
            totalSteps={totalSteps}
            hideStepsButton={true}
          />
        </div>

        {/* Fixed Footer - przycisk KROKI lub panel kroków (tylko mobile) */}
        {totalSteps > 0 && (
          <div className='flex-shrink-0 lg:hidden'>
            {!isStepMode ? (
              /* Przycisk KROKI */
              <div className='flex justify-center border-t-2 border-white bg-[var(--bg-card)] p-3'>
                <Button
                  onClick={openStepMode}
                  className='h-7 rounded-sm bg-red-600 px-6 text-sm font-bold tracking-wide text-white shadow-lg shadow-red-500/30 transition-transform hover:bg-red-700 active:scale-95'
                >
                  KROKI
                </Button>
              </div>
            ) : (
              /* Panel kroków */
              <div className='border-t-2 border-white bg-[var(--bg-card)] p-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]'>
                {/* Header: numer kroku + przycisk zamknięcia */}
                <div className='mb-3 flex items-center justify-between'>
                  <h3 className='text-base font-bold text-gray-800'>
                    Krok {currentStep} z {totalSteps}
                  </h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={closeStepMode}
                    className='h-8 w-8 rounded-full p-0'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                {/* Opis kroku */}
                <div className='mb-4 flex items-start gap-3'>
                  <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white'>
                    {currentStep}
                  </div>
                  <p className='flex-1 text-sm leading-relaxed font-medium text-gray-800'>
                    {sortedInstructions[currentStep - 1]?.description}
                  </p>
                </div>

                {/* Nawigacja: strzałka lewa + kropki + strzałka prawa */}
                <div className='flex items-center justify-between'>
                  <Button
                    variant='outline'
                    onClick={goToPrevStep}
                    disabled={currentStep === 1}
                    className='flex h-10 w-10 items-center justify-center rounded-full p-0 disabled:opacity-30'
                  >
                    <ChevronLeft className='h-5 w-5' />
                  </Button>

                  <div className='flex items-center gap-1.5'>
                    {sortedInstructions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStep(index + 1)}
                        className={cn(
                          'h-2 rounded-full transition-all',
                          index + 1 === currentStep
                            ? 'w-5 bg-red-600'
                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                        )}
                        aria-label={`Krok ${index + 1}`}
                      />
                    ))}
                  </div>

                  <Button
                    variant='outline'
                    onClick={goToNextStep}
                    disabled={currentStep === totalSteps}
                    className='flex h-10 w-10 items-center justify-center rounded-full p-0 disabled:opacity-30'
                  >
                    <ChevronRight className='h-5 w-5' />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
