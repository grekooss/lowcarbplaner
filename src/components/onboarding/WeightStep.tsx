'use client'

/**
 * WeightStep Component
 *
 * Step 3: Weight input with slider and editable input
 * Collects user's current weight (40-150 kg)
 */

import { useEffect, useState } from 'react'
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

  // Local state for input to allow free typing
  const [inputValue, setInputValue] = useState<string>(
    (value ?? DEFAULT).toFixed(1)
  )

  // Initialize with default value if null
  useEffect(() => {
    if (value === null) {
      onChange(DEFAULT)
    }
  }, [value, onChange])

  // Sync input value when external value changes (e.g., from slider)
  useEffect(() => {
    setInputValue((value ?? DEFAULT).toFixed(1))
  }, [value])

  const handleSliderChange = (values: number[]) => {
    onChange(values[0] ?? null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow free typing - don't clamp immediately
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  const handleInputBlur = () => {
    // Clamp value on blur
    if (inputValue === '') {
      onChange(DEFAULT)
      setInputValue(DEFAULT.toFixed(1))
      return
    }
    const numValue = parseFloat(inputValue)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(MAX, Math.max(MIN, numValue))
      const roundedValue = Math.round(clampedValue * 10) / 10
      onChange(roundedValue)
      setInputValue(roundedValue.toFixed(1))
    } else {
      // Reset to current value if invalid
      setInputValue((value ?? DEFAULT).toFixed(1))
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
                className='text-foreground hover:text-foreground/70 h-5 px-3 text-base transition-colors'
                aria-label='Zwiększ wagę'
              >
                ▲
              </button>
              <button
                type='button'
                onClick={() =>
                  onChange(Math.max(MIN, (value ?? DEFAULT) - STEP))
                }
                className='text-foreground hover:text-foreground/70 h-5 px-3 text-base transition-colors'
                aria-label='Zmniejsz wagę'
              >
                ▼
              </button>
            </div>
            <Input
              type='number'
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
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
