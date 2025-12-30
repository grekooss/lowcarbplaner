'use client'

/**
 * MealPlanTypeStep Component
 *
 * Step 7: Meal plan type selection + eating time window
 * Allows user to select how many meals per day they want
 * Uses time window to automatically determine meal types for '2_main' option
 */

import { useState, useEffect, useCallback } from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { RangeSlider } from '@/components/ui/range-slider'
import { cn } from '@/lib/utils'
import {
  MEAL_PLAN_TYPE_LABELS,
  MEAL_PLAN_TYPE_DESCRIPTIONS,
  calculateMealSchedule,
} from '@/types/onboarding-view.types'
import type { Enums } from '@/types/database.types'

// Konwersja czasu na indeks (0-47 dla 30-minutowych kroków)
function timeToIndex(time: string): number {
  const parts = time.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return hours * 2 + (minutes >= 30 ? 1 : 0)
}

// Konwersja indeksu na czas
function indexToTime(index: number): string {
  const hours = Math.floor(index / 2)
  const minutes = (index % 2) * 30
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Formatuj czas do HH:MM (usuwa sekundy jeśli są)
function formatTime(time: string): string {
  const parts = time.split(':')
  return `${parts[0] ?? '00'}:${parts[1] ?? '00'}`
}

// Etykiety godzin do wyświetlenia na osi
const TIME_LABELS = ['0:00', '6:00', '12:00', '18:00', '24:00']

// Opcje Intermittent Fasting (godziny postu : godziny jedzenia)
const IF_OPTIONS = [
  { label: 'Brak', hours: null, description: 'Dowolne okno' },
  { label: '12:12', hours: 12, description: '12h jedzenia' },
  { label: '14:10', hours: 10, description: '10h jedzenia' },
  { label: '16:8', hours: 8, description: '8h jedzenia' },
  { label: '18:6', hours: 6, description: '6h jedzenia' },
  { label: '20:4', hours: 4, description: '4h jedzenia' },
] as const

interface MealPlanTypeStepProps {
  value: Enums<'meal_plan_type_enum'> | null
  onChange: (value: Enums<'meal_plan_type_enum'>) => void
  eatingStartTime: string | null
  eatingEndTime: string | null
  onEatingStartTimeChange: (time: string) => void
  onEatingEndTimeChange: (time: string) => void
  /** Hide header and description (for use in profile edit) */
  hideHeader?: boolean
}

const MEAL_PLAN_TYPES: Enums<'meal_plan_type_enum'>[] = [
  '3_main_2_snacks',
  '3_main_1_snack',
  '3_main',
  '2_main',
]

// Interfejs dla posiłku z możliwością edycji
interface EditableMeal {
  type: string
  label: string
  index: number // wartość slidera (0-47)
}

/**
 * Interaktywny slider do ustawiania godzin posiłków
 */
function MealTimeSlider({
  meals,
  onMealsChange,
  startIndex,
  endIndex,
}: {
  meals: EditableMeal[]
  onMealsChange: (meals: EditableMeal[]) => void
  startIndex: number
  endIndex: number
}) {
  const values = meals.map((m) => m.index)

  const handleValueChange = (newValues: number[]) => {
    const updatedMeals = meals.map((meal, idx) => {
      // Skrajne posiłki (pierwszy i ostatni) są zablokowane
      if (idx === 0 || idx === meals.length - 1) {
        return meal
      }
      return {
        ...meal,
        index: newValues[idx] ?? meal.index,
      }
    })
    onMealsChange(updatedMeals)
  }

  // Rozdziel posiłki na główne i przekąski
  const mainMeals = meals.filter(
    (m) => m.type === 'breakfast' || m.type === 'lunch' || m.type === 'dinner'
  )
  const snackMeals = meals.filter(
    (m) => m.type === 'snack_morning' || m.type === 'snack_afternoon'
  )
  const hasSnacks = snackMeals.length > 0

  // Funkcja do określenia wyrównania etykiety w zależności od pozycji
  const getLabelAlignment = (position: number): string => {
    if (position <= 10) return 'left-0 translate-x-0' // Lewa krawędź
    if (position >= 90) return 'right-0 translate-x-0' // Prawa krawędź
    return '-translate-x-1/2' // Środek
  }

  const getLabelStyle = (position: number): React.CSSProperties => {
    if (position <= 10) return { left: '0%' }
    if (position >= 90) return { right: '0%' }
    return { left: `${position}%` }
  }

  // Tekst etykiety wyrównany do krawędzi, ale godzina zawsze wycentrowana
  const getLabelTextAlign = (position: number): string => {
    if (position <= 10) return 'items-start'
    if (position >= 90) return 'items-end'
    return 'items-center'
  }

  // Godzina zawsze wycentrowana względem nazwy
  const getTimeAlign = (position: number): string => {
    if (position <= 10) return 'self-center'
    if (position >= 90) return 'self-center'
    return ''
  }

  return (
    <div className='mt-2 border-t border-white/50 pt-2'>
      {/* Etykiety nad sliderem - główne posiłki (pierwszy wiersz) */}
      <div className='relative mb-2 h-8'>
        {mainMeals.map((meal, idx) => {
          const position =
            ((meal.index - startIndex) / (endIndex - startIndex)) * 100
          const clampedPosition = Math.max(0, Math.min(100, position))
          return (
            <div
              key={`label-main-${meal.type}-${idx}`}
              className={cn(
                'absolute flex flex-col transition-all duration-150',
                getLabelAlignment(clampedPosition),
                getLabelTextAlign(clampedPosition)
              )}
              style={getLabelStyle(clampedPosition)}
            >
              <span className='text-muted-foreground text-[10px] leading-tight whitespace-nowrap'>
                {meal.label}
              </span>
              <span
                className={cn(
                  'text-foreground text-xs leading-tight font-semibold',
                  getTimeAlign(clampedPosition)
                )}
              >
                {indexToTime(meal.index)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Etykiety nad sliderem - przekąski (drugi wiersz) */}
      {hasSnacks && (
        <div className='relative mb-2 h-8'>
          {snackMeals.map((meal, idx) => {
            const position =
              ((meal.index - startIndex) / (endIndex - startIndex)) * 100
            const clampedPosition = Math.max(0, Math.min(100, position))
            return (
              <div
                key={`label-snack-${meal.type}-${idx}`}
                className={cn(
                  'absolute flex flex-col transition-all duration-150',
                  getLabelAlignment(clampedPosition),
                  getLabelTextAlign(clampedPosition)
                )}
                style={getLabelStyle(clampedPosition)}
              >
                <span className='text-muted-foreground text-[10px] leading-tight whitespace-nowrap'>
                  {meal.label}
                </span>
                <span
                  className={cn(
                    'text-foreground text-xs leading-tight font-semibold',
                    getTimeAlign(clampedPosition)
                  )}
                >
                  {indexToTime(meal.index)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Slider z wieloma uchwytami */}
      <SliderPrimitive.Root
        className='relative flex w-full touch-none items-center px-2.5 select-none'
        value={values}
        onValueChange={handleValueChange}
        min={startIndex}
        max={endIndex}
        step={1}
        minStepsBetweenThumbs={2}
      >
        <SliderPrimitive.Track className='bg-border relative h-2 w-full grow overflow-hidden rounded-full'>
          <SliderPrimitive.Range className='bg-primary absolute h-full' />
        </SliderPrimitive.Track>

        {meals.map((meal, idx) => {
          const isLocked = idx === 0 || idx === meals.length - 1
          return (
            <SliderPrimitive.Thumb
              key={`thumb-${meal.type}-${idx}`}
              className={cn(
                'ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 shadow transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                isLocked
                  ? 'border-primary bg-primary pointer-events-none cursor-default'
                  : 'border-primary cursor-grab bg-white active:cursor-grabbing'
              )}
              aria-label={meal.label}
            />
          )
        })}
      </SliderPrimitive.Root>

      {/* Etykiety godzin pod paskiem */}
      <div className='text-muted-foreground mt-2 flex justify-between text-xs'>
        <span>{indexToTime(startIndex)}</span>
        <span>{indexToTime(endIndex)}</span>
      </div>
    </div>
  )
}

// Funkcja pomocnicza do tworzenia początkowego stanu posiłków
function createInitialMeals(
  planType: Enums<'meal_plan_type_enum'>,
  startIdx: number,
  endIdx: number
): EditableMeal[] {
  const schedule = calculateMealSchedule(
    planType,
    indexToTime(startIdx),
    indexToTime(endIdx)
  )
  return schedule.map((meal) => ({
    type: meal.type,
    label: meal.label,
    index: timeToIndex(meal.time),
  }))
}

export function MealPlanTypeStep({
  value,
  onChange,
  eatingStartTime,
  eatingEndTime,
  onEatingStartTimeChange,
  onEatingEndTimeChange,
  hideHeader = false,
}: MealPlanTypeStepProps) {
  // Stan dla wybranego trybu IF (null = brak, liczba = godziny okna jedzenia)
  const [ifMode, setIfMode] = useState<number | null>(null)

  // Konwertuj czas na indeksy dla slidera
  const startIndex = timeToIndex(eatingStartTime || '07:00')
  const endIndex = timeToIndex(eatingEndTime || '19:00')

  // Stan dla edytowalnych godzin posiłków (per plan type)
  const [mealSchedules, setMealSchedules] = useState<
    Record<string, EditableMeal[]>
  >({})

  // Funkcja do uzyskania lub utworzenia harmonogramu dla danego planu
  const getMealsForPlan = useCallback(
    (planType: Enums<'meal_plan_type_enum'>): EditableMeal[] => {
      if (mealSchedules[planType]) {
        return mealSchedules[planType]
      }
      return createInitialMeals(planType, startIndex, endIndex)
    },
    [mealSchedules, startIndex, endIndex]
  )

  // Aktualizuj harmonogramy gdy zmieni się okno czasowe
  useEffect(() => {
    if (value) {
      // Przelicz pozycje posiłków proporcjonalnie do nowego okna
      setMealSchedules((prev) => {
        const current = prev[value]
        if (!current || current.length === 0) return prev

        const firstMeal = current[0]
        const lastMeal = current[current.length - 1]
        if (!firstMeal || !lastMeal) return prev

        // Oblicz nowe pozycje proporcjonalnie
        const oldDuration =
          current.length > 1
            ? lastMeal.index - firstMeal.index
            : endIndex - startIndex
        const newDuration = endIndex - startIndex

        const updated = current.map((meal, idx) => {
          if (idx === 0) return { ...meal, index: startIndex }
          if (idx === current.length - 1) return { ...meal, index: endIndex }

          // Proporcjonalne przesunięcie
          const relativePos = (meal.index - firstMeal.index) / oldDuration
          const newIndex = Math.round(startIndex + relativePos * newDuration)
          return {
            ...meal,
            index: Math.max(startIndex, Math.min(endIndex, newIndex)),
          }
        })

        return { ...prev, [value]: updated }
      })
    }
  }, [startIndex, endIndex, value])

  // Handler dla zmiany godzin posiłków
  const handleMealsChange = useCallback(
    (planType: Enums<'meal_plan_type_enum'>, meals: EditableMeal[]) => {
      setMealSchedules((prev) => ({
        ...prev,
        [planType]: meals,
      }))
    },
    []
  )

  const handleSliderChange = (values: [number, number]) => {
    if (ifMode !== null) {
      // W trybie IF - przesuwanie jednego uchwytu przesuwa drugi
      const currentStart = startIndex
      const currentEnd = endIndex
      const ifSteps = ifMode * 2 // konwersja godzin na kroki (30 min = 1 krok)

      // Sprawdź który uchwyt się zmienił
      if (values[0] !== currentStart) {
        // Zmienił się początek - dostosuj koniec
        const newStart = values[0]
        const newEnd = Math.min(47, newStart + ifSteps)
        onEatingStartTimeChange(indexToTime(newStart))
        onEatingEndTimeChange(indexToTime(newEnd))
      } else if (values[1] !== currentEnd) {
        // Zmienił się koniec - dostosuj początek
        const newEnd = values[1]
        const newStart = Math.max(0, newEnd - ifSteps)
        onEatingStartTimeChange(indexToTime(newStart))
        onEatingEndTimeChange(indexToTime(newEnd))
      }
    } else {
      // Bez IF - normalne działanie
      onEatingStartTimeChange(indexToTime(values[0]))
      onEatingEndTimeChange(indexToTime(values[1]))
    }
  }

  const handleIfModeChange = (hours: number | null) => {
    setIfMode(hours)
    if (hours !== null) {
      // Ustaw domyślne okno dla wybranego trybu IF
      // Zachowaj aktualny początek i dostosuj koniec
      const ifSteps = hours * 2
      const newEnd = Math.min(47, startIndex + ifSteps)
      onEatingEndTimeChange(indexToTime(newEnd))
    }
  }

  return (
    <div className='space-y-6'>
      {!hideHeader && (
        <div className='space-y-1'>
          <h2 className='text-foreground text-lg font-semibold sm:text-2xl'>
            Kiedy i ile posiłków chcesz jeść?
          </h2>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            Wybierz okno czasowe i liczbę posiłków pasującą do Twojego stylu
            życia.
          </p>
        </div>
      )}

      {/* Okno czasowe posiłków - na górze */}
      <div className='space-y-4 rounded-lg border-2 border-white bg-white/40 p-4 shadow-sm backdrop-blur-md'>
        <div className='space-y-1'>
          <h3 className='text-foreground font-medium'>Okno czasowe posiłków</h3>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            O której godzinie zazwyczaj jesz pierwszy i ostatni posiłek?
          </p>
        </div>

        {/* Przyciski Intermittent Fasting */}
        <div className='space-y-2'>
          <p className='text-muted-foreground text-center text-xs'>
            Intermittent Fasting (post przerywany)
          </p>
          <div className='flex flex-wrap justify-center gap-2'>
            {IF_OPTIONS.map((option) => (
              <button
                key={option.label}
                type='button'
                onClick={() => handleIfModeChange(option.hours)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  ifMode === option.hours
                    ? 'bg-primary text-white'
                    : 'text-foreground bg-white/60 hover:bg-white/80'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wyświetlanie wybranych godzin */}
        <div className='flex items-center justify-center gap-4'>
          <div className='text-center'>
            <span className='text-muted-foreground text-xs'>Rozpoczynam o</span>
            <div className='text-primary text-2xl font-bold'>
              {formatTime(eatingStartTime || '07:00')}
            </div>
          </div>
          <div className='text-muted-foreground text-xl'>—</div>
          <div className='text-center'>
            <span className='text-muted-foreground text-xs'>Kończę o</span>
            <div className='text-primary text-2xl font-bold'>
              {formatTime(eatingEndTime || '19:00')}
            </div>
          </div>
        </div>

        {/* Range Slider */}
        <div className='space-y-2 pt-2'>
          <RangeSlider
            value={[startIndex, endIndex]}
            onValueChange={handleSliderChange}
            min={0}
            max={47}
            step={1}
            minStepsBetweenThumbs={ifMode !== null ? ifMode * 2 : 2}
            className='w-full'
            aria-label='Okno czasowe posiłków'
          />
          <div className='text-muted-foreground flex justify-between text-xs'>
            {TIME_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      <RadioGroup
        value={value || ''}
        onValueChange={(val: string) =>
          onChange(val as Enums<'meal_plan_type_enum'>)
        }
        className='space-y-3'
      >
        {MEAL_PLAN_TYPES.map((planType) => {
          const isSelected = value === planType
          const meals = isSelected ? getMealsForPlan(planType) : []

          return (
            <div key={planType}>
              <Label
                htmlFor={planType}
                className={cn(
                  'flex cursor-pointer flex-col rounded-lg border-2 bg-white/40 p-4 shadow-sm backdrop-blur-md transition-colors',
                  isSelected
                    ? 'border-primary'
                    : 'hover:border-primary/50 border-white'
                )}
              >
                <div className='flex items-center space-x-3'>
                  <RadioGroupItem value={planType} id={planType} />
                  <div className='flex-1 font-normal'>
                    <div className='font-medium'>
                      {MEAL_PLAN_TYPE_LABELS[planType]}
                    </div>
                    <div className='text-muted-foreground mt-1 text-sm'>
                      {MEAL_PLAN_TYPE_DESCRIPTIONS[planType]}
                    </div>
                  </div>
                </div>

                {/* Interaktywny slider z posiłkami - pokazuje się gdy opcja jest wybrana */}
                {isSelected && meals.length > 0 && (
                  <MealTimeSlider
                    meals={meals}
                    onMealsChange={(updatedMeals) =>
                      handleMealsChange(planType, updatedMeals)
                    }
                    startIndex={startIndex}
                    endIndex={endIndex}
                  />
                )}
              </Label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
