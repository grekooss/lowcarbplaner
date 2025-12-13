'use client'

/**
 * NavigationButtons Component
 *
 * Navigation controls for onboarding flow
 * Handles back/next/submit actions
 */

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface NavigationButtonsProps {
  currentStep: number
  totalSteps: number
  canGoNext: boolean
  isLastStep: boolean
  isLoading?: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  nextButtonText?: string
  submitButtonText?: string
}

export function NavigationButtons({
  currentStep,
  canGoNext,
  isLastStep,
  isLoading = false,
  onBack,
  onNext,
  onSubmit,
  nextButtonText = 'Dalej',
  submitButtonText = 'Wygeneruj plan',
}: NavigationButtonsProps) {
  const isFirstStep = currentStep === 1

  // First step: single button full width
  if (isFirstStep) {
    return (
      <div className='flex justify-center'>
        <Button
          type='button'
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className='w-full gap-2'
          size='lg'
        >
          <span>{nextButtonText}</span>
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    )
  }

  // Other steps: back and next buttons in a row
  return (
    <div className='flex items-center justify-between gap-3'>
      {/* Back Button */}
      <Button
        type='button'
        variant='outline'
        onClick={onBack}
        disabled={isLoading}
        className='gap-2'
        size='lg'
      >
        <ChevronLeft className='h-4 w-4' />
        <span className='hidden sm:inline'>Wstecz</span>
        <span className='sm:hidden'>Cofnij</span>
      </Button>

      {/* Next/Submit Button */}
      {isLastStep ? (
        <Button
          type='button'
          onClick={onSubmit}
          disabled={!canGoNext || isLoading}
          className='gap-2'
          size='lg'
        >
          {isLoading ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span className='hidden sm:inline'>Generowanie...</span>
              <span className='sm:hidden'>Tworzenie...</span>
            </>
          ) : (
            <>
              <span className='hidden sm:inline'>{submitButtonText}</span>
              <span className='sm:hidden'>Wygeneruj</span>
            </>
          )}
        </Button>
      ) : (
        <Button
          type='button'
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className='gap-2'
          size='lg'
        >
          <span className='hidden sm:inline'>{nextButtonText}</span>
          <span className='sm:hidden'>Dalej</span>
          <ChevronRight className='h-4 w-4' />
        </Button>
      )}
    </div>
  )
}
