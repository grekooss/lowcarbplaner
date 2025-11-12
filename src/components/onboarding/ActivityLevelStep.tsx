'use client'

/**
 * ActivityLevelStep Component
 *
 * Step 5: Activity level selection
 * Allows user to select their physical activity level
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVEL_DESCRIPTIONS,
} from '@/types/onboarding-view.types'
import type { Enums } from '@/types/database.types'

interface ActivityLevelStepProps {
  value: Enums<'activity_level_enum'> | null
  onChange: (value: Enums<'activity_level_enum'>) => void
}

const ACTIVITY_LEVELS: Enums<'activity_level_enum'>[] = [
  'very_low',
  'low',
  'moderate',
  'high',
  'very_high',
]

export function ActivityLevelStep({ value, onChange }: ActivityLevelStepProps) {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-2xl font-semibold'>
          Jaki jest Twój poziom aktywności fizycznej?
        </h2>
        <p className='text-muted-foreground text-sm'>
          Wybierz opcję, która najlepiej opisuje Twoją codzienną aktywność.
        </p>
      </div>

      <RadioGroup
        value={value || ''}
        onValueChange={(val: string) =>
          onChange(val as Enums<'activity_level_enum'>)
        }
        className='space-y-3'
      >
        {ACTIVITY_LEVELS.map((level) => (
          <div
            key={level}
            className='card-soft flex items-start space-x-3 rounded-3xl border-0 p-4 shadow-sm transition-colors hover:opacity-80'
          >
            <RadioGroupItem value={level} id={level} className='mt-1' />
            <Label
              htmlFor={level}
              className='flex-1 cursor-pointer font-normal'
            >
              <div className='font-medium'>{ACTIVITY_LEVEL_LABELS[level]}</div>
              <div className='text-muted-foreground mt-1 text-sm'>
                {ACTIVITY_LEVEL_DESCRIPTIONS[level]}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
