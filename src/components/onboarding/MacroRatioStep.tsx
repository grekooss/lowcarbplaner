'use client'

/**
 * MacroRatioStep Component
 *
 * Step 8: Macro ratio selection
 * Allows user to select their preferred macronutrient distribution
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { MacroCard } from '@/components/profile/MacroCard'
import { cn } from '@/lib/utils'
import {
  MACRO_RATIO_LABELS,
  MACRO_RATIO_DESCRIPTIONS,
} from '@/types/onboarding-view.types'
import type { Enums } from '@/types/database.types'

interface MacroRatioStepProps {
  value: Enums<'macro_ratio_enum'> | null
  onChange: (value: Enums<'macro_ratio_enum'>) => void
  targetCalories: number | null
  /** Hide header and description (for use in profile edit) */
  hideHeader?: boolean
}

const MACRO_RATIOS: Enums<'macro_ratio_enum'>[] = [
  '70_25_5',
  '60_35_5',
  '60_30_10',
  '60_25_15',
  '50_30_20',
  '45_30_25',
]

/**
 * Mapowanie proporcji makroskładników z enum na wartości procentowe
 */
const MACRO_RATIO_VALUES: Record<
  Enums<'macro_ratio_enum'>,
  { fats: number; protein: number; carbs: number }
> = {
  '70_25_5': { fats: 0.7, protein: 0.25, carbs: 0.05 },
  '60_35_5': { fats: 0.6, protein: 0.35, carbs: 0.05 },
  '60_30_10': { fats: 0.6, protein: 0.3, carbs: 0.1 },
  '60_25_15': { fats: 0.6, protein: 0.25, carbs: 0.15 },
  '50_30_20': { fats: 0.5, protein: 0.3, carbs: 0.2 },
  '45_30_25': { fats: 0.45, protein: 0.3, carbs: 0.25 },
  '40_40_20': { fats: 0.4, protein: 0.4, carbs: 0.2 },
}

/**
 * Oblicza makra w gramach na podstawie kalorii i proporcji
 */
function calculateMacros(
  calories: number,
  ratio: Enums<'macro_ratio_enum'>
): { fats: number; protein: number; carbs: number } {
  const ratios = MACRO_RATIO_VALUES[ratio]
  return {
    fats: Math.round((calories * ratios.fats) / 9),
    protein: Math.round((calories * ratios.protein) / 4),
    carbs: Math.round((calories * ratios.carbs) / 4),
  }
}

export function MacroRatioStep({
  value,
  onChange,
  targetCalories,
  hideHeader = false,
}: MacroRatioStepProps) {
  return (
    <div className='space-y-4'>
      {!hideHeader && (
        <div className='space-y-1'>
          <h2 className='text-foreground text-lg font-semibold sm:text-2xl'>
            Jakie proporcje makroskładników preferujesz?
          </h2>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            Wybierz rozkład tłuszczy, białka i węglowodanów, który najlepiej
            odpowiada Twoim celom.
          </p>
        </div>
      )}

      <RadioGroup
        value={value || ''}
        onValueChange={(val: string) =>
          onChange(val as Enums<'macro_ratio_enum'>)
        }
        className='space-y-3'
      >
        {MACRO_RATIOS.map((ratio) => {
          const isSelected = value === ratio
          const macros =
            targetCalories && isSelected
              ? calculateMacros(targetCalories, ratio)
              : null

          return (
            <Label
              key={ratio}
              htmlFor={ratio}
              className={cn(
                'flex cursor-pointer flex-col rounded-lg border-2 bg-white/40 p-4 shadow-sm backdrop-blur-md transition-colors',
                isSelected
                  ? 'border-primary'
                  : 'hover:border-primary/50 border-white'
              )}
            >
              <div className='flex items-center space-x-3'>
                <RadioGroupItem value={ratio} id={ratio} />
                <div className='flex-1 font-normal'>
                  <div className='font-medium'>{MACRO_RATIO_LABELS[ratio]}</div>
                  <div className='text-muted-foreground mt-1 text-sm'>
                    {MACRO_RATIO_DESCRIPTIONS[ratio]}
                  </div>
                </div>
              </div>

              {/* Wysuwany panel z podziałem makro i kaloriami */}
              {isSelected && macros && targetCalories && (
                <div className='mt-3 border-t border-white/50 pt-3'>
                  <div className='grid grid-cols-4 gap-2'>
                    <MacroCard
                      label='Kalorie'
                      value={targetCalories}
                      unit='kcal'
                      variant='calories'
                      size='compact'
                    />
                    <MacroCard
                      label='Tłuszcze'
                      value={macros.fats}
                      unit='g'
                      variant='fat'
                      size='compact'
                      percentage={Math.round(
                        MACRO_RATIO_VALUES[ratio].fats * 100
                      )}
                    />
                    <MacroCard
                      label='Węgl. netto'
                      value={macros.carbs}
                      unit='g'
                      variant='carbs'
                      size='compact'
                      percentage={Math.round(
                        MACRO_RATIO_VALUES[ratio].carbs * 100
                      )}
                    />
                    <MacroCard
                      label='Białko'
                      value={macros.protein}
                      unit='g'
                      variant='protein'
                      size='compact'
                      percentage={Math.round(
                        MACRO_RATIO_VALUES[ratio].protein * 100
                      )}
                    />
                  </div>
                </div>
              )}
            </Label>
          )
        })}
      </RadioGroup>
    </div>
  )
}
