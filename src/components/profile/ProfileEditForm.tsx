/**
 * ProfileEditForm component
 *
 * Form for editing profile data using reusable onboarding components
 * Features collapsible sections and live preview of nutrition targets
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useProfileForm } from '@/hooks/useProfileForm'
import type { ProfileDTO } from '@/types/dto.types'

// Import onboarding components
import { ActivityLevelStep } from '@/components/onboarding/ActivityLevelStep'
import { GoalStep } from '@/components/onboarding/GoalStep'
import { MealPlanTypeStep } from '@/components/onboarding/MealPlanTypeStep'
import { MacroRatioStep } from '@/components/onboarding/MacroRatioStep'

// Import helpers
import {
  calculateNutritionTargetsClient,
  generateWeightLossOptions,
} from '@/lib/utils/nutrition-calculator-client'
import type { OnboardingFormData } from '@/types/onboarding-view.types'

interface ProfileEditFormProps {
  initialData: ProfileDTO
}

// Section configuration
interface SectionConfig {
  id: string
  title: string
  description: string
}

const SECTION_BODY: SectionConfig = {
  id: 'body',
  title: 'Dane fizyczne',
  description: 'Waga, wzrost i wiek',
}

const SECTION_ACTIVITY: SectionConfig = {
  id: 'activity',
  title: 'Poziom aktywności',
  description: 'Twoja codzienna aktywność fizyczna',
}

const SECTION_GOAL: SectionConfig = {
  id: 'goal',
  title: 'Cel i tempo',
  description: 'Cel żywieniowy i tempo zmian',
}

const SECTION_MEALS: SectionConfig = {
  id: 'meals',
  title: 'Plan posiłków',
  description: 'Liczba i godziny posiłków',
}

const SECTION_MACROS: SectionConfig = {
  id: 'macros',
  title: 'Proporcje makro',
  description: 'Rozkład makroskładników',
}

// Numeric field slider configuration
const WEIGHT_CONFIG = {
  min: 40,
  max: 150,
  step: 0.1,
  unit: 'kg',
  label: 'Waga',
}
const HEIGHT_CONFIG = {
  min: 140,
  max: 220,
  step: 1,
  unit: 'cm',
  label: 'Wzrost',
}
const AGE_CONFIG = { min: 18, max: 100, step: 1, unit: 'lat', label: 'Wiek' }

/**
 * NumericSliderField - Reusable slider with input field
 */
function NumericSliderField({
  value,
  onChange,
  config,
}: {
  value: number
  onChange: (value: number) => void
  config: typeof WEIGHT_CONFIG
}) {
  const [inputValue, setInputValue] = useState(
    config.step < 1 ? value.toFixed(1) : value.toString()
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    const numValue =
      config.step < 1 ? parseFloat(inputValue) : parseInt(inputValue)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(config.max, Math.max(config.min, numValue))
      const roundedValue =
        config.step < 1 ? Math.round(clampedValue * 10) / 10 : clampedValue
      onChange(roundedValue)
      setInputValue(
        config.step < 1 ? roundedValue.toFixed(1) : roundedValue.toString()
      )
    } else {
      setInputValue(config.step < 1 ? value.toFixed(1) : value.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleInputBlur()
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <span className='text-foreground text-sm font-medium'>
          {config.label}
        </span>
        <div className='flex items-center gap-2'>
          <div className='flex flex-col'>
            <button
              type='button'
              onClick={() =>
                onChange(Math.min(config.max, value + config.step))
              }
              className='text-foreground hover:text-foreground/70 h-5 px-3 text-base transition-colors'
              aria-label={`Zwiększ ${config.label.toLowerCase()}`}
            >
              ▲
            </button>
            <button
              type='button'
              onClick={() =>
                onChange(Math.max(config.min, value - config.step))
              }
              className='text-foreground hover:text-foreground/70 h-5 px-3 text-base transition-colors'
              aria-label={`Zmniejsz ${config.label.toLowerCase()}`}
            >
              ▼
            </button>
          </div>
          <Input
            type='text'
            inputMode={config.step < 1 ? 'decimal' : 'numeric'}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className='h-10 w-24 text-center text-xl font-bold'
            aria-label={config.label}
          />
          <span className='text-foreground w-8 text-base font-normal'>
            {config.unit}
          </span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => {
          const newValue = values[0] ?? config.min
          onChange(newValue)
          setInputValue(
            config.step < 1 ? newValue.toFixed(1) : newValue.toString()
          )
        }}
        min={config.min}
        max={config.max}
        step={config.step}
        className='w-full'
        aria-label={config.label}
      />
      <div className='text-muted-foreground flex justify-between text-xs'>
        <span>
          {config.min} {config.unit}
        </span>
        <span>
          {config.max} {config.unit}
        </span>
      </div>
    </div>
  )
}

/**
 * CollapsibleSection - Expandable section with header
 */
function CollapsibleSection({
  config,
  isOpen,
  onToggle,
  children,
}: {
  config: SectionConfig
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className='overflow-hidden rounded-[16px] border-2 border-white bg-[var(--bg-card)] shadow-[var(--shadow-elevated)] backdrop-blur-[20px]'>
      <button
        type='button'
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between border-b-2 bg-[var(--bg-card)] p-4 transition-colors',
          isOpen ? 'border-white' : 'border-transparent'
        )}
      >
        <div className='text-left'>
          <h3 className='text-foreground font-semibold'>{config.title}</h3>
          <p className='text-muted-foreground text-sm'>{config.description}</p>
        </div>
        {isOpen ? (
          <ChevronUp className='text-muted-foreground h-5 w-5' />
        ) : (
          <ChevronDown className='text-muted-foreground h-5 w-5' />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className='border-t border-white/30 p-4 pt-0'>{children}</div>
      </div>
    </div>
  )
}

