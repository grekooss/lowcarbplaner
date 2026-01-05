'use client'

/**
 * GoalStep Component
 *
 * Step 6: Goal selection with optional weight loss rate
 * Allows user to select their fitness goal
 * Shows weight loss rate options when weight_loss is selected
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { GOAL_LABELS, GOAL_DESCRIPTIONS } from '@/types/onboarding-view.types'
import type { Enums } from '@/types/database.types'
import type { WeightLossOption } from '@/types/onboarding-view.types'

interface GoalStepProps {
  value: Enums<'goal_enum'> | null
  onChange: (value: Enums<'goal_enum'>) => void
  weightLossRate: number | null
  onWeightLossRateChange: (value: number) => void
  weightLossOptions: WeightLossOption[]
  /** Hide header and description (for use in profile edit) */
  hideHeader?: boolean
}

const GOALS: Enums<'goal_enum'>[] = ['weight_loss', 'weight_maintenance']

export function GoalStep({
  value,
  onChange,
  weightLossRate,
  onWeightLossRateChange,
  weightLossOptions,
  hideHeader = false,
}: GoalStepProps) {
  return (
    <div className='space-y-4'>
      {!hideHeader && (
        <div className='space-y-1'>
          <h2 className='text-foreground text-lg font-semibold sm:text-2xl'>
            Jaki jest Twój cel?
          </h2>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            Wybierz cel, który chcesz osiągnąć.
          </p>
        </div>
      )}

      <RadioGroup
        value={value || ''}
        onValueChange={(val: string) => onChange(val as Enums<'goal_enum'>)}
        className='space-y-3'
      >
        {GOALS.map((goal) => (
          <Label
            key={goal}
            htmlFor={goal}
            className='hover:border-primary flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-white bg-white/40 p-4 shadow-sm backdrop-blur-md transition-colors'
          >
            <RadioGroupItem value={goal} id={goal} />
            <div className='flex-1 font-normal'>
              <div className='font-medium'>{GOAL_LABELS[goal]}</div>
              <div className='text-muted-foreground mt-1 text-sm'>
                {GOAL_DESCRIPTIONS[goal]}
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>

      {/* Weight loss rate panel - shown only when weight_loss is selected */}
      {value === 'weight_loss' && weightLossOptions.length > 0 && (
        <div className='mt-6 space-y-4 border-t pt-6'>
          <div className='space-y-2'>
            <h3 className='text-foreground text-lg font-semibold'>
              Tempo utraty wagi
            </h3>
            <p className='text-muted-foreground text-sm'>
              Wybierz tempo, które będzie bezpieczne i realistyczne dla Ciebie.
            </p>
          </div>

          <RadioGroup
            value={weightLossRate?.toString() || ''}
            onValueChange={(val: string) =>
              onWeightLossRateChange(parseFloat(val))
            }
            className='space-y-3'
          >
            {weightLossOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={`rate-${option.value}`}
                className='hover:border-primary flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-white bg-white/40 p-4 shadow-sm backdrop-blur-md transition-colors'
              >
                <RadioGroupItem
                  value={option.value.toString()}
                  id={`rate-${option.value}`}
                />
                <div className='flex-1 font-normal'>
                  <div className='font-medium'>{option.label}</div>
                  <div className='text-muted-foreground mt-1 text-sm'>
                    {option.description}
                  </div>
                  {option.deficitPerDay > 0 && (
                    <div className='text-muted-foreground mt-1 text-xs'>
                      Deficyt: ~{option.deficitPerDay} kcal/dzień
                    </div>
                  )}
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  )
}
