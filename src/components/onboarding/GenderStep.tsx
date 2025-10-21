'use client'

/**
 * GenderStep Component
 *
 * Step 1: Gender selection
 * Allows user to select their biological gender for BMR calculations
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { Enums } from '@/types/database.types'

interface GenderStepProps {
  value: Enums<'gender_enum'> | null
  onChange: (value: Enums<'gender_enum'>) => void
}

export function GenderStep({ value, onChange }: GenderStepProps) {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-2xl font-semibold'>
          Jaka jest Twoja płeć?
        </h2>
        <p className='text-muted-foreground text-sm'>
          Potrzebujemy tej informacji do obliczenia Twojego dziennego
          zapotrzebowania kalorycznego.
        </p>
      </div>

      <RadioGroup
        value={value || ''}
        onValueChange={(val: string) => onChange(val as Enums<'gender_enum'>)}
        className='space-y-3'
      >
        <div className='hover:bg-accent flex items-center space-x-3 rounded-lg border p-4 transition-colors'>
          <RadioGroupItem value='female' id='female' />
          <Label htmlFor='female' className='flex-1 cursor-pointer font-normal'>
            <div className='font-medium'>Kobieta</div>
          </Label>
        </div>

        <div className='hover:bg-accent flex items-center space-x-3 rounded-lg border p-4 transition-colors'>
          <RadioGroupItem value='male' id='male' />
          <Label htmlFor='male' className='flex-1 cursor-pointer font-normal'>
            <div className='font-medium'>Mężczyzna</div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
