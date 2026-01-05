/**
 * Dashboard loading and error state components.
 * Extracted from DashboardClient for reusability and cleaner main component.
 */

'use client'

import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

/**
 * Full-screen loading state shown during meal plan generation.
 */
export function DashboardGeneratingState() {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center space-y-6'>
      <Loader2
        className='text-primary h-16 w-16 animate-spin'
        strokeWidth={2}
      />
      <div className='space-y-2 text-center'>
        <h2 className='text-xl font-bold text-gray-800'>
          Generujemy Twój plan
        </h2>
        <p className='text-sm text-gray-600'>
          Przygotowujemy spersonalizowany plan posiłków na cały tydzień...
        </p>
      </div>
    </div>
  )
}

interface DashboardErrorStateProps {
  /** Error object or message */
  error: Error | string | null
  /** Whether this is a generation error (vs. data loading error) */
  isGenerationError?: boolean
  /** Callback to retry the failed operation */
  onRetry: () => void
}

/**
 * Error state with retry button.
 * Shows different messages for generation vs. data loading errors.
 */
export function DashboardErrorState({
  error,
  isGenerationError = false,
  onRetry,
}: DashboardErrorStateProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : (error ?? 'Nie udało się pobrać posiłków. Spróbuj ponownie.')

  return (
    <div className='container mx-auto space-y-6 px-4 py-8'>
      <Alert variant='destructive' role='alert' aria-live='assertive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>
          {isGenerationError
            ? 'Błąd generowania planu'
            : 'Błąd ładowania danych'}
        </AlertTitle>
        <AlertDescription className='space-y-2'>
          <p>{errorMessage}</p>
          <Button variant='outline' size='sm' onClick={onRetry}>
            Spróbuj ponownie
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

interface DashboardSectionLoaderProps {
  /** Minimum height of the loader container */
  minHeight?: string
  /** Size of the spinner icon */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Inline loading spinner for dashboard sections.
 * Used during date changes for macro section and meals list.
 */
export function DashboardSectionLoader({
  minHeight = 'min-h-[200px]',
  size = 'md',
}: DashboardSectionLoaderProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  }

  return (
    <div
      className={`flex ${minHeight} items-center justify-center rounded-md border-2 border-white bg-white/40 shadow-sm backdrop-blur-xl sm:min-h-[300px] sm:rounded-3xl`}
    >
      <Loader2
        className={`text-primary ${sizeClasses[size]} animate-spin`}
        strokeWidth={3}
      />
    </div>
  )
}

/**
 * Simple centered loader for meals list section.
 */
export function MealsListLoader() {
  return (
    <div className='flex h-16 items-start justify-center'>
      <Loader2
        className='text-primary h-14 w-14 animate-spin'
        strokeWidth={3}
      />
    </div>
  )
}
