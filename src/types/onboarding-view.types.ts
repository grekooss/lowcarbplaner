/**
 * Types and ViewModels for Onboarding View
 *
 * Zawiera typy specyficzne dla widoku onboardingu, w tym:
 * - OnboardingFormData (stan formularza)
 * - OnboardingStepConfig (konfiguracja kroków)
 * - WeightLossOption (opcje tempa utraty wagi z walidacją)
 * - CalculatedTargets (obliczone cele żywieniowe)
 */

import type { Enums } from './database.types'

/**
 * Główne typy posiłków do wyboru (dla konfiguracji 2_main)
 */
export type MainMealType = 'breakfast' | 'lunch' | 'dinner'

/**
 * Stan formularza onboardingu (client-side)
 */
export interface OnboardingFormData {
  gender: Enums<'gender_enum'> | null
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  activity_level: Enums<'activity_level_enum'> | null
  goal: Enums<'goal_enum'> | null
  weight_loss_rate_kg_week: number | null
  meal_plan_type: Enums<'meal_plan_type_enum'> | null
  eating_start_time: string | null // Format HH:MM, np. "07:00"
  eating_end_time: string | null // Format HH:MM, np. "19:00"
  macro_ratio: Enums<'macro_ratio_enum'> | null
  disclaimer_accepted: boolean
}

/**
 * Konfiguracja pojedynczego kroku
 */
export interface OnboardingStepConfig {
  id: string
  label: string
  description?: string
  isConditional?: boolean
  condition?: (formData: OnboardingFormData) => boolean
}

/**
 * Opcja tempa utraty wagi (z walidacją minimum kalorycznego)
 */
export interface WeightLossOption {
  value: number // 0.25, 0.5, 0.75, 1.0
  label: string // "0.5 kg/tydzień"
  description: string // "Umiarkowane tempo, zalecane"
  deficitPerDay: number // Deficyt kaloryczny dziennie
  isDisabled: boolean
  reasonDisabled?: string // "Ta opcja prowadzi do diety poniżej bezpiecznego minimum (1400 kcal)"
}

/**
 * Obliczone cele żywieniowe (preview w SummaryStep)
 */
export interface CalculatedTargets {
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
}

/**
 * Mapowanie activity_level na polskie nazwy
 */
export const ACTIVITY_LEVEL_LABELS: Record<
  Enums<'activity_level_enum'>,
  string
> = {
  very_low: 'Bardzo niska',
  low: 'Niska',
  moderate: 'Umiarkowana',
  high: 'Wysoka',
  very_high: 'Bardzo wysoka',
}

/**
 * Opisy poziomów aktywności
 */
export const ACTIVITY_LEVEL_DESCRIPTIONS: Record<
  Enums<'activity_level_enum'>,
  string
> = {
  very_low: 'Praca siedząca, brak aktywności fizycznej',
  low: 'Lekka aktywność 1-3 razy w tygodniu',
  moderate: 'Umiarkowana aktywność 3-5 razy w tygodniu',
  high: 'Intensywna aktywność 6-7 razy w tygodniu',
  very_high: 'Bardzo intensywna aktywność, praca fizyczna',
}

/**
 * Mapowanie goal na polskie nazwy
 */
export const GOAL_LABELS: Record<Enums<'goal_enum'>, string> = {
  weight_loss: 'Utrata wagi',
  weight_maintenance: 'Utrzymanie wagi',
}

/**
 * Opisy celów
 */
export const GOAL_DESCRIPTIONS: Record<Enums<'goal_enum'>, string> = {
  weight_loss: 'Chcę schudnąć i obniżyć wagę ciała',
  weight_maintenance: 'Chcę utrzymać obecną wagę',
}

/**
 * Mapowanie meal_plan_type na polskie nazwy
 */
export const MEAL_PLAN_TYPE_LABELS: Record<
  Enums<'meal_plan_type_enum'>,
  string
> = {
  '3_main_2_snacks': '3 główne + 2 przekąski',
  '3_main_1_snack': '3 główne + 1 przekąska',
  '3_main': '3 główne posiłki',
  '2_main': '2 główne posiłki',
}

/**
 * Opisy typów planu posiłków
 */
export const MEAL_PLAN_TYPE_DESCRIPTIONS: Record<
  Enums<'meal_plan_type_enum'>,
  string
> = {
  '3_main_2_snacks':
    'Śniadanie, przekąska poranna, obiad, przekąska popołudniowa, kolacja',
  '3_main_1_snack': 'Śniadanie, obiad, przekąska popołudniowa, kolacja',
  '3_main': 'Śniadanie, obiad, kolacja',
  '2_main': 'System dobierze 2 posiłki na podstawie okna czasowego',
}

/**
 * Etykiety głównych posiłków do wyboru (dla konfiguracji 2_main)
 */
export const MAIN_MEAL_LABELS: Record<MainMealType, string> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
}

/**
 * Podział kalorii dla każdej konfiguracji posiłków
 * Wartości procentowe sumują się do 1.0 (100%)
 */
