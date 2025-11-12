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
import { WeightLossRateStep } from './WeightLossRateStep'
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
  disclaimer_accepted: false,
}

export function OnboardingClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] =
    useState<OnboardingFormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)

  // Calculate total steps based on goal
  const totalSteps = formData.goal === 'weight_loss' ? 9 : 8

  // Focus management: Focus step content when step changes
  useEffect(() => {
    if (stepContentRef.current) {
      stepContentRef.current.focus()
      // Scroll to top of step content on mobile
      stepContentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
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
  const isStep6Valid = formData.goal !== null
  const isStep7Valid =
    formData.goal === 'weight_maintenance' ||
    (formData.weight_loss_rate_kg_week !== null &&
      weightLossOptions.find(
        (opt) => opt.value === formData.weight_loss_rate_kg_week
      )?.isDisabled === false)
  const isStep8Valid = true // Summary step is always valid
  const isStep9Valid = formData.disclaimer_accepted === true

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
  ])

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (!isCurrentStepValid()) return

    // Skip step 7 if goal is not weight loss
    if (currentStep === 6 && formData.goal === 'weight_maintenance') {
      setCurrentStep(8)
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }, [currentStep, formData.goal, isCurrentStepValid, totalSteps])

  const handleBack = useCallback(() => {
    // Skip step 7 when going back if goal is not weight loss
    if (currentStep === 8 && formData.goal === 'weight_maintenance') {
      setCurrentStep(6)
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1))
    }
  }, [currentStep, formData.goal])

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!isStep9Valid || !calculatedTargets) {
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
  }, [formData, calculatedTargets, isStep9Valid, router])

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
        const isLastStep =
          currentStep === 9 ||
          (currentStep === 8 && formData.goal === 'weight_maintenance')
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
    formData.goal,
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
          />
        )
      case 7:
        return (
          <WeightLossRateStep
            value={formData.weight_loss_rate_kg_week}
            onChange={(value) => updateField('weight_loss_rate_kg_week', value)}
            options={weightLossOptions}
          />
        )
      case 8:
        return (
          <SummaryStep
            formData={formData}
            calculatedTargets={calculatedTargets}
          />
        )
      case 9:
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
    const steps = [
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
    ]

    // Add weight loss rate step only if goal is weight_loss
    if (formData.goal === 'weight_loss') {
      steps.push({
        number: 7,
        title: 'Tempo',
        isCompleted: currentStep > 7,
        isCurrent: currentStep === 7,
      })
    }

    steps.push(
      {
        number: formData.goal === 'weight_loss' ? 8 : 7,
        title: 'Podsumowanie',
        isCompleted: currentStep > (formData.goal === 'weight_loss' ? 8 : 7),
        isCurrent: currentStep === (formData.goal === 'weight_loss' ? 8 : 7),
      },
      {
        number: formData.goal === 'weight_loss' ? 9 : 8,
        title: 'Oświadczenie',
        isCompleted: currentStep > (formData.goal === 'weight_loss' ? 9 : 8),
        isCurrent: currentStep === (formData.goal === 'weight_loss' ? 9 : 8),
      }
    )

    return steps
  }, [currentStep, formData.goal])

  return (
    <div className='bg-background min-h-screen'>
      <div className='container mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 md:py-12'>
        {/* Header */}
        <div className='mb-6 text-center sm:mb-8'>
          <h1 className='text-foreground mb-2 text-2xl font-bold sm:text-3xl md:text-4xl'>
            Rozpocznijmy Twoją podróż
          </h1>
          <p className='text-muted-foreground px-4 text-sm sm:text-base'>
            Odpowiedz na kilka pytań, a my stworzymy dla Ciebie spersonalizowany
            plan żywieniowy
          </p>
        </div>

        {/* Stepper */}
        {currentStep < 10 && <StepperIndicator steps={stepperSteps} />}

        {/* Step Content */}
        <div
          ref={stepContentRef}
          className='card-soft mb-4 rounded-3xl border-0 p-6 shadow-sm sm:mb-6 sm:p-8 md:p-10'
          role='region'
          aria-label={`Krok ${currentStep} z ${totalSteps}`}
          aria-live='polite'
          tabIndex={-1}
        >
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep < 10 && (
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={totalSteps}
            canGoBack={currentStep > 1}
            canGoNext={isCurrentStepValid()}
            isLastStep={
              currentStep === 9 ||
              (currentStep === 8 && formData.goal === 'weight_maintenance')
            }
            isLoading={isSubmitting}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        )}

        {/* Error handling */}
        {submitError && (
          <div className='mt-6 rounded-lg bg-red-50 p-4 text-center'>
            <p className='text-destructive text-sm'>{submitError}</p>
          </div>
        )}
      </div>
    </div>
  )
}
