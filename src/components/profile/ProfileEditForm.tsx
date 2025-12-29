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
import {
  MACRO_RATIO_LABELS,
  MEAL_PLAN_TYPE_LABELS,
  calculateSelectedMealsFromTimeWindow,
  getSelectedMealsDescription,
} from '@/types/onboarding-view.types'
import { generateTimeOptions } from '@/lib/utils'

const TIME_OPTIONS = generateTimeOptions()

interface ProfileEditFormProps {
  initialData: ProfileDTO
}

const WEIGHT_MIN = 40
const WEIGHT_MAX = 150
const WEIGHT_STEP = 0.1

const HEIGHT_MIN = 140
const HEIGHT_MAX = 220
const HEIGHT_STEP = 1

const AGE_MIN = 18
const AGE_MAX = 100
const AGE_STEP = 1

export const ProfileEditForm = ({ initialData }: ProfileEditFormProps) => {
  const { form, isSubmitting, onSubmit } = useProfileForm(initialData)
  const goalValue = form.watch('goal')
  const weightValue = form.watch('weight_kg')
  const heightValue = form.watch('height_cm')
  const ageValue = form.watch('age')

  // Local state for inputs to allow free typing
  const [weightInputValue, setWeightInputValue] = useState(
    initialData.weight_kg?.toFixed(1) ?? WEIGHT_MIN.toFixed(1)
  )
  const [heightInputValue, setHeightInputValue] = useState(
    initialData.height_cm?.toString() ?? HEIGHT_MIN.toString()
  )
  const [ageInputValue, setAgeInputValue] = useState(
    initialData.age?.toString() ?? AGE_MIN.toString()
  )

  // Sync local inputs with form values (from slider or buttons)
  useEffect(() => {
    if (weightValue !== undefined && weightValue !== null) {
      setWeightInputValue(weightValue.toFixed(1))
    }
  }, [weightValue])

  useEffect(() => {
    if (heightValue !== undefined && heightValue !== null) {
      setHeightInputValue(heightValue.toString())
    }
  }, [heightValue])

  useEffect(() => {
    if (ageValue !== undefined && ageValue !== null) {
      setAgeInputValue(ageValue.toString())
    }
  }, [ageValue])

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

  const handleWeightInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    fieldOnChange: (value: number) => void
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleWeightInputBlur(fieldOnChange)
      ;(e.target as HTMLInputElement).blur()
    }
  }

  // Height handlers
  const handleHeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeightInputValue(e.target.value)
  }

  const handleHeightInputBlur = (fieldOnChange: (value: number) => void) => {
    const numValue = parseInt(heightInputValue)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(HEIGHT_MAX, Math.max(HEIGHT_MIN, numValue))
      fieldOnChange(clampedValue)
      setHeightInputValue(clampedValue.toString())
    } else {
      setHeightInputValue((heightValue ?? HEIGHT_MIN).toString())
    }
  }

  const handleHeightInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    fieldOnChange: (value: number) => void
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleHeightInputBlur(fieldOnChange)
      ;(e.target as HTMLInputElement).blur()
    }
  }

  // Age handlers
  const handleAgeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgeInputValue(e.target.value)
  }

  const handleAgeInputBlur = (fieldOnChange: (value: number) => void) => {
    const numValue = parseInt(ageInputValue)
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(AGE_MAX, Math.max(AGE_MIN, numValue))
      fieldOnChange(clampedValue)
      setAgeInputValue(clampedValue.toString())
    } else {
      setAgeInputValue((ageValue ?? AGE_MIN).toString())
    }
  }

  const handleAgeInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    fieldOnChange: (value: number) => void
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAgeInputBlur(fieldOnChange)
      ;(e.target as HTMLInputElement).blur()
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
                          onKeyDown={(e) =>
                            handleWeightInputKeyDown(e, field.onChange)
                          }
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

          {/* Wzrost - slider design like weight */}
          <FormField
            control={form.control}
            name='height_cm'
            render={({ field }) => (
              <FormItem>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-sm'>Wzrost</FormLabel>
                    <div className='flex items-center gap-2'>
                      <div className='flex flex-col'>
                        <button
                          type='button'
                          onClick={() =>
                            field.onChange(
                              Math.min(
                                HEIGHT_MAX,
                                (field.value ?? HEIGHT_MIN) + HEIGHT_STEP
                              )
                            )
                          }
                          className='text-muted-foreground/50 hover:text-muted-foreground h-3 px-1 text-[10px] transition-colors'
                          aria-label='Zwiększ wzrost'
                        >
                          ▲
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            field.onChange(
                              Math.max(
                                HEIGHT_MIN,
                                (field.value ?? HEIGHT_MIN) - HEIGHT_STEP
                              )
                            )
                          }
                          className='text-muted-foreground/50 hover:text-muted-foreground h-3 px-1 text-[10px] transition-colors'
                          aria-label='Zmniejsz wzrost'
                        >
                          ▼
                        </button>
                      </div>
                      <FormControl>
                        <Input
                          type='text'
                          inputMode='numeric'
                          value={heightInputValue}
                          onChange={handleHeightInputChange}
                          onBlur={() => handleHeightInputBlur(field.onChange)}
                          onKeyDown={(e) =>
                            handleHeightInputKeyDown(e, field.onChange)
                          }
                          className='h-10 w-24 text-center text-xl font-bold'
                          aria-label='Wzrost'
                        />
                      </FormControl>
                      <span className='text-foreground text-base font-normal'>
                        cm
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[field.value ?? HEIGHT_MIN]}
                    onValueChange={(values) => field.onChange(values[0])}
                    min={HEIGHT_MIN}
                    max={HEIGHT_MAX}
                    step={HEIGHT_STEP}
                    className='w-full'
                    aria-label='Wzrost'
                  />
                  <div className='text-muted-foreground flex justify-between text-xs'>
                    <span>{HEIGHT_MIN} cm</span>
                    <span>{HEIGHT_MAX} cm</span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Wiek - slider design like weight */}
          <FormField
            control={form.control}
            name='age'
            render={({ field }) => (
              <FormItem>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-sm'>Wiek</FormLabel>
                    <div className='flex items-center gap-2'>
                      <div className='flex flex-col'>
                        <button
                          type='button'
                          onClick={() =>
                            field.onChange(
                              Math.min(
                                AGE_MAX,
                                (field.value ?? AGE_MIN) + AGE_STEP
                              )
                            )
                          }
                          className='text-muted-foreground/50 hover:text-muted-foreground h-3 px-1 text-[10px] transition-colors'
                          aria-label='Zwiększ wiek'
                        >
                          ▲
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            field.onChange(
                              Math.max(
                                AGE_MIN,
                                (field.value ?? AGE_MIN) - AGE_STEP
                              )
                            )
                          }
                          className='text-muted-foreground/50 hover:text-muted-foreground h-3 px-1 text-[10px] transition-colors'
                          aria-label='Zmniejsz wiek'
                        >
                          ▼
                        </button>
                      </div>
                      <FormControl>
                        <Input
                          type='text'
                          inputMode='numeric'
                          value={ageInputValue}
                          onChange={handleAgeInputChange}
                          onBlur={() => handleAgeInputBlur(field.onChange)}
                          onKeyDown={(e) =>
                            handleAgeInputKeyDown(e, field.onChange)
                          }
                          className='h-10 w-24 text-center text-xl font-bold'
                          aria-label='Wiek'
                        />
                      </FormControl>
                      <span className='text-foreground text-base font-normal'>
                        lat
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[field.value ?? AGE_MIN]}
                    onValueChange={(values) => field.onChange(values[0])}
                    min={AGE_MIN}
                    max={AGE_MAX}
                    step={AGE_STEP}
                    className='w-full'
                    aria-label='Wiek'
                  />
                  <div className='text-muted-foreground flex justify-between text-xs'>
                    <span>{AGE_MIN} lat</span>
                    <span>{AGE_MAX} lat</span>
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

          {/* Plan posiłków */}
          <FormField
            control={form.control}
            name='meal_plan_type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan posiłków</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='rounded-sm border-0 bg-white shadow-sm'>
                      <SelectValue placeholder='Wybierz plan posiłków' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MEAL_PLAN_TYPE_LABELS).map(
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

          {/* Okno czasowe posiłków */}
          <div className='space-y-4 rounded-lg border border-gray-200 bg-white/60 p-4'>
            <div className='space-y-1'>
              <h3 className='text-sm font-medium'>Okno czasowe posiłków</h3>
              <p className='text-muted-foreground text-xs'>
                O której godzinie zazwyczaj jesz pierwszy i ostatni posiłek?
              </p>
            </div>

            <div className='flex flex-col gap-4 sm:flex-row'>
              <FormField
                control={form.control}
                name='eating_start_time'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel className='text-xs'>Rozpoczynam o:</FormLabel>
                    <Select
                      value={field.value ?? '07:00'}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='bg-white'>
                          <SelectValue placeholder='Wybierz' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-60'>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='eating_end_time'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel className='text-xs'>Kończę o:</FormLabel>
                    <Select
                      value={field.value ?? '19:00'}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='bg-white'>
                          <SelectValue placeholder='Wybierz' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-60'>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Podgląd automatycznie dobranych posiłków dla 2_main */}
            {form.watch('meal_plan_type') === '2_main' &&
              form.watch('eating_start_time') &&
              form.watch('eating_end_time') && (
                <div className='bg-primary/10 border-primary/20 rounded-md border p-3'>
                  <p className='text-muted-foreground text-xs'>
                    Na podstawie okna czasowego system dobierze:
                  </p>
                  <p className='text-primary text-sm font-medium'>
                    {getSelectedMealsDescription(
                      calculateSelectedMealsFromTimeWindow(
                        form.watch('eating_start_time')!,
                        form.watch('eating_end_time')!
                      )
                    )}
                  </p>
                </div>
              )}
          </div>

          {/* Proporcje makroskładników */}
          <FormField
            control={form.control}
            name='macro_ratio'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proporcje makroskładników</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='rounded-sm border-0 bg-white shadow-sm'>
                      <SelectValue placeholder='Wybierz proporcje makro' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MACRO_RATIO_LABELS).map(
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

          <Button type='submit' className='w-full' disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
