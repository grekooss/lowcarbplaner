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
  /** Hide header and description (for use in profile edit) */
  hideHeader?: boolean
}

const ACTIVITY_LEVELS: Enums<'activity_level_enum'>[] = [
  'very_low',
  'low',
  'moderate',
  'high',
  'very_high',
]

export function ActivityLevelStep({
  value,
  onChange,
  hideHeader = false,
}: ActivityLevelStepProps) {
  return (
    <div className='space-y-4'>
      {!hideHeader && (
        <div className='space-y-1'>
          <h2 className='text-foreground text-lg font-semibold sm:text-2xl'>
            Jaki jest Twój poziom aktywności fizycznej?
          </h2>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            Wybierz opcję, która najlepiej opisuje Twoją codzienną aktywność.
          </p>
        </div>
      )}

      <RadioGroup
        value={value || ''}
        onValueChange={(val: string) =>
          onChange(val as Enums<'activity_level_enum'>)
        }
        className='space-y-2 sm:space-y-3'
      >
        {ACTIVITY_LEVELS.map((level) => (
          <Label
            key={level}
            htmlFor={level}
            className='hover:border-primary flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-white bg-white/40 p-3 shadow-sm backdrop-blur-md transition-colors sm:p-4'
          >
            <RadioGroupItem value={level} id={level} />
            <div className='flex-1 font-normal'>
              <div className='font-medium'>{ACTIVITY_LEVEL_LABELS[level]}</div>
              <div className='text-muted-foreground mt-1 text-xs sm:text-sm'>
                {ACTIVITY_LEVEL_DESCRIPTIONS[level]}
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
