'use client'

/**
 * WeightLossRateStep Component
 *
 * Step 7: Weight loss rate selection (conditional)
 * Shown only when goal is 'weight_loss'
 * Validates against minimum caloric intake
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
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
  const hasDisabledOptions = options.some((opt) => opt.isDisabled)

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

      {hasDisabledOptions && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Niektóre opcje są niedostępne, ponieważ prowadziłyby do diety
            poniżej bezpiecznego minimum kalorycznego.
          </AlertDescription>
        </Alert>
      )}

      <RadioGroup
        value={value?.toString() || ''}
        onValueChange={(val: string) => onChange(parseFloat(val))}
        className='space-y-3'
      >
        {options.map((option) => (
          <div
            key={option.value}
            className={`flex items-start space-x-3 rounded-3xl border border-transparent bg-white p-4 shadow-sm transition-colors ${
              option.isDisabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:border-primary hover:bg-white'
            }`}
          >
            <RadioGroupItem
              value={option.value.toString()}
              id={`rate-${option.value}`}
              disabled={option.isDisabled}
              className='mt-1'
            />
            <Label
              htmlFor={`rate-${option.value}`}
              className={`flex-1 font-normal ${
                option.isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
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
              {option.isDisabled && option.reasonDisabled && (
                <div className='text-destructive mt-1 text-xs'>
                  {option.reasonDisabled}
                </div>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
