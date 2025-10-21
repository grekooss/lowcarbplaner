'use client'

/**
 * HeightStep Component
 *
 * Step 4: Height input
 * Collects user's height (140-250 cm)
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface HeightStepProps {
  value: number | null
  onChange: (value: number | null) => void
  error?: string
}

export function HeightStep({ value, onChange, error }: HeightStepProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      onChange(null)
      return
    }
    const numVal = parseInt(val, 10)
    if (!isNaN(numVal)) {
      onChange(numVal)
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

      <div className='space-y-2'>
        <Label htmlFor='height'>Wzrost (cm)</Label>
        <Input
          id='height'
          type='number'
          min={140}
          max={250}
          value={value ?? ''}
          onChange={handleChange}
          placeholder='np. 170'
          className={error ? 'border-destructive' : ''}
          aria-invalid={!!error}
          aria-describedby={error ? 'height-error' : undefined}
        />
        {error && (
          <p id='height-error' className='text-destructive text-sm'>
            {error}
          </p>
        )}
        <p className='text-muted-foreground text-xs'>
          Podaj wzrost w centymetrach
        </p>
      </div>
    </div>
  )
}
