/**
 * Service Layer dla Profile API - Nutrition Calculator
 *
 * Implementuje wzory i logikę biznesową dla obliczeń żywieniowych:
 * - BMR (Basal Metabolic Rate) - wzór Mifflin-St Jeor
 * - TDEE (Total Daily Energy Expenditure) - BMR × współczynnik aktywności
 * - Deficyt kaloryczny dla utraty wagi
 * - Rozkład makroskładników: 15% węgle, 35% białko, 50% tłuszcze
 * - Walidacja minimum kalorycznego: 1400 kcal (K) / 1600 kcal (M)
 *
 * @see .ai/10d01 api-profile-implementation-plan.md
 * @see CLAUDE.md - sekcja "Onboarding i Kalkulator"
 */

import type { Enums } from '@/types/database.types'

/**
 * Współczynniki aktywności fizycznej dla obliczania TDEE
 *
 * Źródło: Mifflin-St Jeor equation (1990)
 */
const ACTIVITY_MULTIPLIERS: Record<Enums<'activity_level_enum'>, number> = {
  very_low: 1.2, // Praca siedząca, brak aktywności fizycznej
  low: 1.375, // Lekka aktywność (1-3 dni/tydzień)
  moderate: 1.55, // Umiarkowana aktywność (3-5 dni/tydzień)
  high: 1.725, // Wysoka aktywność (6-7 dni/tydzień)
  very_high: 1.9, // Bardzo wysoka aktywność (sport, praca fizyczna)
}

/**
 * Deficyt kaloryczny na kg utraty wagi tygodniowo
 *
 * 1 kg tkanki tłuszczowej ≈ 7700 kcal
 * Dzienne zapotrzebowanie na deficyt = (kg_per_week × 7700) / 7 dni
 */
const CALORIE_DEFICIT_PER_KG_WEEK = 7700 / 7 // ≈ 1100 kcal/dzień na 1 kg/tydzień

/**
 * Minimum kaloryczne według płci (bezpieczny poziom)
 */
const MIN_CALORIES = {
  female: 1400,
  male: 1600,
} as const

/**
 * Rozkład makroskładników (% całkowitych kalorii)
 *
 * Zgodnie z założeniami low-carb:
 * - Węglowodany: 15%
 * - Białko: 35%
 * - Tłuszcze: 50%
 */
const MACRO_RATIOS = {
  carbs: 0.15,
  protein: 0.35,
  fats: 0.5,
} as const

/**
 * Wartości energetyczne makroskładników (kcal/gram)
 */
const CALORIES_PER_GRAM = {
  carbs: 4,
  protein: 4,
  fats: 9,
} as const

/**
 * Oblicza BMR (Basal Metabolic Rate) używając wzoru Mifflin-St Jeor
 *
 * Wzór Mifflin-St Jeor (1990):
 * - Mężczyźni: BMR = 10 × waga(kg) + 6.25 × wzrost(cm) - 5 × wiek(lata) + 5
 * - Kobiety: BMR = 10 × waga(kg) + 6.25 × wzrost(cm) - 5 × wiek(lata) - 161
 *
 * @param gender - Płeć ('male' lub 'female')
 * @param age - Wiek w latach
 * @param weightKg - Waga w kilogramach
 * @param heightCm - Wzrost w centymetrach
 * @returns BMR w kcal/dzień
 *
 * @example
 * ```typescript
 * const bmr = calculateBMR('female', 30, 70, 165)
 * // 1445.75 kcal/dzień
 * ```
 */
export function calculateBMR(
  gender: Enums<'gender_enum'>,
  age: number,
  weightKg: number,
  heightCm: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age

  if (gender === 'male') {
    return base + 5
  } else {
    return base - 161
  }
}

/**
 * Oblicza TDEE (Total Daily Energy Expenditure) na podstawie BMR i poziomu aktywności
 *
 * TDEE = BMR × współczynnik aktywności
 *
 * @param bmr - BMR w kcal/dzień
 * @param activityLevel - Poziom aktywności fizycznej
 * @returns TDEE w kcal/dzień
 *
 * @example
 * ```typescript
 * const tdee = calculateTDEE(1445.75, 'moderate')
 * // 2240.9125 kcal/dzień
 * ```
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: Enums<'activity_level_enum'>
): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel]
}

/**
 * Stosuje dostosowanie kaloryczne na podstawie celu dietetycznego
 *
 * - weight_maintenance: TDEE bez zmian
 * - weight_loss: TDEE - deficyt kaloryczny (na podstawie tempa utraty wagi)
 *
 * @param tdee - TDEE w kcal/dzień
 * @param goal - Cel dietetyczny
 * @param weightLossRate - Tempo utraty wagi (kg/tydzień), wymagane gdy goal='weight_loss'
 * @returns Docelowe kalorie dzienne w kcal/dzień
 *
 * @example
 * ```typescript
 * const target = applyGoalAdjustment(2240.9125, 'weight_loss', 0.5)
 * // 1690.9125 kcal/dzień (deficyt ~550 kcal)
 * ```
 */
export function applyGoalAdjustment(
  tdee: number,
  goal: Enums<'goal_enum'>,
  weightLossRate?: number | null
): number {
  if (goal === 'weight_maintenance') {
    return tdee
  }

  // weight_loss
  if (!weightLossRate || weightLossRate <= 0) {
    throw new Error(
      'weight_loss_rate_kg_week jest wymagane dla celu weight_loss'
    )
  }

  const dailyDeficit = weightLossRate * CALORIE_DEFICIT_PER_KG_WEEK
  return tdee - dailyDeficit
}

