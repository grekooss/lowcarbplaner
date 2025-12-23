'use client'

/**
 * MacroRatioStep Component
 *
 * Step 8: Macro ratio selection
 * Allows user to select their preferred macronutrient distribution
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  MACRO_RATIO_LABELS,
  MACRO_RATIO_DESCRIPTIONS,
} from '@/types/onboarding-view.types'
import type { Enums } from '@/types/database.types'

interface MacroRatioStepProps {
  value: Enums<'macro_ratio_enum'> | null
  onChange: (value: Enums<'macro_ratio_enum'>) => void
}

const MACRO_RATIOS: Enums<'macro_ratio_enum'>[] = [
  '70_25_5',
  '60_35_5',
  '60_25_15',
  '50_30_20',
  '40_40_20',
]

export function MacroRatioStep({ value, onChange }: MacroRatioStepProps) {
  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-lg font-semibold sm:text-2xl'>
          Jakie proporcje makroskładników preferujesz?
        </h2>
        <p className='text-muted-foreground text-xs sm:text-sm'>
          Wybierz rozkład tłuszczy, białka i węglowodanów, który najlepiej
          odpowiada Twoim celom.
        </p>
      </div>

      <RadioGroup
        value={value || ''}
        onValueChange={(val: string) =>
          onChange(val as Enums<'macro_ratio_enum'>)
        }
        className='space-y-3'
      >
        {MACRO_RATIOS.map((ratio) => (
          <Label
            key={ratio}
            htmlFor={ratio}
            className='hover:border-primary flex cursor-pointer items-center space-x-3 rounded-md border border-transparent bg-white p-4 shadow-sm transition-colors hover:bg-white'
          >
            <RadioGroupItem value={ratio} id={ratio} />
            <div className='flex-1 font-normal'>
              <div className='font-medium'>{MACRO_RATIO_LABELS[ratio]}</div>
              <div className='text-muted-foreground mt-1 text-sm'>
                {MACRO_RATIO_DESCRIPTIONS[ratio]}
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
