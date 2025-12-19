/**
 * RecipePreviewModal - Modal podglądu przepisu (tylko do odczytu)
 * Używany w SwapRecipeDialog do podglądu zamienników
 */

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RecipeDetailClient } from '@/components/recipes/detail/RecipeDetailClient'
import { useIngredientViewer } from '@/hooks/useIngredientViewer'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipePreviewModalProps {
  recipe: RecipeDTO
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal podglądu przepisu - wersja tylko do odczytu
 * Używany w SwapRecipeDialog do podglądu zamienników bez edycji
 */
export function RecipePreviewModal({
  recipe,
  isOpen,
  onClose,
}: RecipePreviewModalProps) {
  // Mobile step-by-step mode state
  const [isStepMode, setIsStepMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const {
    adjustedNutrition,
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
  } = useIngredientViewer({ recipe })

  // Reset step mode when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsStepMode(false)
      setCurrentStep(1)
    }
  }, [isOpen])

  // Oblicz total steps z instrukcji
  const totalSteps = Array.isArray(recipe.instructions)
    ? recipe.instructions.length
    : 0

  // Sortowane instrukcje dla step mode
  const sortedInstructions = Array.isArray(recipe.instructions)
    ? [...recipe.instructions].sort((a, b) => a.step - b.step)
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

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        data-testid='recipe-preview-modal'
        coverMainPanel
        hideCloseButton
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          onClose()
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
        className='z-[60] flex flex-col overflow-hidden rounded-md border-2 border-white bg-white/40 p-0 shadow-2xl backdrop-blur-md sm:rounded-2xl md:rounded-3xl'
      >
        {/* Fixed Header */}
        <div className='relative flex-shrink-0 border-b-2 border-white bg-[var(--bg-card)] p-4 pb-3'>
          <DialogTitle className='text-text-main pr-8 text-center text-base font-bold sm:pr-8 sm:text-left sm:text-lg lg:pr-0 lg:text-center lg:text-2xl'>
            {recipe.name}
          </DialogTitle>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            onTouchEnd={(e) => {
              e.stopPropagation()
            }}
            className='absolute top-1/2 right-3 -translate-y-1/2 opacity-70 transition-opacity hover:opacity-100'
          >
            <X className='h-5 w-5' />
            <span className='sr-only'>Zamknij</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className='custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto'>
          <RecipeDetailClient
            recipe={recipe}
            showBackButton={false}
            enableIngredientEditing={true}
            getIngredientAmount={getIngredientAmount}
            isAutoAdjusted={isAutoAdjusted}
            updateIngredientAmount={updateIngredientAmount}
            incrementAmount={incrementAmount}
            decrementAmount={decrementAmount}
            adjustedNutrition={adjustedNutrition}
            hasChanges={false}
            isSaving={false}
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
                  className='bg-primary shadow-primary/30 hover:bg-primary-hover h-7 rounded-sm px-6 text-sm font-bold tracking-wide text-white shadow-lg transition-transform active:scale-95'
                >
                  KROKI
                </Button>
              </div>
            ) : (
              /* Panel kroków */
              <div className='border-t-2 border-white bg-[var(--bg-card)] p-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]'>
                {/* Header: numer kroku + przycisk zamknięcia */}
                <div className='mb-3 flex items-center justify-between'>
                  <h3 className='text-text-main text-base font-bold'>
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
                  <div className='bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white'>
                    {currentStep}
                  </div>
                  <p className='text-text-main flex-1 text-sm leading-relaxed font-medium'>
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
                            ? 'bg-primary w-5'
                            : 'bg-border hover:bg-text-muted w-2'
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
