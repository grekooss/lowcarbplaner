'use client'

/**
 * HeightStep Component
 *
 * Step 4: Height input with slider and editable input
 * Collects user's height (140-210 cm)
 */

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

  const handleSliderChange = (values: number[]) => {
    onChange(values[0] ?? null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      onChange(null)
      return
    }
    const numValue = parseInt(inputValue, 10)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(MAX, Math.max(MIN, numValue))
      onChange(clampedValue)
    }
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
          <div className='flex items-center gap-2'>
            <div className='flex flex-col'>
              <button
                type='button'
                onClick={() => onChange(Math.min(MAX, (value ?? DEFAULT) + 1))}
                className='text-muted-foreground/50 hover:text-muted-foreground h-3 px-1 text-[10px] transition-colors'
                aria-label='Zwiększ wzrost'
              >
                ▲
              </button>
              <button
                type='button'
                onClick={() => onChange(Math.max(MIN, (value ?? DEFAULT) - 1))}
                className='text-muted-foreground/50 hover:text-muted-foreground h-3 px-1 text-[10px] transition-colors'
                aria-label='Zmniejsz wzrost'
              >
                ▼
              </button>
            </div>
            <Input
              type='number'
              value={value ?? DEFAULT}
              onChange={handleInputChange}
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
