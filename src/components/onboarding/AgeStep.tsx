'use client'

/**
 * AgeStep Component
 *
 * Step 2: Age input with slider
 * Collects user's age (18-100 years)
 */

import { Slider } from '@/components/ui/slider'

interface AgeStepProps {
  value: number | null
  onChange: (value: number | null) => void
  error?: string
}

export function AgeStep({ value, onChange, error }: AgeStepProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0] ?? null)
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-2xl font-semibold'>
          Ile masz lat?
        </h2>
        <p className='text-muted-foreground text-sm'>
          Wiek wpływa na Twoje dzienne zapotrzebowanie kaloryczne.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground text-sm'>Wiek</span>
          <span className='text-foreground text-2xl font-bold'>
            {value ?? 30} <span className='text-base font-normal'>lat</span>
          </span>
        </div>
        <Slider
          value={[value ?? 30]}
          onValueChange={handleSliderChange}
          min={18}
          max={100}
          step={1}
          className='w-full'
          aria-label='Wiek'
          aria-invalid={!!error}
          aria-describedby={error ? 'age-error' : undefined}
        />
        <div className='text-muted-foreground flex justify-between text-xs'>
          <span>18</span>
          <span>100</span>
        </div>
        {error && (
          <p id='age-error' className='text-destructive text-sm'>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
