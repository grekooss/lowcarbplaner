'use client'

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the errors, and displays a fallback UI.
 *
 * @module components/shared/ErrorBoundary
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode
  /** Custom fallback UI (optional) */
  fallback?: ReactNode
  /** Error handler callback (optional) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Feature name for display (e.g., "Dashboard", "Meal Plan") */
  featureName?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary for catching and handling React errors
 *
 * @example
 * ```tsx
 * <ErrorBoundary featureName="Dashboard">
 *   <DashboardClient />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomError />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    console.error('Error caught by ErrorBoundary:', error, errorInfo)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className='flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-white bg-white/40 p-6 text-center backdrop-blur-md'>
          <AlertTriangle className='mb-4 h-12 w-12 text-red-500' />
          <h2 className='mb-2 text-lg font-bold text-gray-800'>
            Wystąpił błąd
            {this.props.featureName && ` w ${this.props.featureName}`}
          </h2>
          <p className='mb-4 text-sm text-gray-600'>
            {this.state.error?.message || 'Coś poszło nie tak.'}
          </p>
          <Button
            variant='outline'
            onClick={this.handleRetry}
            className='gap-2'
          >
            <RefreshCw className='h-4 w-4' />
            Spróbuj ponownie
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Async Error Boundary for Next.js error handling
 *
 * Use this in error.tsx files for page-level error handling.
 */
interface AsyncErrorFallbackProps {
  error: Error & { digest?: string }
  reset: () => void
  featureName?: string
}

export function AsyncErrorFallback({
  error,
  reset,
  featureName,
}: AsyncErrorFallbackProps) {
  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center p-6 text-center'>
      <AlertTriangle className='mb-4 h-16 w-16 text-red-500' />
      <h2 className='mb-2 text-xl font-bold text-gray-800'>
        Wystąpił błąd
        {featureName && ` w ${featureName}`}
      </h2>
      <p className='mb-6 max-w-md text-gray-600'>
        {error.message ||
          'Przepraszamy, ale wystąpił nieoczekiwany błąd. Spróbuj ponownie.'}
      </p>
      <Button onClick={reset} className='gap-2 bg-red-600 hover:bg-red-700'>
        <RefreshCw className='h-4 w-4' />
        Spróbuj ponownie
      </Button>
    </div>
  )
}
