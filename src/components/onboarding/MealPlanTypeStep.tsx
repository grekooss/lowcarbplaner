'use client'

/**
 * MealPlanTypeStep Component
 *
 * Step 7: Meal plan type selection + eating time window
 * Allows user to select how many meals per day they want
 * Uses time window to automatically determine meal types for '2_main' option
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MEAL_PLAN_TYPE_LABELS,
  MEAL_PLAN_TYPE_DESCRIPTIONS,
  calculateSelectedMealsFromTimeWindow,
  getSelectedMealsDescription,
} from '@/types/onboarding-view.types'
import type { Enums } from '@/types/database.types'
import { generateTimeOptions } from '@/lib/utils'

const TIME_OPTIONS = generateTimeOptions()

interface MealPlanTypeStepProps {
  value: Enums<'meal_plan_type_enum'> | null
  onChange: (value: Enums<'meal_plan_type_enum'>) => void
  eatingStartTime: string | null
  eatingEndTime: string | null
  onEatingStartTimeChange: (time: string) => void
  onEatingEndTimeChange: (time: string) => void
}

const MEAL_PLAN_TYPES: Enums<'meal_plan_type_enum'>[] = [
  '3_main_2_snacks',
  '3_main_1_snack',
  '3_main',
  '2_main',
]

export function MealPlanTypeStep({
  value,
  onChange,
  eatingStartTime,
  eatingEndTime,
  onEatingStartTimeChange,
  onEatingEndTimeChange,
}: MealPlanTypeStepProps) {
  // Oblicz automatycznie dobrane posiłki dla 2_main
  const calculatedMeals =
    value === '2_main' && eatingStartTime && eatingEndTime
      ? calculateSelectedMealsFromTimeWindow(eatingStartTime, eatingEndTime)
      : null

  return (
    <div className='space-y-6'>
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
          <div key={planType}>
            <Label
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
          </div>
        ))}
      </RadioGroup>

      {/* Okno czasowe posiłków */}
      <div className='space-y-4 rounded-lg border-2 border-white bg-white/40 p-4 shadow-sm backdrop-blur-md'>
        <div className='space-y-1'>
          <h3 className='text-foreground font-medium'>Okno czasowe posiłków</h3>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            O której godzinie zazwyczaj jesz pierwszy i ostatni posiłek?
          </p>
        </div>

        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
          <div className='flex flex-1 items-center gap-2'>
            <Label
              htmlFor='eating-start-time'
              className='text-muted-foreground min-w-[100px] text-sm'
            >
              Rozpoczynam o:
            </Label>
            <Select
              value={eatingStartTime || '07:00'}
              onValueChange={onEatingStartTimeChange}
            >
              <SelectTrigger id='eating-start-time' className='w-24 bg-white'>
                <SelectValue placeholder='Wybierz' />
              </SelectTrigger>
              <SelectContent className='max-h-60'>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-1 items-center gap-2'>
            <Label
              htmlFor='eating-end-time'
              className='text-muted-foreground min-w-[100px] text-sm'
            >
              Kończę o:
            </Label>
            <Select
              value={eatingEndTime || '19:00'}
              onValueChange={onEatingEndTimeChange}
            >
              <SelectTrigger id='eating-end-time' className='w-24 bg-white'>
                <SelectValue placeholder='Wybierz' />
              </SelectTrigger>
              <SelectContent className='max-h-60'>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Podgląd automatycznie dobranych posiłków dla 2_main */}
        {value === '2_main' && calculatedMeals && (
          <div className='bg-primary/10 border-primary/20 mt-4 rounded-md border p-3'>
            <p className='text-muted-foreground text-sm'>
              Na podstawie Twojego okna czasowego system dobierze:
            </p>
            <p className='text-primary mt-1 font-medium'>
              {getSelectedMealsDescription(calculatedMeals)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
