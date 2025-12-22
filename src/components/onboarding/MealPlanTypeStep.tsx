'use client'

/**
 * MealPlanTypeStep Component
 *
 * Step 7: Meal plan type selection
 * Allows user to select how many meals per day they want
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  MEAL_PLAN_TYPE_LABELS,
  MEAL_PLAN_TYPE_DESCRIPTIONS,
} from '@/types/onboarding-view.types'
import type { Enums } from '@/types/database.types'

interface MealPlanTypeStepProps {
  value: Enums<'meal_plan_type_enum'> | null
  onChange: (value: Enums<'meal_plan_type_enum'>) => void
}

const MEAL_PLAN_TYPES: Enums<'meal_plan_type_enum'>[] = [
  '3_main_2_snacks',
  '3_main_1_snack',
  '3_main',
  '2_main',
]

export function MealPlanTypeStep({ value, onChange }: MealPlanTypeStepProps) {
  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-lg font-semibold sm:text-2xl'>
          Ile posiłków chcesz jeść dziennie?
        </h2>
        <p className='text-muted-foreground text-xs sm:text-sm'>
          Wybierz plan posiłków, który najlepiej pasuje do Twojego stylu życia.
        </p>
      </div>

      <RadioGroup
        value={value || ''}
        onValueChange={(val: string) =>
          onChange(val as Enums<'meal_plan_type_enum'>)
        }
        className='space-y-3'
      >
        {MEAL_PLAN_TYPES.map((planType) => (
          <Label
            key={planType}
            htmlFor={planType}
            className='hover:border-primary flex cursor-pointer items-center space-x-3 rounded-md border border-transparent bg-white p-4 shadow-sm transition-colors hover:bg-white'
          >
            <RadioGroupItem value={planType} id={planType} />
            <div className='flex-1 font-normal'>
              <div className='font-medium'>
                {MEAL_PLAN_TYPE_LABELS[planType]}
              </div>
              <div className='text-muted-foreground mt-1 text-sm'>
                {MEAL_PLAN_TYPE_DESCRIPTIONS[planType]}
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