export const ProfileEditForm = ({ initialData }: ProfileEditFormProps) => {
  const { form, isSubmitting, onSubmit } = useProfileForm(initialData)

  // Track which sections are open
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }, [])

  // Watch form values for live calculations
  const watchedValues = form.watch()

  // Build OnboardingFormData-like object for nutrition calculations
  const formDataForCalculation: Partial<OnboardingFormData> = useMemo(
    () => ({
      gender: initialData.gender,
      age: watchedValues.age ?? initialData.age,
      weight_kg: watchedValues.weight_kg ?? initialData.weight_kg,
      height_cm: watchedValues.height_cm ?? initialData.height_cm,
      activity_level:
        watchedValues.activity_level ?? initialData.activity_level,
      goal: watchedValues.goal ?? initialData.goal,
      weight_loss_rate_kg_week:
        watchedValues.weight_loss_rate_kg_week ??
        initialData.weight_loss_rate_kg_week,
      macro_ratio: watchedValues.macro_ratio ?? initialData.macro_ratio,
    }),
    [watchedValues, initialData]
  )

  // Calculate nutrition targets in real-time
  const calculatedTargets = useMemo(() => {
    return calculateNutritionTargetsClient(formDataForCalculation)
  }, [formDataForCalculation])

  // Generate weight loss options
  const weightLossOptions = useMemo(() => {
    if (watchedValues.goal !== 'weight_loss') return []
    return generateWeightLossOptions(formDataForCalculation)
  }, [formDataForCalculation, watchedValues.goal])

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      {/* Body Section */}
      <CollapsibleSection
        config={SECTION_BODY}
        isOpen={openSections.has('body')}
        onToggle={() => toggleSection('body')}
      >
        <div className='space-y-6 pt-4'>
          <NumericSliderField
            value={watchedValues.weight_kg ?? initialData.weight_kg ?? 70}
            onChange={(value) =>
              form.setValue('weight_kg', value, { shouldDirty: true })
            }
            config={WEIGHT_CONFIG}
          />
          <NumericSliderField
            value={watchedValues.height_cm ?? initialData.height_cm ?? 170}
            onChange={(value) =>
              form.setValue('height_cm', value, { shouldDirty: true })
            }
            config={HEIGHT_CONFIG}
          />
          <NumericSliderField
            value={watchedValues.age ?? initialData.age ?? 30}
            onChange={(value) =>
              form.setValue('age', value, { shouldDirty: true })
            }
            config={AGE_CONFIG}
          />
        </div>
      </CollapsibleSection>

      {/* Activity Level Section */}
      <CollapsibleSection
        config={SECTION_ACTIVITY}
        isOpen={openSections.has('activity')}
        onToggle={() => toggleSection('activity')}
      >
        <div className='pt-4'>
          <ActivityLevelStep
            value={watchedValues.activity_level ?? initialData.activity_level}
            onChange={(value) =>
              form.setValue('activity_level', value, { shouldDirty: true })
            }
            hideHeader
          />
        </div>
      </CollapsibleSection>

      {/* Goal Section */}
      <CollapsibleSection
        config={SECTION_GOAL}
        isOpen={openSections.has('goal')}
        onToggle={() => toggleSection('goal')}
      >
        <div className='pt-4'>
          <GoalStep
            value={watchedValues.goal ?? initialData.goal}
            onChange={(value) => {
              form.setValue('goal', value, { shouldDirty: true })
              // Reset weight loss rate when changing to maintenance
              if (value === 'weight_maintenance') {
                form.setValue('weight_loss_rate_kg_week', undefined, {
                  shouldDirty: true,
                })
              }
            }}
            weightLossRate={watchedValues.weight_loss_rate_kg_week ?? null}
            onWeightLossRateChange={(value) =>
              form.setValue('weight_loss_rate_kg_week', value, {
                shouldDirty: true,
              })
            }
            weightLossOptions={weightLossOptions}
            hideHeader
          />
        </div>
      </CollapsibleSection>

      {/* Meal Plan Section */}
      <CollapsibleSection
        config={SECTION_MEALS}
        isOpen={openSections.has('meals')}
        onToggle={() => toggleSection('meals')}
      >
        <div className='pt-4'>
          <MealPlanTypeStep
            value={watchedValues.meal_plan_type ?? initialData.meal_plan_type}
            onChange={(value) =>
              form.setValue('meal_plan_type', value, { shouldDirty: true })
            }
            eatingStartTime={
              watchedValues.eating_start_time ?? initialData.eating_start_time
            }
            eatingEndTime={
              watchedValues.eating_end_time ?? initialData.eating_end_time
            }
            onEatingStartTimeChange={(time) =>
              form.setValue('eating_start_time', time, { shouldDirty: true })
            }
            onEatingEndTimeChange={(time) =>
              form.setValue('eating_end_time', time, { shouldDirty: true })
            }
            hideHeader
          />
        </div>
      </CollapsibleSection>

      {/* Macro Ratio Section */}
      <CollapsibleSection
        config={SECTION_MACROS}
        isOpen={openSections.has('macros')}
        onToggle={() => toggleSection('macros')}
      >
        <div className='pt-4'>
          <MacroRatioStep
            value={watchedValues.macro_ratio ?? initialData.macro_ratio}
            onChange={(value) =>
              form.setValue('macro_ratio', value, { shouldDirty: true })
            }
            targetCalories={calculatedTargets?.target_calories ?? null}
            hideHeader
          />
        </div>
      </CollapsibleSection>

      {/* Submit Button */}
      <Button
        type='submit'
        className='w-full'
        disabled={isSubmitting || !form.formState.isDirty}
        size='lg'
      >
        {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
      </Button>
    </form>
  )
}