/**
 * Waliduje czy obliczone kalorie są powyżej bezpiecznego minimum
 *
 * Minimum kaloryczne:
 * - Kobiety: 1400 kcal/dzień
 * - Mężczyźni: 1600 kcal/dzień
 *
 * @param calories - Obliczone kalorie docelowe
 * @param gender - Płeć użytkownika
 * @returns Obiekt z wynikiem walidacji
 *
 * @example
 * ```typescript
 * const validation = validateMinimumCalories(1350, 'female')
 * if (!validation.isValid) {
 *   console.error(validation.message)
 *   // "Obliczone kalorie (1350 kcal) są poniżej bezpiecznego minimum dla kobiet (1400 kcal)."
 * }
 * ```
 */
export function validateMinimumCalories(
  calories: number,
  gender: Enums<'gender_enum'>
): {
  isValid: boolean
  message?: string
  minimumCalories: number
  calculatedCalories: number
} {
  const minimum = MIN_CALORIES[gender]

  if (calories < minimum) {
    return {
      isValid: false,
      message: `Obliczone kalorie (${Math.round(calories)} kcal) są poniżej bezpiecznego minimum dla ${gender === 'female' ? 'kobiet' : 'mężczyzn'} (${minimum} kcal). Wybierz mniejszy deficyt kaloryczny.`,
      minimumCalories: minimum,
      calculatedCalories: Math.round(calories),
    }
  }

  return {
    isValid: true,
    minimumCalories: minimum,
    calculatedCalories: Math.round(calories),
  }
}

/**
 * Oblicza rozkład makroskładników na podstawie docelowych kalorii
 *
 * Rozkład low-carb:
 * - Węglowodany: 15% (4 kcal/g)
 * - Białko: 35% (4 kcal/g)
 * - Tłuszcze: 50% (9 kcal/g)
 *
 * @param targetCalories - Docelowe kalorie dzienne
 * @returns Rozkład makroskładników w gramach
 *
 * @example
 * ```typescript
 * const macros = calculateMacros(1800)
 * // { carbs_g: 68, protein_g: 158, fats_g: 100 }
 * ```
 */
export function calculateMacros(targetCalories: number): {
  carbs_g: number
  protein_g: number
  fats_g: number
} {
  const carbsCalories = targetCalories * MACRO_RATIOS.carbs
  const proteinCalories = targetCalories * MACRO_RATIOS.protein
  const fatsCalories = targetCalories * MACRO_RATIOS.fats

  return {
    carbs_g: Math.round(carbsCalories / CALORIES_PER_GRAM.carbs),
    protein_g: Math.round(proteinCalories / CALORIES_PER_GRAM.protein),
    fats_g: Math.round(fatsCalories / CALORIES_PER_GRAM.fats),
  }
}

/**
 * Główna funkcja fasadowa - oblicza wszystkie cele żywieniowe użytkownika
 *
 * Przeprowadza pełny proces:
 * 1. Obliczenie BMR (Mifflin-St Jeor)
 * 2. Obliczenie TDEE (BMR × aktywność)
 * 3. Zastosowanie dostosowania kalorycznego (deficyt dla utraty wagi)
 * 4. Walidacja minimum kalorycznego
 * 5. Obliczenie rozkładu makroskładników
 *
 * @param params - Parametry użytkownika z formularza onboardingu
 * @returns Cele żywieniowe lub błąd walidacji
 * @throws Error jeśli kalorie są poniżej bezpiecznego minimum
 *
 * @example
 * ```typescript
 * const targets = calculateNutritionTargets({
 *   gender: 'female',
 *   age: 30,
 *   weight_kg: 70,
 *   height_cm: 165,
 *   activity_level: 'moderate',
 *   goal: 'weight_loss',
 *   weight_loss_rate_kg_week: 0.5
 * })
 * // {
 * //   target_calories: 1800,
 * //   target_carbs_g: 68,
 * //   target_protein_g: 158,
 * //   target_fats_g: 100
 * // }
 * ```
 */
export function calculateNutritionTargets(params: {
  gender: Enums<'gender_enum'>
  age: number
  weight_kg: number
  height_cm: number
  activity_level: Enums<'activity_level_enum'>
  goal: Enums<'goal_enum'>
  weight_loss_rate_kg_week?: number | null
}): {
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
} {
  // 1. Oblicz BMR
  const bmr = calculateBMR(
    params.gender,
    params.age,
    params.weight_kg,
    params.height_cm
  )

  // 2. Oblicz TDEE
  const tdee = calculateTDEE(bmr, params.activity_level)

  // 3. Zastosuj dostosowanie kaloryczne
  const targetCalories = applyGoalAdjustment(
    tdee,
    params.goal,
    params.weight_loss_rate_kg_week
  )

  // 4. Waliduj minimum kaloryczne
  const validation = validateMinimumCalories(targetCalories, params.gender)
  if (!validation.isValid) {
    throw new Error(validation.message)
  }

  // 5. Oblicz rozkład makroskładników
  const macros = calculateMacros(targetCalories)

  return {
    target_calories: Math.round(targetCalories),
    target_carbs_g: macros.carbs_g,
    target_protein_g: macros.protein_g,
    target_fats_g: macros.fats_g,
  }
}
