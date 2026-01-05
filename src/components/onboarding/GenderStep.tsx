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
  /** Hide header and description (for use in profile edit) */
  hideHeader?: boolean
}

export function GenderStep({
  value,
  onChange,
  hideHeader = false,
}: GenderStepProps) {
  return (
    <div className='space-y-4'>
      {!hideHeader && (
        <div className='space-y-1'>
          <h2 className='text-foreground text-lg font-semibold sm:text-2xl'>
            Jaka jest Twoja płeć?
          </h2>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            Potrzebujemy tej informacji do obliczenia Twojego dziennego
            zapotrzebowania kalorycznego.
          </p>
        </div>
      )}

      <RadioGroup
        value={value || ''}
        onValueChange={(val: string) => onChange(val as Enums<'gender_enum'>)}
        className='space-y-3'
      >
        <Label
          htmlFor='female'
          className='hover:border-primary flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-white bg-white/40 p-4 shadow-sm backdrop-blur-md transition-colors'
        >
          <RadioGroupItem value='female' id='female' />
          <div className='font-medium'>Kobieta</div>
        </Label>

        <Label
          htmlFor='male'
          className='hover:border-primary flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-white bg-white/40 p-4 shadow-sm backdrop-blur-md transition-colors'
        >
          <RadioGroupItem value='male' id='male' />
          <div className='font-medium'>Mężczyzna</div>
        </Label>
      </RadioGroup>
    </div>
  )
}
