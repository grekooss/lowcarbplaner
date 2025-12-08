'use client'

/**
 * GoalStep Component
 *
 * Step 6: Goal selection
 * Allows user to select their fitness goal
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { GOAL_LABELS, GOAL_DESCRIPTIONS } from '@/types/onboarding-view.types'
import type { Enums } from '@/types/database.types'

interface GoalStepProps {
  value: Enums<'goal_enum'> | null
  onChange: (value: Enums<'goal_enum'>) => void
}

const GOALS: Enums<'goal_enum'>[] = ['weight_loss', 'weight_maintenance']

export function GoalStep({ value, onChange }: GoalStepProps) {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-2xl font-semibold'>
          Jaki jest Twój cel?
        </h2>
        <p className='text-muted-foreground text-sm'>
          Wybierz cel, który chcesz osiągnąć.
        </p>
      </div>

      <RadioGroup
        value={value || ''}
        onValueChange={(val: string) => onChange(val as Enums<'goal_enum'>)}
        className='space-y-3'
      >
        {GOALS.map((goal) => (
          <div
            key={goal}
            className='hover:border-primary flex items-start space-x-3 rounded-3xl border border-transparent bg-white p-4 shadow-sm transition-colors hover:bg-white'
          >
            <RadioGroupItem value={goal} id={goal} className='mt-1' />
            <Label htmlFor={goal} className='flex-1 cursor-pointer font-normal'>
              <div className='font-medium'>{GOAL_LABELS[goal]}</div>
              <div className='text-muted-foreground mt-1 text-sm'>
                {GOAL_DESCRIPTIONS[goal]}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