export const MEAL_CALORIE_DISTRIBUTION: Record<
  Enums<'meal_plan_type_enum'>,
  Partial<Record<Enums<'meal_type_enum'>, number>>
> = {
  '3_main_2_snacks': {
    breakfast: 0.25,
    snack_morning: 0.1,
    lunch: 0.3,
    snack_afternoon: 0.1,
    dinner: 0.25,
  },
  '3_main_1_snack': {
    breakfast: 0.25,
    lunch: 0.3,
    snack_afternoon: 0.15,
    dinner: 0.3,
  },
  '3_main': {
    breakfast: 0.3,
    lunch: 0.35,
    dinner: 0.35,
  },
  '2_main': {
    // Dynamiczne - zależy od selected_meals
    // Domyślnie równy podział 50%/50%
  },
}

/**
 * Oblicza podział kalorii dla konfiguracji 2_main na podstawie wybranych posiłków
 */
export function getCalorieDistributionFor2Main(
  selectedMeals: MainMealType[]
): Record<MainMealType, number> {
  if (selectedMeals.length !== 2) {
    return { breakfast: 0, lunch: 0, dinner: 0 }
  }

  // Podział 45%/55% - później posiłek dostaje więcej kalorii
  const mealOrder: MainMealType[] = ['breakfast', 'lunch', 'dinner']
  const sortedMeals = [...selectedMeals].sort(
    (a, b) => mealOrder.indexOf(a) - mealOrder.indexOf(b)
  )

  return {
    breakfast: sortedMeals[0] === 'breakfast' ? 0.45 : 0,
    lunch: sortedMeals.includes('lunch')
      ? sortedMeals[0] === 'lunch'
        ? 0.45
        : 0.55
      : 0,
    dinner: sortedMeals.includes('dinner') ? 0.55 : 0,
  }
}

/**
 * Mapowanie macro_ratio na polskie nazwy
 */
export const MACRO_RATIO_LABELS: Record<Enums<'macro_ratio_enum'>, string> = {
  '70_25_5': '70% tłuszcze / 5% węglowodany / 25% białko',
  '60_35_5': '60% tłuszcze / 5% węglowodany / 35% białko',
  '60_30_10': '60% tłuszcze / 10% węglowodany / 30% białko',
  '60_25_15': '60% tłuszcze / 15% węglowodany / 25% białko',
  '50_30_20': '50% tłuszcze / 20% węglowodany / 30% białko',
  '45_30_25': '45% tłuszcze / 25% węglowodany / 30% białko',
  '40_40_20': '40% tłuszcze / 20% węglowodany / 40% białko',
}

/**
 * Opisy proporcji makroskładników
 */
export const MACRO_RATIO_DESCRIPTIONS: Record<
  Enums<'macro_ratio_enum'>,
  string
> = {
  '70_25_5': 'Bardzo restrykcyjne keto - maksymalna ketoza',
  '60_35_5': 'Keto wysokobiałkowe - ketoza + budowa mięśni',
  '60_30_10': 'Zbalansowane keto - ketoza z większą różnorodnością warzyw',
  '60_25_15': 'Standardowe keto - zalecane dla początkujących',
  '50_30_20': 'Umiarkowane low-carb - elastyczne podejście',
  '45_30_25': 'Liberalne low-carb - łatwe do utrzymania długoterminowo',
  '40_40_20': 'Wysokobiałkowe low-carb - dla aktywnych sportowo',
}

/**
 * Parsuje wartość enum macro_ratio na wartości procentowe
 */
export function parseMacroRatio(ratio: Enums<'macro_ratio_enum'>): {
  fats: number
  protein: number
  carbs: number
} {
  const parts = ratio.split('_').map(Number)
  const fats = parts[0] ?? 60
  const protein = parts[1] ?? 25
  const carbs = parts[2] ?? 15
  return {
    fats: fats / 100,
    protein: protein / 100,
    carbs: carbs / 100,
  }
}

/**
 * Przedziały godzinowe dla typów posiłków (w minutach od północy)
 */
export const MEAL_TIME_RANGES = {
  breakfast: { start: 6 * 60, end: 10 * 60 }, // 6:00 - 10:00
  lunch: { start: 11 * 60, end: 15 * 60 }, // 11:00 - 15:00
  dinner: { start: 17 * 60, end: 21 * 60 }, // 17:00 - 21:00
} as const

/**
 * Konwertuje czas w formacie HH:MM na minuty od północy
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

/**
 * Sprawdza czy podany czas mieści się w przedziale danego typu posiłku
 */
function isTimeInMealRange(
  timeMinutes: number,
  mealType: MainMealType
): boolean {
  const range = MEAL_TIME_RANGES[mealType]
  return timeMinutes >= range.start && timeMinutes <= range.end
}

