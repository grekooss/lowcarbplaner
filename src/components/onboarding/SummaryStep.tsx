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
  MACRO_RATIO_LABELS,
  parseMacroRatio,
  calculateSelectedMealsFromTimeWindow,
  getSelectedMealsDescription,
  type OnboardingFormData,
  type CalculatedTargets,
} from '@/types/onboarding-view.types'
import { Separator } from '@/components/ui/separator'

interface SummaryStepProps {
  formData: OnboardingFormData
  calculatedTargets: CalculatedTargets | null
}

export function SummaryStep({ formData, calculatedTargets }: SummaryStepProps) {
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
        <div className='rounded-md bg-white p-4 shadow-sm'>
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
            <Separator />
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Proporcje makro:</span>
              <span className='font-medium'>
                {formData.macro_ratio
                  ? MACRO_RATIO_LABELS[formData.macro_ratio]
                  : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Nutrition Targets */}
        {calculatedTargets && (
          <div className='rounded-md bg-white p-4 shadow-sm'>
            <h3 className='mb-2 text-base font-bold'>Twoje cele żywieniowe</h3>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Kalorie dziennie:</span>
                <span className='text-primary text-2xl font-bold'>
                  {calculatedTargets.target_calories} kcal
                </span>
              </div>
              <Separator />
              <div className='space-y-1'>
                <div className='text-sm font-medium'>Makroskładniki:</div>
                {(() => {
                  const ratio = formData.macro_ratio
                    ? parseMacroRatio(formData.macro_ratio)
                    : { fats: 0.6, protein: 0.25, carbs: 0.15 }
                  return (
                    <div className='space-y-0.5 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Węglowodany ({Math.round(ratio.carbs * 100)}%):
                        </span>
                        <span className='font-medium'>
                          {calculatedTargets.target_carbs_g}g
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Białko ({Math.round(ratio.protein * 100)}%):
                        </span>
                        <span className='font-medium'>
                          {calculatedTargets.target_protein_g}g
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Tłuszcze ({Math.round(ratio.fats * 100)}%):
                        </span>
                        <span className='font-medium'>
                          {calculatedTargets.target_fats_g}g
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
