'use client'

/**
 * AgeStep Component
 *
 * Step 2: Age input
 * Collects user's age (18-100 years)
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AgeStepProps {
  value: number | null
  onChange: (value: number | null) => void
  error?: string
}

export function AgeStep({ value, onChange, error }: AgeStepProps) {
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
          Ile masz lat?
        </h2>
        <p className='text-muted-foreground text-sm'>
          Wiek wpływa na Twoje dzienne zapotrzebowanie kaloryczne.
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='age'>Wiek (lata)</Label>
        <Input
          id='age'
          type='number'
          min={18}
          max={100}
          value={value ?? ''}
          onChange={handleChange}
          placeholder='np. 30'
          className={error ? 'border-destructive' : ''}
          aria-invalid={!!error}
          aria-describedby={error ? 'age-error' : undefined}
        />
        {error && (
          <p id='age-error' className='text-destructive text-sm'>
            {error}
          </p>
        )}
        <p className='text-muted-foreground text-xs'>
          Musisz mieć co najmniej 18 lat
        </p>
      </div>
    </div>
  )
}
