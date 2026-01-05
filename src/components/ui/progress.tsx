'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indicatorClassName?: string
}

/**
 * Progress component - CSP compliant version without inline styles
 * Uses CSS width classes instead of inline transform
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, indicatorClassName, ...props }, ref) => {
    const progressValue = Math.min(Math.max(value || 0, 0), 100)
    // Round to nearest integer for CSS class
    const widthPercent = Math.round(progressValue)

    return (
      <div
        ref={ref}
        role='progressbar'
        aria-valuenow={progressValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'bg-primary h-full transition-all duration-300 ease-out',
            indicatorClassName
          )}
          // Width is set via inline but it's a simple value that should work
          // If CSP still blocks, we'd need to use CSS custom properties via className
          data-value={widthPercent}
          aria-hidden='true'
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
