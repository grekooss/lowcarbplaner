/**
 * ProfileEditForm component
 *
 * Form for editing profile data with validation and submission
 * Glassmorphism style with slider for weight and select dropdowns for selections
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useProfileForm } from '@/hooks/useProfileForm'
import type { ProfileDTO } from '@/types/dto.types'
import {
  ACTIVITY_LEVEL_LABELS,
  GOAL_LABELS,
  WEIGHT_LOSS_RATE_OPTIONS,
} from '@/types/profile-view.types'

interface ProfileEditFormProps {
  initialData: ProfileDTO
}

const WEIGHT_MIN = 40
const WEIGHT_MAX = 150
const WEIGHT_STEP = 0.1

export const ProfileEditForm = ({ initialData }: ProfileEditFormProps) => {
  const { form, isSubmitting, onSubmit } = useProfileForm(initialData)
  const goalValue = form.watch('goal')
  const weightValue = form.watch('weight_kg')

  // Local state for weight input to allow free typing
  const [weightInputValue, setWeightInputValue] = useState(
    initialData.weight_kg?.toFixed(1) ?? WEIGHT_MIN.toFixed(1)
  )

  // Sync local input with form value (from slider or buttons)
  useEffect(() => {
    if (weightValue !== undefined && weightValue !== null) {
      setWeightInputValue(weightValue.toFixed(1))
    }
  }, [weightValue])

  const handleWeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setWeightInputValue(inputValue)
  }

  const handleWeightInputBlur = (fieldOnChange: (value: number) => void) => {
    const numValue = parseFloat(weightInputValue)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, numValue))
      const roundedValue = Math.round(clampedValue * 10) / 10
      fieldOnChange(roundedValue)
      setWeightInputValue(roundedValue.toFixed(1))
    } else {
      setWeightInputValue((weightValue ?? WEIGHT_MIN).toFixed(1))
    }
  }

  return (
    <div className='rounded-[16px] border-2 border-[var(--glass-border)] bg-white/40 p-6 shadow-[var(--shadow-elevated)] backdrop-blur-[20px]'>
      <h2 className='text-foreground mb-4 text-xl font-bold'>Edycja profilu</h2>
      <Form {...form}>
        <form onSubmit={onSubmit} className='space-y-4'>
          {/* Waga - slider design like onboarding */}
          <FormField
            control={form.control}
            name='weight_kg'
            render={({ field }) => (
              <FormItem>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-sm'>Waga</FormLabel>
                    <div className='flex items-center gap-2'>
                      <div className='flex flex-col'>
                        <button
                          type='button'
                          onClick={() =>
                            field.onChange(
                              Math.min(
                                WEIGHT_MAX,
                                (field.value ?? WEIGHT_MIN) + WEIGHT_STEP
                              )
                            )
                          }
                          className='text-muted-foreground/50 hover:text-muted-foreground h-3 px-1 text-[10px] transition-colors'
                          aria-label='Zwiększ wagę'
                        >
                          ▲
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            field.onChange(
                              Math.max(
                                WEIGHT_MIN,
                                (field.value ?? WEIGHT_MIN) - WEIGHT_STEP
                              )
                            )
                          }
                          className='text-muted-foreground/50 hover:text-muted-foreground h-3 px-1 text-[10px] transition-colors'
                          aria-label='Zmniejsz wagę'
                        >
                          ▼
                        </button>
                      </div>
                      <FormControl>
                        <Input
                          type='text'
                          inputMode='decimal'
                          value={weightInputValue}
                          onChange={handleWeightInputChange}
                          onBlur={() => handleWeightInputBlur(field.onChange)}
                          className='h-10 w-24 text-center text-xl font-bold'
                          aria-label='Waga'
                        />
                      </FormControl>
                      <span className='text-foreground text-base font-normal'>
                        kg
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[field.value ?? WEIGHT_MIN]}
                    onValueChange={(values) => field.onChange(values[0])}
                    min={WEIGHT_MIN}
                    max={WEIGHT_MAX}
                    step={WEIGHT_STEP}
                    className='w-full'
                    aria-label='Waga'
                  />
                  <div className='text-muted-foreground flex justify-between text-xs'>
                    <span>{WEIGHT_MIN} kg</span>
                    <span>{WEIGHT_MAX} kg</span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Poziom aktywności */}
          <FormField
            control={form.control}
            name='activity_level'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poziom aktywności</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='rounded-sm border-0 bg-white shadow-sm'>
                      <SelectValue placeholder='Wybierz poziom aktywności' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(ACTIVITY_LEVEL_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cel */}
          <FormField
            control={form.control}
            name='goal'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cel</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='rounded-sm border-0 bg-white shadow-sm'>
                      <SelectValue placeholder='Wybierz swój cel' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(GOAL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tempo utraty wagi (warunkowe) */}
          {goalValue === 'weight_loss' && (
            <FormField
              control={form.control}
              name='weight_loss_rate_kg_week'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo utraty wagi</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseFloat(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className='rounded-sm border-0 bg-white shadow-sm'>
                        <SelectValue placeholder='Wybierz tempo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WEIGHT_LOSS_RATE_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type='submit' className='w-full' disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
