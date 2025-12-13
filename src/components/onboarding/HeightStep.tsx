'use client'

/**
 * HeightStep Component
 *
 * Step 4: Height input with slider and editable input
 * Collects user's height (140-210 cm)
 */

import { useEffect, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'

interface HeightStepProps {
  value: number | null
  onChange: (value: number | null) => void
  error?: string
}

export function HeightStep({ value, onChange, error }: HeightStepProps) {
  const MIN = 140
  const MAX = 210
  const DEFAULT = 170

  // Local state for input to allow free typing
  const [inputValue, setInputValue] = useState<string>(String(value ?? DEFAULT))

  // Initialize with default value if null
  useEffect(() => {
    if (value === null) {
      onChange(DEFAULT)
    }
  }, [value, onChange])

  // Sync input value when external value changes (e.g., from slider)
  useEffect(() => {
    setInputValue(String(value ?? DEFAULT))
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
      setInputValue(String(DEFAULT))
      return
    }
    const numValue = parseInt(inputValue, 10)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(MAX, Math.max(MIN, numValue))
      onChange(clampedValue)
      setInputValue(String(clampedValue))
    } else {
      // Reset to current value if invalid
      setInputValue(String(value ?? DEFAULT))
    }
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-lg font-semibold sm:text-2xl'>
          Jaki masz wzrost?
        </h2>
        <p className='text-muted-foreground text-xs sm:text-sm'>
          Wzrost jest używany do obliczenia Twojego podstawowego metabolizmu.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-foreground text-sm font-bold'>Wzrost</span>
          <div className='flex items-center gap-2'>
            <div className='flex flex-col'>
              <button
                type='button'
                onClick={() => onChange(Math.min(MAX, (value ?? DEFAULT) + 1))}
                className='text-foreground hover:text-foreground/70 h-5 px-3 text-base transition-colors'
                aria-label='Zwiększ wzrost'
              >
                ▲
              </button>
              <button
                type='button'
                onClick={() => onChange(Math.max(MIN, (value ?? DEFAULT) - 1))}
                className='text-foreground hover:text-foreground/70 h-5 px-3 text-base transition-colors'
                aria-label='Zmniejsz wzrost'
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
              className='h-10 w-20 [appearance:textfield] text-center text-xl font-bold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
              aria-label='Wzrost'
              aria-invalid={!!error}
            />
            <span className='text-foreground text-base font-normal'>cm</span>
          </div>
        </div>
        <Slider
          value={[value ?? DEFAULT]}
          onValueChange={handleSliderChange}
          min={MIN}
          max={MAX}
          step={1}
          className='w-full'
          aria-label='Wzrost'
          aria-invalid={!!error}
          aria-describedby={error ? 'height-error' : undefined}
        />
        <div className='text-muted-foreground flex justify-between text-xs'>
          <span>{MIN} cm</span>
          <span>{MAX} cm</span>
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