/**
 * Oblicza typy posiłków dla konfiguracji 2_main na podstawie okna czasowego
 *
 * Algorytm:
 * 1. Jeśli start w przedziale śniadania (6-10) i koniec w przedziale kolacji (17-21) → śniadanie + kolacja
 * 2. Jeśli start w przedziale śniadania ale koniec przed kolacją → śniadanie + obiad
 * 3. Jeśli start po śniadaniu → obiad + kolacja
 */
export function calculateSelectedMealsFromTimeWindow(
  startTime: string,
  endTime: string
): MainMealType[] {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  const startsInBreakfast = isTimeInMealRange(startMinutes, 'breakfast')
  const endsInDinner = isTimeInMealRange(endMinutes, 'dinner')

  // Jeśli okno obejmuje śniadanie i kolację → śniadanie + kolacja
  if (startsInBreakfast && endsInDinner) {
    return ['breakfast', 'dinner']
  }

  // Jeśli zaczyna w czasie śniadania ale kończy przed kolacją → śniadanie + obiad
  if (startsInBreakfast) {
    return ['breakfast', 'lunch']
  }

  // Domyślnie: obiad + kolacja
  return ['lunch', 'dinner']
}

/**
 * Zwraca czytelny opis wybranych posiłków
 */
export function getSelectedMealsDescription(meals: MainMealType[]): string {
  return meals.map((meal) => MAIN_MEAL_LABELS[meal]).join(' + ')
}

/**
 * Interfejs dla wyliczonych godzin posiłków
 */
export interface MealSchedule {
  type: Enums<'meal_type_enum'>
  label: string
  time: string
}

/**
 * Oblicza godziny posiłków na podstawie typu planu i okna czasowego
 *
 * @param planType - Typ planu posiłków
 * @param startTime - Godzina rozpoczęcia jedzenia (format HH:MM)
 * @param endTime - Godzina zakończenia jedzenia (format HH:MM)
 * @returns Tablica z harmonogramem posiłków
 */
export function calculateMealSchedule(
  planType: Enums<'meal_plan_type_enum'>,
  startTime: string,
  endTime: string
): MealSchedule[] {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  const windowDuration = endMinutes - startMinutes

  // Zaokrąglenie do najbliższych 15 minut
  const roundTo15 = (minutes: number): number => {
    return Math.round(minutes / 15) * 15
  }

  // Pomocnicza funkcja do formatowania czasu
  const minutesToTime = (minutes: number): string => {
    const rounded = roundTo15(minutes)
    const hours = Math.floor(rounded / 60)
    const mins = rounded % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  switch (planType) {
    case '3_main_2_snacks': {
      // 5 posiłków równomiernie rozłożonych
      const interval = windowDuration / 4
      return [
        {
          type: 'breakfast',
          label: 'Śniadanie',
          time: minutesToTime(startMinutes),
        },
        {
          type: 'snack_morning',
          label: 'Przekąska poranna',
          time: minutesToTime(startMinutes + interval),
        },
        {
          type: 'lunch',
          label: 'Obiad',
          time: minutesToTime(startMinutes + interval * 2),
        },
        {
          type: 'snack_afternoon',
          label: 'Przekąska popołudniowa',
          time: minutesToTime(startMinutes + interval * 3),
        },
        { type: 'dinner', label: 'Kolacja', time: minutesToTime(endMinutes) },
      ]
    }

    case '3_main_1_snack': {
      // 4 posiłki: śniadanie (0), obiad (1/2), przekąska (3/4), kolacja (1)
      // Podział: 1/2 przerwy do obiadu, potem 1/4 do przekąski, 1/4 do kolacji
      return [
        {
          type: 'breakfast',
          label: 'Śniadanie',
          time: minutesToTime(startMinutes),
        },
        {
          type: 'lunch',
          label: 'Obiad',
          time: minutesToTime(startMinutes + windowDuration * 0.5),
        },
        {
          type: 'snack_afternoon',
          label: 'Przekąska popołudniowa',
          time: minutesToTime(startMinutes + windowDuration * 0.75),
        },
        { type: 'dinner', label: 'Kolacja', time: minutesToTime(endMinutes) },
      ]
    }

    case '3_main': {
      // 3 główne posiłki równomiernie
      const interval = windowDuration / 2
      return [
        {
          type: 'breakfast',
          label: 'Śniadanie',
          time: minutesToTime(startMinutes),
        },
        {
          type: 'lunch',
          label: 'Obiad',
          time: minutesToTime(startMinutes + interval),
        },
        { type: 'dinner', label: 'Kolacja', time: minutesToTime(endMinutes) },
      ]
    }

    case '2_main': {
      // 2 posiłki - początek i koniec okna
      const selectedMeals = calculateSelectedMealsFromTimeWindow(
        startTime,
        endTime
      )
      return selectedMeals.map((mealType, index) => ({
        type: mealType as Enums<'meal_type_enum'>,
        label: MAIN_MEAL_LABELS[mealType],
        time: minutesToTime(index === 0 ? startMinutes : endMinutes),
      }))
    }

    default:
      return []
  }
}
