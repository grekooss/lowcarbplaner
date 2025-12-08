'use client'

/**
 * WeightStep Component
 *
 * Step 3: Weight input with slider
 * Collects user's current weight (40-200 kg)
 */

import { Slider } from '@/components/ui/slider'

interface WeightStepProps {
  value: number | null
  onChange: (value: number | null) => void
  error?: string
}

export function WeightStep({ value, onChange, error }: WeightStepProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0] ?? null)
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-2xl font-semibold'>Ile ważysz?</h2>
        <p className='text-muted-foreground text-sm'>
          Twoja aktualna waga jest podstawą do obliczenia celów żywieniowych.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground text-sm'>Waga</span>
          <span className='text-foreground text-2xl font-bold'>
            {value ?? 70} <span className='text-base font-normal'>kg</span>
          </span>
        </div>
        <Slider
          value={[value ?? 70]}
          onValueChange={handleSliderChange}
          min={40}
          max={200}
          step={1}
          className='w-full'
          aria-label='Waga'
          aria-invalid={!!error}
          aria-describedby={error ? 'weight-error' : undefined}
        />
        <div className='text-muted-foreground flex justify-between text-xs'>
          <span>40 kg</span>
          <span>200 kg</span>
        </div>
        {error && (
          <p id='weight-error' className='text-destructive text-sm'>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
