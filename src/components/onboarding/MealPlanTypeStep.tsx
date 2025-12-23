'use client'

/**
 * MealPlanTypeStep Component
 *
 * Step 7: Meal plan type selection
 * Allows user to select how many meals per day they want
 * For '2_main' option, shows additional selection of which 2 meals to include
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  MEAL_PLAN_TYPE_LABELS,
  MEAL_PLAN_TYPE_DESCRIPTIONS,
  MAIN_MEAL_LABELS,
  type MainMealType,
} from '@/types/onboarding-view.types'
import type { Enums } from '@/types/database.types'

interface MealPlanTypeStepProps {
  value: Enums<'meal_plan_type_enum'> | null
  onChange: (value: Enums<'meal_plan_type_enum'>) => void
  selectedMeals: MainMealType[] | null
  onSelectedMealsChange: (meals: MainMealType[]) => void
}

const MEAL_PLAN_TYPES: Enums<'meal_plan_type_enum'>[] = [
  '3_main_2_snacks',
  '3_main_1_snack',
  '3_main',
  '2_main',
]

const MAIN_MEALS: MainMealType[] = ['breakfast', 'lunch', 'dinner']

export function MealPlanTypeStep({
  value,
  onChange,
  selectedMeals,
  onSelectedMealsChange,
}: MealPlanTypeStepProps) {
  const handleMealToggle = (mealType: MainMealType, checked: boolean) => {
    const current = selectedMeals || []

    if (checked) {
      // Dodaj posiłek (max 2)
      if (current.length < 2) {
        onSelectedMealsChange([...current, mealType])
      }
    } else {
      // Usuń posiłek
      onSelectedMealsChange(current.filter((m) => m !== mealType))
    }
  }

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

            {/* Wybór posiłków dla opcji 2_main */}
            {planType === '2_main' && value === '2_main' && (
              <div className='mt-3 ml-8 space-y-2 rounded-md bg-white/50 p-4'>
                <p className='text-muted-foreground mb-3 text-sm font-medium'>
                  Wybierz 2 posiłki, które chcesz jeść:
                </p>
                <div className='flex flex-wrap gap-4'>
                  {MAIN_MEALS.map((mealType) => {
                    const isSelected =
                      selectedMeals?.includes(mealType) || false
                    const isDisabled =
                      !isSelected && (selectedMeals?.length || 0) >= 2

                    return (
                      <Label
                        key={mealType}
                        htmlFor={`meal-${mealType}`}
                        className={`flex cursor-pointer items-center space-x-2 rounded-md border p-3 transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : isDisabled
                              ? 'cursor-not-allowed border-gray-200 opacity-50'
                              : 'hover:border-primary/50 border-gray-200'
                        }`}
                      >
                        <Checkbox
                          id={`meal-${mealType}`}
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={(checked) =>
                            handleMealToggle(mealType, checked === true)
                          }
                        />
                        <span className='font-medium'>
                          {MAIN_MEAL_LABELS[mealType]}
                        </span>
                      </Label>
                    )
                  })}
                </div>
                {(selectedMeals?.length || 0) < 2 && (
                  <p className='text-muted-foreground mt-2 text-xs'>
                    Wybierz jeszcze {2 - (selectedMeals?.length || 0)}{' '}
                    {2 - (selectedMeals?.length || 0) === 1
                      ? 'posiłek'
                      : 'posiłki'}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
