'use client'

/**
 * HeightStep Component
 *
 * Step 4: Height input with slider
 * Collects user's height (140-250 cm)
 */

import { Slider } from '@/components/ui/slider'

interface HeightStepProps {
  value: number | null
  onChange: (value: number | null) => void
  error?: string
}

export function HeightStep({ value, onChange, error }: HeightStepProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0] ?? null)
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-2xl font-semibold'>
          Jaki masz wzrost?
        </h2>
        <p className='text-muted-foreground text-sm'>
          Wzrost jest używany do obliczenia Twojego podstawowego metabolizmu.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground text-sm'>Wzrost</span>
          <span className='text-foreground text-2xl font-bold'>
            {value ?? 170} <span className='text-base font-normal'>cm</span>
          </span>
        </div>
        <Slider
          value={[value ?? 170]}
          onValueChange={handleSliderChange}
          min={140}
          max={250}
          step={1}
          className='w-full'
          aria-label='Wzrost'
          aria-invalid={!!error}
          aria-describedby={error ? 'height-error' : undefined}
        />
        <div className='text-muted-foreground flex justify-between text-xs'>
          <span>140 cm</span>
          <span>250 cm</span>
        </div>
        {error && (
          <p id='height-error' className='text-destructive text-sm'>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
