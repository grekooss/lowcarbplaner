/**
 * Client-side Nutrition Calculator
 *
 * Oblicza cele żywieniowe po stronie klienta dla preview w onboardingu.
 * Wykorzystuje tę samą logikę co serwer (calculateNutritionTargets).
 *
 * WAŻNE: Ta funkcja musi być zsynchronizowana z services/nutrition-calculator.ts
 */

import type {
  OnboardingFormData,
  CalculatedTargets,
  WeightLossOption,
} from '@/types/onboarding-view.types'

/**
 * Współczynniki PAL (Physical Activity Level)
 */
const PAL_MULTIPLIERS = {
  very_low: 1.2,
  low: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.9,
} as const

/**
 * Mapowanie proporcji makroskładników z enum na wartości procentowe
 * Format: fats_protein_carbs
 */
const MACRO_RATIO_VALUES = {
  '70_25_5': { fats: 0.7, protein: 0.25, carbs: 0.05 },
  '60_35_5': { fats: 0.6, protein: 0.35, carbs: 0.05 },
  '60_25_15': { fats: 0.6, protein: 0.25, carbs: 0.15 },
  '50_30_20': { fats: 0.5, protein: 0.3, carbs: 0.2 },
  '40_40_20': { fats: 0.4, protein: 0.4, carbs: 0.2 },
} as const

/**
 * Domyślne proporcje makroskładników (standardowe keto)
 */
const DEFAULT_MACRO_RATIO = '60_25_15' as const

/**
 * Oblicza cele żywieniowe (client-side preview)
 * Wykorzystuje wzór Mifflin-St Jeor dla BMR i współczynniki PAL dla TDEE
 *
 * @param data - Częściowe dane formularza onboardingu
 * @returns Obliczone cele lub null jeśli brakuje danych
 */
export function calculateNutritionTargetsClient(
  data: Partial<OnboardingFormData>
): CalculatedTargets | null {
  const {
    gender,
    age,
    weight_kg,
    height_cm,
    activity_level,
    goal,
    weight_loss_rate_kg_week,
    macro_ratio,
  } = data

  // Sprawdź czy wszystkie wymagane dane są dostępne
  if (!gender || !age || !weight_kg || !height_cm || !activity_level || !goal) {
    return null
  }

  // BMR (Mifflin-St Jeor)
  // Mężczyzna: 10 × waga(kg) + 6.25 × wzrost(cm) - 5 × wiek(lat) + 5
  // Kobieta: 10 × waga(kg) + 6.25 × wzrost(cm) - 5 × wiek(lat) - 161
  const bmr =
    gender === 'female'
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
      : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5

  // TDEE (Total Daily Energy Expenditure)
  const tdee = bmr * PAL_MULTIPLIERS[activity_level]

  // Kalorie celowe
  let targetCalories = tdee

  if (goal === 'weight_loss' && weight_loss_rate_kg_week) {
    // Deficyt kaloryczny: 1 kg tłuszczu ≈ 7700 kcal
    // Deficyt dzienny = (kg/tydzień × 7700) / 7 dni
    const deficitPerDay = (weight_loss_rate_kg_week * 7700) / 7
    targetCalories = tdee - deficitPerDay
  }

  // Pobierz proporcje makroskładników (domyślnie 60_25_15)
  const ratios = MACRO_RATIO_VALUES[macro_ratio ?? DEFAULT_MACRO_RATIO]

  // Rozkład makroskładników według wybranego ratio
  // 1g węglowodanów = 4 kcal
  // 1g białka = 4 kcal
  // 1g tłuszczu = 9 kcal
  const target_carbs_g = Math.round((targetCalories * ratios.carbs) / 4)
  const target_protein_g = Math.round((targetCalories * ratios.protein) / 4)
  const target_fats_g = Math.round((targetCalories * ratios.fats) / 9)

  return {
    target_calories: Math.round(targetCalories),
    target_carbs_g,
    target_protein_g,
    target_fats_g,
  }
}

/**
 * Generuje opcje tempa utraty wagi z walidacją minimum kalorycznego
 *
 * Każda opcja jest sprawdzana czy nie prowadzi do diety poniżej bezpiecznego minimum:
 * - Kobiety: 1400 kcal
 * - Mężczyźni: 1600 kcal
 *
 * @param data - Częściowe dane formularza (wymagane: gender, age, weight_kg, height_cm, activity_level)
 * @returns Tablica opcji tempa utraty wagi z informacją o dostępności
 */
export function generateWeightLossOptions(
  data: Partial<OnboardingFormData>
): WeightLossOption[] {
  const options: WeightLossOption[] = [
    {
      value: 0.25,
      label: '0.25 kg/tydzień',
      description: 'Powolne, bardzo bezpieczne',
      deficitPerDay: 0,
      isDisabled: false,
    },
    {
      value: 0.5,
      label: '0.5 kg/tydzień',
      description: 'Umiarkowane, zalecane',
      deficitPerDay: 0,
      isDisabled: false,
    },
    {
      value: 0.75,
      label: '0.75 kg/tydzień',
      description: 'Szybkie',
      deficitPerDay: 0,
      isDisabled: false,
    },
    {
      value: 1.0,
      label: '1.0 kg/tydzień',
      description: 'Bardzo szybkie',
      deficitPerDay: 0,
      isDisabled: false,
    },
  ]

  const { gender, age, weight_kg, height_cm, activity_level } = data

  // Jeśli brakuje wymaganych danych, zwróć opcje bez walidacji
  if (!gender || !age || !weight_kg || !height_cm || !activity_level) {
    return options
  }

  // Oblicz TDEE (bez deficytu)
  const bmr =
    gender === 'female'
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
      : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5

  const tdee = bmr * PAL_MULTIPLIERS[activity_level]

  // Minimum kaloryczne
  const minCalories = gender === 'female' ? 1400 : 1600

  // Walidacja każdej opcji
  return options.map((option) => {
    const deficitPerDay = (option.value * 7700) / 7
    const targetCalories = tdee - deficitPerDay

    option.deficitPerDay = Math.round(deficitPerDay)

    if (targetCalories < minCalories) {
      option.isDisabled = true
      option.reasonDisabled = `Ta opcja prowadzi do diety poniżej bezpiecznego minimum (${minCalories} kcal)`
    }

    return option
  })
}

/**
 * Oblicza TDEE (Total Daily Energy Expenditure) na podstawie danych użytkownika
 * Funkcja pomocnicza do użytku w innych komponentach
 *
 * @param data - Dane użytkownika
 * @returns TDEE w kcal lub null jeśli brakuje danych
 */
export function calculateTDEE(
  data: Partial<OnboardingFormData>
): number | null {
  const { gender, age, weight_kg, height_cm, activity_level } = data

  if (!gender || !age || !weight_kg || !height_cm || !activity_level) {
    return null
  }

  const bmr =
    gender === 'female'
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
      : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5

  return bmr * PAL_MULTIPLIERS[activity_level]
}
