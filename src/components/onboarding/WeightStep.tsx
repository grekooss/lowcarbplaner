'use client'

/**
 * WeightStep Component
 *
 * Step 3: Weight input
 * Collects user's current weight (40-300 kg)
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WeightStepProps {
  value: number | null
  onChange: (value: number | null) => void
  error?: string
}

export function WeightStep({ value, onChange, error }: WeightStepProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      onChange(null)
      return
    }
    const numVal = parseFloat(val)
    if (!isNaN(numVal)) {
      onChange(numVal)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-2xl font-semibold'>Ile ważysz?</h2>
        <p className='text-muted-foreground text-sm'>
          Twoja aktualna waga jest podstawą do obliczenia celów żywieniowych.
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='weight'>Waga (kg)</Label>
        <Input
          id='weight'
          type='number'
          min={40}
          max={300}
          step={0.1}
          value={value ?? ''}
          onChange={handleChange}
          placeholder='np. 70.5'
          className={error ? 'border-destructive' : ''}
          aria-invalid={!!error}
          aria-describedby={error ? 'weight-error' : undefined}
        />
        {error && (
          <p id='weight-error' className='text-destructive text-sm'>
            {error}
          </p>
        )}
        <p className='text-muted-foreground text-xs'>
          Podaj wagę z dokładnością do 0.1 kg
        </p>
      </div>
    </div>
  )
}
