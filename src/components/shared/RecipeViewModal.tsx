/**
 * RecipeViewModal - Unified modal for recipe preview
 *
 * Features:
 * - View recipe details with ingredient editing (gramatur adjustment)
 * - Mobile step-by-step mode with filtered ingredients per step
 * - Optional save functionality (for dashboard/meal-plan context)
 *
 * Usage:
 * - View only: pass recipe + onClose
 * - With save: pass recipe + onClose + saveConfig
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RecipeDetailClient } from '@/components/recipes/detail/RecipeDetailClient'
import { EditableIngredientRow } from '@/components/dashboard/EditableIngredientRow'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  Wheat,
  Beef,
  Droplet,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { useUserRatingQuery } from '@/lib/react-query/queries/useUserRatingQuery'
import type { RecipeDTO } from '@/types/dto.types'
import type { Enums } from '@/types/database.types'

/**
 * Fallback UI dla błędów w RecipeViewModal
 */
function RecipeViewModalErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='flex min-h-[300px] flex-col items-center justify-center rounded-lg p-6 text-center'>
      <AlertTriangle className='mb-4 h-12 w-12 text-red-500' />
      <h3 className='mb-2 text-lg font-bold text-gray-800'>
        Błąd podczas wyświetlania przepisu
      </h3>
      <p className='mb-4 text-sm text-gray-600'>
        Przepraszamy, wystąpił nieoczekiwany błąd.
      </p>
      <Button variant='outline' onClick={onRetry} className='gap-2'>
        <RefreshCw className='h-4 w-4' />
        Spróbuj ponownie
      </Button>
    </div>
  )
}

interface IngredientEditorApi {
  getIngredientAmount: (ingredientId: number) => number
  isAutoAdjusted: (ingredientId: number) => boolean
  updateIngredientAmount: (
    ingredientId: number,
    newAmount: number
  ) => { success: boolean; error?: string; warning?: string }
  incrementAmount: (ingredientId: number) => {
    success: boolean
    error?: string
    warning?: string
  }
  decrementAmount: (ingredientId: number) => {
    success: boolean
    error?: string
    warning?: string
  }
  adjustedNutrition: {
    calories: number
    protein_g: number
    carbs_g: number
    /** Błonnik pokarmowy */
    fiber_g: number
    /** Węglowodany netto (Net Carbs) - kluczowe dla keto */
    net_carbs_g: number
    fats_g: number
  } | null
}

interface SaveConfig {
  hasChanges: boolean
  isSaving: boolean
  isSaveSuccessful: boolean
  saveError: string | null
  onSave: () => void
}

interface RecipeViewModalProps {
  recipe: RecipeDTO
  isOpen: boolean
  onClose: () => void
  /** Ingredient editor API - controls amount changes */
  ingredientEditor: IngredientEditorApi
  /** Optional save config - when provided, shows save button */
  saveConfig?: SaveConfig
  /** Test ID for the modal */
  testId?: string
  /** Whether to prevent closing on outside click (for nested modals) */
  preventOutsideClose?: boolean
  /** Z-index class for stacking (for nested modals) */
  zIndexClass?: string
  /** External checked ingredients state (persisted by parent) */
  checkedIngredients?: Set<number>
  /** Callback to toggle checked state (persisted by parent) */
  onToggleChecked?: (ingredientId: number) => void
  /** Selected meal type from the card that was clicked (for recipes with multiple meal types) */
  selectedMealType?: Enums<'meal_type_enum'> | null
  /** Whether the user is authenticated (for rating functionality) */
  isAuthenticated?: boolean
}

/**
 * Unified recipe view modal with step-by-step mode and optional save
 */
