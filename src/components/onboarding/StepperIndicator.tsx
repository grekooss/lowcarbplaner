'use client'

/**
 * StepperIndicator Component
 *
 * Visual indicator showing current step and progress
 * Displays step numbers and titles
 */

import { Check } from 'lucide-react'

interface Step {
  number: number
  title: string
  isCompleted: boolean
  isCurrent: boolean
}

interface StepperIndicatorProps {
  steps: Step[]
}

export function StepperIndicator({ steps }: StepperIndicatorProps) {
  return (
    <nav
      aria-label='Progress'
      className='mb-4 rounded-[16px] border-2 border-[var(--glass-border)] bg-white/40 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur-[16px] sm:px-4 sm:py-3 md:mb-5'
    >
      {/* Mobile: Simplified progress bar */}
      <div className='md:hidden'>
        <div className='mb-2 flex items-center justify-between'>
          <span className='text-foreground text-sm font-medium'>
            Krok {steps.find((s) => s.isCurrent)?.number} z {steps.length}
          </span>
          <span className='text-muted-foreground text-xs'>
            {steps.find((s) => s.isCurrent)?.title}
          </span>
        </div>
        <div className='relative h-2 overflow-hidden rounded-full bg-white/60'>
          <div
            className='bg-primary absolute top-0 left-0 h-full transition-all duration-300'
            style={{
              width: `${((steps.findIndex((s) => s.isCurrent) + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Desktop: Full stepper */}
      <ol className='hidden items-center md:flex'>
        {steps.map((step) => (
          <li
            key={step.number}
            className='flex flex-1 items-center justify-center'
          >
            {/* Step Circle */}
            <div className='flex flex-col items-center'>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm transition-colors ${
                  step.isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : step.isCurrent
                      ? 'border-primary text-primary bg-white/80 backdrop-blur-sm'
                      : 'text-muted-foreground border-white/60 bg-white/40 backdrop-blur-sm'
                }`}
                aria-current={step.isCurrent ? 'step' : undefined}
              >
                {step.isCompleted ? (
                  <Check className='h-5 w-5' aria-hidden='true' />
                ) : (
                  <span className='text-sm font-semibold'>{step.number}</span>
                )}
              </div>

              {/* Step Title */}
              <span
                className={`mt-2 max-w-[80px] text-center text-xs font-medium ${
                  step.isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
