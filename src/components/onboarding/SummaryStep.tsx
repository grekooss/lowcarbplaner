'use client'

/**
 * SummaryStep Component
 *
 * Step 8: Summary with calculated nutrition targets
 * Displays user's inputs and calculated nutritional goals
 */

import {
  ACTIVITY_LEVEL_LABELS,
  GOAL_LABELS,
  MEAL_PLAN_TYPE_LABELS,
  parseMacroRatio,
  calculateSelectedMealsFromTimeWindow,
  getSelectedMealsDescription,
  type OnboardingFormData,
  type CalculatedTargets,
} from '@/types/onboarding-view.types'
import { Separator } from '@/components/ui/separator'
import { MacroCard } from '@/components/profile/MacroCard'

interface SummaryStepProps {
  formData: OnboardingFormData
  calculatedTargets: CalculatedTargets | null
}

export function SummaryStep({ formData, calculatedTargets }: SummaryStepProps) {
  const ratio = formData.macro_ratio
    ? parseMacroRatio(formData.macro_ratio)
    : { fats: 0.6, protein: 0.25, carbs: 0.15 }

  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-lg font-semibold sm:text-2xl'>
          Podsumowanie
        </h2>
        <p className='text-muted-foreground text-xs sm:text-sm'>
          Sprawdź swoje dane i cele żywieniowe przed kontynuowaniem.
        </p>
      </div>

      <div className='space-y-3'>
        {/* Personal Data */}
        <div className='rounded-lg border-2 border-white bg-white/40 p-4 shadow-sm backdrop-blur-md'>
          <h3 className='mb-2 text-base font-bold'>Twoje dane</h3>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Płeć:</span>
              <span className='font-medium'>
                {formData.gender === 'female' ? 'Kobieta' : 'Mężczyzna'}
              </span>
            </div>
            <Separator />
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Wiek:</span>
              <span className='font-medium'>{formData.age} lat</span>
            </div>
            <Separator />
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Waga:</span>
              <span className='font-medium'>
                {formData.weight_kg?.toFixed(1)} kg
              </span>
            </div>
            <Separator />
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Wzrost:</span>
              <span className='font-medium'>{formData.height_cm} cm</span>
            </div>
            <Separator />
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Aktywność:</span>
              <span className='font-medium'>
                {formData.activity_level
                  ? ACTIVITY_LEVEL_LABELS[formData.activity_level]
                  : '-'}
              </span>
            </div>
            <Separator />
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Cel:</span>
              <span className='font-medium'>
                {formData.goal ? GOAL_LABELS[formData.goal] : '-'}
              </span>
            </div>
            {formData.goal === 'weight_loss' &&
              formData.weight_loss_rate_kg_week && (
                <>
                  <Separator />
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Tempo utraty wagi:
                    </span>
                    <span className='font-medium'>
                      {formData.weight_loss_rate_kg_week} kg/tydzień
                    </span>
                  </div>
                </>
              )}
            <Separator />
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Plan posiłków:</span>
              <span className='font-medium'>
                {formData.meal_plan_type
                  ? MEAL_PLAN_TYPE_LABELS[formData.meal_plan_type]
                  : '-'}
              </span>
            </div>
            <Separator />
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Okno czasowe:</span>
              <span className='font-medium'>
                {formData.eating_start_time && formData.eating_end_time
                  ? `${formData.eating_start_time} - ${formData.eating_end_time}`
                  : '-'}
              </span>
            </div>
            {formData.meal_plan_type === '2_main' &&
              formData.eating_start_time &&
              formData.eating_end_time && (
                <>
                  <Separator />
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Dobrane posiłki:
                    </span>
                    <span className='text-primary font-medium'>
                      {getSelectedMealsDescription(
                        calculateSelectedMealsFromTimeWindow(
                          formData.eating_start_time,
                          formData.eating_end_time
                        )
                      )}
                    </span>
                  </div>
                </>
              )}
          </div>
        </div>

        {/* Nutrition Targets */}
        {calculatedTargets && (
          <div className='rounded-lg border-2 border-white bg-white/40 p-4 shadow-sm backdrop-blur-md'>
            <h3 className='mb-3 text-base font-bold'>Twoje cele żywieniowe</h3>
            <div className='grid grid-cols-4 gap-2'>
              <MacroCard
                label='Kalorie'
                value={calculatedTargets.target_calories}
                unit='kcal'
                variant='calories'
                size='compact'
              />
              <MacroCard
                label='Tłuszcze'
                value={calculatedTargets.target_fats_g}
                unit='g'
                variant='fat'
                size='compact'
                percentage={Math.round(ratio.fats * 100)}
              />
              <MacroCard
                label='Węglowodany'
                value={calculatedTargets.target_carbs_g}
                unit='g'
                variant='carbs'
                size='compact'
                percentage={Math.round(ratio.carbs * 100)}
              />
              <MacroCard
                label='Białko'
                value={calculatedTargets.target_protein_g}
                unit='g'
                variant='protein'
                size='compact'
                percentage={Math.round(ratio.protein * 100)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
