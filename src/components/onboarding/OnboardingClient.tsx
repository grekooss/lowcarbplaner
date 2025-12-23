'use client'

/**
 * OnboardingClient Component
 *
 * Main orchestrator for the onboarding flow
 * Manages multi-step form state, navigation, and submission
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type {
  OnboardingFormData,
  CalculatedTargets,
  WeightLossOption,
} from '@/types/onboarding-view.types'
import {
  calculateNutritionTargetsClient,
  generateWeightLossOptions,
} from '@/lib/utils/nutrition-calculator-client'
import { createProfile } from '@/lib/actions/profile'
import { GenderStep } from './GenderStep'
import { AgeStep } from './AgeStep'
import { WeightStep } from './WeightStep'
import { HeightStep } from './HeightStep'
import { ActivityLevelStep } from './ActivityLevelStep'
import { GoalStep } from './GoalStep'
import { MealPlanTypeStep } from './MealPlanTypeStep'
import { MacroRatioStep } from './MacroRatioStep'
import { SummaryStep } from './SummaryStep'
import { DisclaimerStep } from './DisclaimerStep'
import { StepperIndicator } from './StepperIndicator'
import { NavigationButtons } from './NavigationButtons'
import { toast } from 'sonner'

const INITIAL_FORM_DATA: OnboardingFormData = {
  gender: null,
  age: null,
  weight_kg: null,
  height_cm: null,
  activity_level: null,
  goal: null,
  weight_loss_rate_kg_week: null,
  meal_plan_type: null,
  macro_ratio: null,
  disclaimer_accepted: false,
}

const TOTAL_STEPS = 10

export function OnboardingClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] =
    useState<OnboardingFormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)

  // Focus management: Focus step content when step changes
  useEffect(() => {
    if (stepContentRef.current) {
      stepContentRef.current.focus()
      // Scroll to top of page only if not already visible
      const rect = stepContentRef.current.getBoundingClientRect()
      if (rect.top < 0) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    }
  }, [currentStep])

  // Calculate nutrition targets in real-time
  const calculatedTargets: CalculatedTargets | null = useMemo(() => {
    return calculateNutritionTargetsClient(formData)
  }, [formData])

  // Generate weight loss options with validation
  const weightLossOptions: WeightLossOption[] = useMemo(() => {
    if (formData.goal !== 'weight_loss') return []
    return generateWeightLossOptions(formData)
  }, [formData])

  // Update form field
  const updateField = useCallback(
    <K extends keyof OnboardingFormData>(
      field: K,
      value: OnboardingFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // Validation helpers
  const isStep1Valid = formData.gender !== null
  const isStep2Valid =
    formData.age !== null && formData.age >= 18 && formData.age <= 100
  const isStep3Valid =
    formData.weight_kg !== null &&
    formData.weight_kg >= 40 &&
    formData.weight_kg <= 300
  const isStep4Valid =
    formData.height_cm !== null &&
    formData.height_cm >= 140 &&
    formData.height_cm <= 250
  const isStep5Valid = formData.activity_level !== null
  const isStep6Valid =
    formData.goal !== null &&
    (formData.goal === 'weight_maintenance' ||
      (formData.weight_loss_rate_kg_week !== null &&
        weightLossOptions.find(
          (opt) => opt.value === formData.weight_loss_rate_kg_week
        )?.isDisabled === false))
  const isStep7Valid = formData.meal_plan_type !== null
  const isStep8Valid = formData.macro_ratio !== null
  const isStep9Valid = true // Summary step is always valid
  const isStep10Valid = formData.disclaimer_accepted === true

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    switch (currentStep) {
      case 1:
        return isStep1Valid
      case 2:
        return isStep2Valid
      case 3:
        return isStep3Valid
      case 4:
        return isStep4Valid
      case 5:
        return isStep5Valid
      case 6:
        return isStep6Valid
      case 7:
        return isStep7Valid
      case 8:
        return isStep8Valid
      case 9:
        return isStep9Valid
      case 10:
        return isStep10Valid
      default:
        return false
    }
  }, [
    currentStep,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    isStep5Valid,
    isStep6Valid,
    isStep7Valid,
    isStep8Valid,
    isStep9Valid,
    isStep10Valid,
  ])

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (!isCurrentStepValid()) return
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }, [isCurrentStepValid])

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }, [])

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!isStep10Valid || !calculatedTargets) {
      toast.error('Musisz zaakceptować oświadczenie przed kontynuowaniem.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Create profile
      const profileResult = await createProfile({
        gender: formData.gender!,
        age: formData.age!,
        weight_kg: formData.weight_kg!,
        height_cm: formData.height_cm!,
        activity_level: formData.activity_level!,
        goal: formData.goal!,
        weight_loss_rate_kg_week:
          formData.weight_loss_rate_kg_week ?? undefined,
        meal_plan_type: formData.meal_plan_type!,
        macro_ratio: formData.macro_ratio!,
        disclaimer_accepted_at: new Date().toISOString(),
      })

      if (profileResult.error) {
        throw new Error(profileResult.error || 'Nie udało się utworzyć profilu')
      }

      // Success - redirect to dashboard (plan will be generated there automatically)
      toast.success('Twój profil został utworzony.')

      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding submission error:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'Wystąpił nieznany błąd'
      )
      setIsSubmitting(false)
    }
  }, [formData, calculatedTargets, isStep10Valid, router])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Enter key: proceed to next step if valid
      if (e.key === 'Enter' && isCurrentStepValid()) {
        e.preventDefault()
        const isLastStep = currentStep === TOTAL_STEPS
        if (isLastStep) {
          handleSubmit()
        } else {
          handleNext()
        }
      }

      // Escape key: go back
      if (e.key === 'Escape' && currentStep > 1 && !isSubmitting) {
        e.preventDefault()
        handleBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    currentStep,
    isCurrentStepValid,
    isSubmitting,
    handleNext,
    handleBack,
    handleSubmit,
  ])

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <GenderStep
            value={formData.gender}
            onChange={(value) => updateField('gender', value)}
          />
        )
      case 2:
        return (
          <AgeStep
            value={formData.age}
            onChange={(value) => updateField('age', value)}
            error={
              formData.age !== null && !isStep2Valid
                ? 'Wiek musi być między 18 a 100 lat'
                : undefined
            }
          />
        )
      case 3:
        return (
          <WeightStep
            value={formData.weight_kg}
            onChange={(value) => updateField('weight_kg', value)}
            error={
              formData.weight_kg !== null && !isStep3Valid
                ? 'Waga musi być między 40 a 300 kg'
                : undefined
            }
          />
        )
      case 4:
        return (
          <HeightStep
            value={formData.height_cm}
            onChange={(value) => updateField('height_cm', value)}
            error={
              formData.height_cm !== null && !isStep4Valid
                ? 'Wzrost musi być między 140 a 250 cm'
                : undefined
            }
          />
        )
      case 5:
        return (
          <ActivityLevelStep
            value={formData.activity_level}
            onChange={(value) => updateField('activity_level', value)}
          />
        )
      case 6:
        return (
          <GoalStep
            value={formData.goal}
            onChange={(value) => {
              updateField('goal', value)
              // Reset weight loss rate when changing goal
              if (value === 'weight_maintenance') {
                updateField('weight_loss_rate_kg_week', null)
              }
            }}
            weightLossRate={formData.weight_loss_rate_kg_week}
            onWeightLossRateChange={(value) =>
              updateField('weight_loss_rate_kg_week', value)
            }
            weightLossOptions={weightLossOptions}
          />
        )
      case 7:
        return (
          <MealPlanTypeStep
            value={formData.meal_plan_type}
            onChange={(value) => updateField('meal_plan_type', value)}
          />
        )
      case 8:
        return (
          <MacroRatioStep
            value={formData.macro_ratio}
            onChange={(value) => updateField('macro_ratio', value)}
          />
        )
      case 9:
        return (
          <SummaryStep
            formData={formData}
            calculatedTargets={calculatedTargets}
          />
        )
      case 10:
        return (
          <DisclaimerStep
            value={formData.disclaimer_accepted}
            onChange={(value) => updateField('disclaimer_accepted', value)}
          />
        )
      default:
        return null
    }
  }

  // Generate stepper steps
  const stepperSteps = useMemo(() => {
    return [
      {
        number: 1,
        title: 'Płeć',
        isCompleted: currentStep > 1,
        isCurrent: currentStep === 1,
      },
      {
        number: 2,
        title: 'Wiek',
        isCompleted: currentStep > 2,
        isCurrent: currentStep === 2,
      },
      {
        number: 3,
        title: 'Waga',
        isCompleted: currentStep > 3,
        isCurrent: currentStep === 3,
      },
      {
        number: 4,
        title: 'Wzrost',
        isCompleted: currentStep > 4,
        isCurrent: currentStep === 4,
      },
      {
        number: 5,
        title: 'Aktywność',
        isCompleted: currentStep > 5,
        isCurrent: currentStep === 5,
      },
      {
        number: 6,
        title: 'Cel',
        isCompleted: currentStep > 6,
        isCurrent: currentStep === 6,
      },
      {
        number: 7,
        title: 'Posiłki',
        isCompleted: currentStep > 7,
        isCurrent: currentStep === 7,
      },
      {
        number: 8,
        title: 'Makro',
        isCompleted: currentStep > 8,
        isCurrent: currentStep === 8,
      },
      {
        number: 9,
        title: 'Przegląd',
        isCompleted: currentStep > 9,
        isCurrent: currentStep === 9,
      },
      {
        number: 10,
        title: 'Zgoda',
        isCompleted: currentStep > 10,
        isCurrent: currentStep === 10,
      },
    ]
  }, [currentStep])

  return (
    <div className='min-h-screen'>
      <div className='container mx-auto max-w-3xl px-2 pb-4 sm:px-6 sm:pb-6 md:pb-8'>
        {/* Header - glassmorphism card - only visible on first step */}
        {currentStep === 1 && (
          <div className='mb-4 rounded-[16px] border-2 border-[var(--glass-border)] bg-white/40 px-4 py-3 text-center shadow-[var(--shadow-glass)] backdrop-blur-[20px] sm:mb-5 sm:px-6 sm:py-4'>
            <h1 className='text-foreground mb-1 text-lg font-bold sm:text-2xl md:text-3xl'>
              Rozpocznijmy Twoją podróż
            </h1>
            <p className='text-muted-foreground text-xs sm:text-sm'>
              Odpowiedz na kilka pytań, a my stworzymy dla Ciebie
              spersonalizowany plan żywieniowy
            </p>
          </div>
        )}

        {/* Stepper */}
        {currentStep <= TOTAL_STEPS && (
          <StepperIndicator steps={stepperSteps} />
        )}

        {/* Step Content - glassmorphism card */}
        <div
          ref={stepContentRef}
          className='mb-4 rounded-[16px] border-2 border-[var(--glass-border)] bg-white/40 px-4 py-3 shadow-[var(--shadow-elevated)] backdrop-blur-[20px] outline-none sm:p-4 md:p-6 md:py-3'
          role='region'
          aria-label={`Krok ${currentStep} z ${TOTAL_STEPS}`}
          aria-live='polite'
          tabIndex={-1}
        >
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep <= TOTAL_STEPS && (
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            canGoNext={isCurrentStepValid()}
            isLastStep={currentStep === TOTAL_STEPS}
            isLoading={isSubmitting}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        )}

        {/* Error handling - glassmorphism */}
        {submitError && (
          <div className='mt-6 rounded-[16px] border-2 border-red-200/50 bg-red-50/60 p-4 text-center backdrop-blur-[16px]'>
            <p className='text-destructive text-sm'>{submitError}</p>
          </div>
        )}
      </div>
    </div>
  )
}
