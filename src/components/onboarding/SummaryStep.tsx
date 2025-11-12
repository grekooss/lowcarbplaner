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
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-2xl font-semibold'>Podsumowanie</h2>
        <p className='text-muted-foreground text-sm'>
          Sprawdź swoje dane i cele żywieniowe przed kontynuowaniem.
        </p>
      </div>

      <div className='space-y-4'>
        {/* Personal Data */}
        <div className='rounded-3xl bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-bold'>Twoje dane</h3>
          <div className='space-y-3'>
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
              <span className='font-medium'>{formData.weight_kg} kg</span>
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
          </div>
        </div>

        {/* Nutrition Targets */}
        {calculatedTargets && (
          <div className='rounded-3xl bg-white p-6 shadow-sm'>
            <h3 className='mb-4 text-lg font-bold'>Twoje cele żywieniowe</h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Kalorie dziennie:</span>
                <span className='text-primary text-2xl font-bold'>
                  {calculatedTargets.target_calories} kcal
                </span>
              </div>
              <Separator />
              <div className='space-y-2'>
                <div className='text-sm font-medium'>Makroskładniki:</div>
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Węglowodany (15%):
                    </span>
                    <span className='font-medium'>
                      {calculatedTargets.target_carbs_g}g
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Białko (35%):</span>
                    <span className='font-medium'>
                      {calculatedTargets.target_protein_g}g
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>
                      Tłuszcze (50%):
                    </span>
                    <span className='font-medium'>
                      {calculatedTargets.target_fats_g}g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
