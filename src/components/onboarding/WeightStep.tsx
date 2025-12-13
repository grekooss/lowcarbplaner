'use client'

/**
 * WeightStep Component
 *
 * Step 3: Weight input with slider and editable input
 * Collects user's current weight (40-150 kg)
 */

import { useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'

interface WeightStepProps {
  value: number | null
  onChange: (value: number | null) => void
  error?: string
}

export function WeightStep({ value, onChange, error }: WeightStepProps) {
  const MIN = 40
  const MAX = 150
  const DEFAULT = 70
  const STEP = 0.1

  // Initialize with default value if null
  useEffect(() => {
    if (value === null) {
      onChange(DEFAULT)
    }
  }, [value, onChange])

  const handleSliderChange = (values: number[]) => {
    onChange(values[0] ?? null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      onChange(null)
      return
    }
    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(MAX, Math.max(MIN, numValue))
      const roundedValue = Math.round(clampedValue * 10) / 10
      onChange(roundedValue)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-lg font-semibold sm:text-2xl'>
          Ile ważysz?
        </h2>
        <p className='text-muted-foreground text-xs sm:text-sm'>
          Twoja aktualna waga jest podstawą do obliczenia celów żywieniowych.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-foreground text-sm font-bold'>Waga</span>
          <div className='flex items-center gap-2'>
            <div className='flex flex-col'>
              <button
                type='button'
                onClick={() =>
                  onChange(Math.min(MAX, (value ?? DEFAULT) + STEP))
                }
                className='text-muted-foreground/50 hover:text-muted-foreground h-3 px-1 text-[10px] transition-colors'
                aria-label='Zwiększ wagę'
              >
                ▲
              </button>
              <button
                type='button'
                onClick={() =>
                  onChange(Math.max(MIN, (value ?? DEFAULT) - STEP))
                }
                className='text-muted-foreground/50 hover:text-muted-foreground h-3 px-1 text-[10px] transition-colors'
                aria-label='Zmniejsz wagę'
              >
                ▼
              </button>
            </div>
            <Input
              type='number'
              value={(value ?? DEFAULT).toFixed(1)}
              onChange={handleInputChange}
              min={MIN}
              max={MAX}
              step={STEP}
              className='h-10 w-24 [appearance:textfield] text-center text-xl font-bold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
              aria-label='Waga'
              aria-invalid={!!error}
            />
            <span className='text-foreground text-base font-normal'>kg</span>
          </div>
        </div>
        <Slider
          value={[value ?? DEFAULT]}
          onValueChange={handleSliderChange}
          min={MIN}
          max={MAX}
          step={STEP}
          className='w-full'
          aria-label='Waga'
          aria-invalid={!!error}
          aria-describedby={error ? 'weight-error' : undefined}
        />
        <div className='text-muted-foreground flex justify-between text-xs'>
          <span>{MIN} kg</span>
          <span>{MAX} kg</span>
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
