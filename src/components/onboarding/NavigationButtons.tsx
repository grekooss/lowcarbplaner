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
  canGoBack: boolean
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
  canGoBack,
  canGoNext,
  isLastStep,
  isLoading = false,
  onBack,
  onNext,
  onSubmit,
  nextButtonText = 'Dalej',
  submitButtonText = 'Wygeneruj plan',
}: NavigationButtonsProps) {
  return (
    <div className='flex flex-col items-stretch justify-between gap-3 pt-4 sm:flex-row sm:items-center sm:gap-0 sm:pt-6'>
      {/* Back Button */}
      <Button
        type='button'
        variant='outline'
        onClick={onBack}
        disabled={!canGoBack || isLoading}
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