export function RecipeViewModal({
  recipe,
  isOpen,
  onClose,
  ingredientEditor,
  saveConfig,
  testId = 'recipe-view-modal',
  preventOutsideClose = false,
  zIndexClass,
  checkedIngredients: externalCheckedIngredients,
  onToggleChecked: externalToggleChecked,
  selectedMealType,
  isAuthenticated = false,
}: RecipeViewModalProps) {
  // Mobile step-by-step mode state
  const [isStepMode, setIsStepMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0)

  // Pobierz ocenę użytkownika dla tego przepisu
  const { data: userRating } = useUserRatingQuery({
    recipeId: recipe.id,
    enabled: isOpen && isAuthenticated,
  })

  // Local checked ingredients state (fallback if no external state provided)
  const [localCheckedIngredients, setLocalCheckedIngredients] = useState<
    Set<number>
  >(new Set())

  // Use external state if provided, otherwise use local state
  const checkedIngredients =
    externalCheckedIngredients ?? localCheckedIngredients

  const isIngredientChecked = useCallback(
    (ingredientId: number) => checkedIngredients.has(ingredientId),
    [checkedIngredients]
  )

  const toggleIngredient = useCallback(
    (ingredientId: number) => {
      // Use external handler if provided
      if (externalToggleChecked) {
        externalToggleChecked(ingredientId)
        return
      }

      // Otherwise use local state
      setLocalCheckedIngredients((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(ingredientId)) {
          newSet.delete(ingredientId)
        } else {
          newSet.add(ingredientId)
        }
        return newSet
      })
    },
    [externalToggleChecked]
  )

  // Destructure ingredient editor API
  const {
    getIngredientAmount,
    isAutoAdjusted,
    updateIngredientAmount,
    incrementAmount,
    decrementAmount,
    adjustedNutrition,
  } = ingredientEditor

  // Reset step mode when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsStepMode(false)
      setCurrentStep(1)
    }
  }, [isOpen])

  // Calculate total steps from instructions
  const totalSteps = Array.isArray(recipe.instructions)
    ? recipe.instructions.length
    : 0

  // Sorted instructions for step mode
  const sortedInstructions = Array.isArray(recipe.instructions)
    ? [...recipe.instructions].sort((a, b) => a.step - b.step)
    : []

  // Get ingredients for current step (filter by step_number from database)
  const getCurrentStepIngredients = () => {
    return recipe.ingredients.filter(
      (ingredient) => ingredient.step_number === currentStep
    )
  }

  const currentStepIngredients = getCurrentStepIngredients()

  // Step navigation
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={preventOutsideClose ? () => {} : handleOpenChange}
    >
      <DialogContent
        data-testid={testId}
        coverMainPanel
        hideCloseButton
        onInteractOutside={
          preventOutsideClose ? (e) => e.preventDefault() : undefined
        }
        onPointerDownOutside={
          preventOutsideClose ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          preventOutsideClose
            ? (e) => {
                e.preventDefault()
                onClose()
              }
            : undefined
        }
        onOpenAutoFocus={
          preventOutsideClose ? (e) => e.preventDefault() : undefined
        }
        className={cn(
          'flex flex-col overflow-hidden rounded-md border-2 border-white bg-white/60 p-0 shadow-2xl backdrop-blur-md sm:rounded-2xl md:rounded-3xl',
          zIndexClass
        )}
      >
        {/* Fixed Header */}
        <div className='relative flex-shrink-0 border-b-2 border-white bg-[var(--bg-card)] p-4 pb-3'>
          <DialogTitle className='text-text-main pr-8 text-base font-bold sm:text-lg lg:pr-0 lg:text-center lg:text-2xl'>
            {recipe.name}
          </DialogTitle>
          {preventOutsideClose ? (
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
          ) : (
            <DialogClose className='absolute top-1/2 right-3 -translate-y-1/2 opacity-70 transition-opacity hover:opacity-100'>
              <X className='h-5 w-5' />
              <span className='sr-only'>Zamknij</span>
            </DialogClose>
          )}
        </div>

        {/* Scrollable Content - different layout for step mode on mobile */}
        <div className='custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto'>
          <ErrorBoundary
            key={errorBoundaryKey}
            fallback={
              <RecipeViewModalErrorFallback
                onRetry={() => setErrorBoundaryKey((k) => k + 1)}
              />
            }
          >
            {/* Mobile Step Mode: Step panel takes entire content area */}
            {isStepMode && totalSteps > 0 ? (
              <div className='flex h-full flex-col gap-3 p-3 lg:hidden'>
                {/* Macro badges panel */}
                <div className='flex items-center justify-center gap-4 rounded-[12px] border-2 border-white bg-[var(--bg-card)] p-2 shadow-[var(--shadow-card)]'>
                  {/* Calories */}
                  <div className='flex h-[22px] items-center gap-1 rounded-sm bg-red-600 px-2 text-[10px] text-white shadow-sm shadow-red-500/20'>
                    <Flame className='h-3 w-3' />
                    <span className='font-bold'>
                      {Math.round(
                        adjustedNutrition?.calories ??
                          recipe.total_calories ??
                          0
                      )}
                    </span>
                    <span className='font-normal'>kcal</span>
                  </div>
                  {/* Macros */}
                  <div className='flex items-center gap-3 text-sm'>
                    <div className='flex items-center gap-1.5' title='Tłuszcze'>
                      <div className='flex h-5 w-5 items-center justify-center rounded-sm bg-green-400'>
                        <Droplet className='h-3 w-3 text-white' />
                      </div>
                      <span className='text-[11px] text-gray-700'>
                        <span className='font-bold'>
                          {Math.round(
                            adjustedNutrition?.fats_g ??
                              recipe.total_fats_g ??
                              0
                          )}
                        </span>{' '}
                        g
                      </span>
                    </div>
                    <div
                      className='flex items-center gap-1.5'
                      title='Węglowodany netto (Net Carbs)'
                    >
                      <div className='flex h-5 w-5 items-center justify-center rounded-sm bg-orange-400'>
                        <Wheat className='h-3 w-3 text-white' />
                      </div>
                      <span className='text-[11px] text-gray-700'>
                        <span className='font-bold'>
                          {Math.round(
                            adjustedNutrition?.net_carbs_g ??
                              recipe.total_net_carbs_g ??
                              0
                          )}
                        </span>{' '}
                        g
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5' title='Białko'>
                      <div className='flex h-5 w-5 items-center justify-center rounded-sm bg-blue-400'>
                        <Beef className='h-3 w-3 text-white' />
                      </div>
                      <span className='text-[11px] text-gray-700'>
                        <span className='font-bold'>
                          {Math.round(
                            adjustedNutrition?.protein_g ??
                              recipe.total_protein_g ??
                              0
                          )}
                        </span>{' '}
                        g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step panel */}
                <div className='relative flex flex-1 flex-col rounded-[12px] border-2 border-white bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)]'>
                  {/* Save button - absolute positioned in top right corner */}
                  {saveConfig?.hasChanges &&
                    !saveConfig?.isSaveSuccessful &&
                    saveConfig?.onSave && (
                      <Button
                        onClick={saveConfig.onSave}
                        disabled={saveConfig.isSaving}
                        size='sm'
                        className='absolute top-2 right-2 h-[22px] rounded-sm bg-red-600 px-2 text-[10px] font-bold text-white shadow-sm shadow-red-500/20 hover:bg-red-700'
                      >
                        {saveConfig.isSaving ? 'Zapisuję...' : 'Zapisz'}
                      </Button>
                    )}
                  {saveConfig?.isSaveSuccessful && (
                    <span className='absolute top-2 right-2 text-[10px] font-bold text-red-600'>
                      ✓ Zapisano
                    </span>
                  )}

                  {/* Header: step number */}
                  <div className='mb-3 pl-1'>
                    <h3 className='text-base font-bold text-gray-800'>
                      Krok {currentStep} z {totalSteps}
                    </h3>
                  </div>

                  {/* Ingredients for current step */}
                  {currentStepIngredients.length > 0 && (
                    <div className='mb-3'>
                      <ul className='divide-y divide-gray-100'>
                        {currentStepIngredients.map((ingredient) => (
                          <EditableIngredientRow
                            key={ingredient.id}
                            ingredient={ingredient}
                            currentAmount={getIngredientAmount(ingredient.id)}
                            isAutoAdjusted={isAutoAdjusted(ingredient.id)}
                            onAmountChange={updateIngredientAmount}
                            onIncrement={incrementAmount}
                            onDecrement={decrementAmount}
                            isChecked={isIngredientChecked(ingredient.id)}
                            onToggleChecked={toggleIngredient}
                            onExclude={(id) => updateIngredientAmount(id, 0)}
                            compact
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Step description */}
                  <div className='flex flex-1 items-start gap-3'>
                    <div className='bg-primary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] text-base font-bold text-white'>
                      {currentStep}
                    </div>
                    <p className='flex-1 text-sm leading-relaxed font-medium text-gray-700'>
                      {sortedInstructions[currentStep - 1]?.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Desktop: always show RecipeDetailClient */}
            {/* Mobile: show RecipeDetailClient only when NOT in step mode */}
            {!isStepMode && (
              <RecipeDetailClient
                recipe={recipe}
                showBackButton={false}
                enableIngredientEditing={true}
                getIngredientAmount={getIngredientAmount}
                isAutoAdjusted={isAutoAdjusted}
                updateIngredientAmount={updateIngredientAmount}
                incrementAmount={incrementAmount}
                decrementAmount={decrementAmount}
                adjustedNutrition={adjustedNutrition ?? undefined}
                hasChanges={saveConfig?.hasChanges ?? false}
                isSaving={saveConfig?.isSaving ?? false}
                onSave={saveConfig?.onSave}
                saveError={saveConfig?.saveError ?? null}
                isSaveSuccessful={saveConfig?.isSaveSuccessful ?? false}
                isStepMode={isStepMode}
                currentStep={currentStep}
                onOpenStepMode={openStepMode}
                totalSteps={totalSteps}
                hideStepsButton={true}
                checkedIngredients={checkedIngredients}
                onToggleChecked={toggleIngredient}
                selectedMealType={selectedMealType}
                userRating={userRating ?? null}
                isAuthenticated={isAuthenticated}
              />
            )}
          </ErrorBoundary>
        </div>

        {/* Fixed Footer - Dots + Arrow to enter step mode (only when not in step mode) */}
        {totalSteps > 0 && !isStepMode && (
          <div className='flex-shrink-0 lg:hidden'>
            <div className='flex items-center justify-between border-t-2 border-white bg-[var(--bg-card)] p-3'>
              <div className='h-7 w-7' />

              <div className='flex items-center gap-1.5'>
                {/* First dot represents main screen (active here) */}
                <div className='bg-primary h-2 w-5 rounded-full' />
                {/* Remaining dots represent steps (clickable to enter step mode) */}
                {sortedInstructions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentStep(index + 1)
                      setIsStepMode(true)
                    }}
                    className='bg-border hover:bg-text-muted h-2 w-2 rounded-full transition-all'
                    aria-label={`Przejdź do kroku ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant='outline'
                onClick={openStepMode}
                className='flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white/60 p-0 shadow-md backdrop-blur-sm'
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}

        {/* Fixed Footer - Step navigation (only in step mode) */}
        {totalSteps > 0 && isStepMode && (
          <div className='flex-shrink-0 lg:hidden'>
            <div className='flex items-center justify-between border-t-2 border-white bg-[var(--bg-card)] p-3'>
              <Button
                variant='outline'
                onClick={currentStep === 1 ? closeStepMode : goToPrevStep}
                className='flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white/60 p-0 shadow-md backdrop-blur-sm'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>

              <div className='flex items-center gap-1.5'>
                {/* First dot represents main screen (clickable to exit step mode) */}
                <button
                  onClick={closeStepMode}
                  className='bg-border hover:bg-text-muted h-2 w-2 rounded-full transition-all'
                  aria-label='Powrót do przepisu'
                />
                {/* Remaining dots represent steps */}
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

              {currentStep < totalSteps ? (
                <Button
                  variant='outline'
                  onClick={goToNextStep}
                  className='flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white/60 p-0 shadow-md backdrop-blur-sm'
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              ) : (
                <div className='h-7 w-7' />
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
