'use client'

/**
 * WeightLossRateStep Component
 *
 * Step 7: Weight loss rate selection (conditional)
 * Shown only when goal is 'weight_loss'
 * Shows only available options based on user's TDEE
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { WeightLossOption } from '@/types/onboarding-view.types'

interface WeightLossRateStepProps {
  value: number | null
  onChange: (value: number) => void
  options: WeightLossOption[]
}

export function WeightLossRateStep({
  value,
  onChange,
  options,
}: WeightLossRateStepProps) {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-2xl font-semibold'>
          Jakie tempo utraty wagi chcesz osiągnąć?
        </h2>
        <p className='text-muted-foreground text-sm'>
          Wybierz tempo, które będzie bezpieczne i realistyczne dla Ciebie.
        </p>
      </div>

      <RadioGroup
        value={value?.toString() || ''}
        onValueChange={(val: string) => onChange(parseFloat(val))}
        className='space-y-3'
      >
        {options.map((option) => (
          <div
            key={option.value}
            className='hover:border-primary flex items-start space-x-3 rounded-lg border-2 border-white bg-white/40 p-4 shadow-sm backdrop-blur-md transition-colors'
          >
            <RadioGroupItem
              value={option.value.toString()}
              id={`rate-${option.value}`}
              className='mt-1'
            />
            <Label
              htmlFor={`rate-${option.value}`}
              className='flex-1 cursor-pointer font-normal'
            >
              <div className='font-medium'>{option.label}</div>
              <div className='text-muted-foreground mt-1 text-sm'>
                {option.description}
              </div>
              {option.deficitPerDay > 0 && (
                <div className='text-muted-foreground mt-1 text-xs'>
                  Deficyt: ~{option.deficitPerDay} kcal/dzień
                </div>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
