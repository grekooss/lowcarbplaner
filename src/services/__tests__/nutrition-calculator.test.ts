/**
 * Tests for Server-side Nutrition Calculator
 *
 * Testuje główne funkcje kalkulatora żywieniowego:
 * - calculateBMR (wzór Mifflin-St Jeor)
 * - calculateTDEE (BMR × współczynnik aktywności)
 * - applyGoalAdjustment (deficyt kaloryczny)
 * - validateMinimumCalories (minimum bezpieczeństwa)
 * - calculateMacros (rozkład makroskładników)
 * - calculateNutritionTargets (funkcja fasadowa)
 */

import { describe, it, expect } from 'vitest'
import {
  calculateBMR,
  calculateTDEE,
  applyGoalAdjustment,
  validateMinimumCalories,
  calculateMacros,
  calculateNutritionTargets,
} from '../nutrition-calculator'

describe('calculateBMR', () => {
  it('oblicza poprawnie BMR dla kobiety (wzór Mifflin-St Jeor)', () => {
    // BMR = 10 × waga + 6.25 × wzrost - 5 × wiek - 161
    // BMR = 10 × 70 + 6.25 × 165 - 5 × 30 - 161 = 700 + 1031.25 - 150 - 161 = 1420.25
    const bmr = calculateBMR('female', 30, 70, 165)
    expect(bmr).toBeCloseTo(1420.25, 2)
  })

  it('oblicza poprawnie BMR dla mężczyzny (wzór Mifflin-St Jeor)', () => {
    // BMR = 10 × waga + 6.25 × wzrost - 5 × wiek + 5
    // BMR = 10 × 80 + 6.25 × 175 - 5 × 35 + 5 = 800 + 1093.75 - 175 + 5 = 1723.75
    const bmr = calculateBMR('male', 35, 80, 175)
    expect(bmr).toBeCloseTo(1723.75, 2)
  })

  it('kobiety mają niższe BMR niż mężczyźni przy tych samych parametrach', () => {
    const bmrFemale = calculateBMR('female', 30, 70, 170)
    const bmrMale = calculateBMR('male', 30, 70, 170)

    // Różnica to +5 vs -161 = 166 kcal
    expect(bmrMale - bmrFemale).toBe(166)
  })

  it('BMR rośnie wraz z wagą', () => {
    const bmr60 = calculateBMR('male', 30, 60, 175)
    const bmr80 = calculateBMR('male', 30, 80, 175)
    const bmr100 = calculateBMR('male', 30, 100, 175)

    expect(bmr60).toBeLessThan(bmr80)
    expect(bmr80).toBeLessThan(bmr100)
  })

  it('BMR maleje wraz z wiekiem', () => {
    const bmr20 = calculateBMR('female', 20, 65, 165)
    const bmr40 = calculateBMR('female', 40, 65, 165)
    const bmr60 = calculateBMR('female', 60, 65, 165)

    expect(bmr20).toBeGreaterThan(bmr40)
    expect(bmr40).toBeGreaterThan(bmr60)
  })
})

describe('calculateTDEE', () => {
  const baseBmr = 1500 // Przykładowe BMR

  it('stosuje współczynnik 1.2 dla very_low aktywności', () => {
    const tdee = calculateTDEE(baseBmr, 'very_low')
    expect(tdee).toBe(baseBmr * 1.2)
  })

  it('stosuje współczynnik 1.375 dla low aktywności', () => {
    const tdee = calculateTDEE(baseBmr, 'low')
    expect(tdee).toBe(baseBmr * 1.375)
  })

  it('stosuje współczynnik 1.55 dla moderate aktywności', () => {
    const tdee = calculateTDEE(baseBmr, 'moderate')
    expect(tdee).toBe(baseBmr * 1.55)
  })

  it('stosuje współczynnik 1.725 dla high aktywności', () => {
    const tdee = calculateTDEE(baseBmr, 'high')
    expect(tdee).toBe(baseBmr * 1.725)
  })

  it('stosuje współczynnik 1.9 dla very_high aktywności', () => {
    const tdee = calculateTDEE(baseBmr, 'very_high')
    expect(tdee).toBe(baseBmr * 1.9)
  })

  it('TDEE rośnie wraz z poziomem aktywności', () => {
    const levels = ['very_low', 'low', 'moderate', 'high', 'very_high'] as const
    const tdeeValues = levels.map((level) => calculateTDEE(baseBmr, level))

    for (let i = 1; i < tdeeValues.length; i++) {
      expect(tdeeValues[i]).toBeGreaterThan(tdeeValues[i - 1]!)
    }
  })
})

describe('applyGoalAdjustment', () => {
  const baseTdee = 2000

  it('zwraca TDEE bez zmian dla weight_maintenance', () => {
    const result = applyGoalAdjustment(baseTdee, 'weight_maintenance')
    expect(result).toBe(baseTdee)
  })

  it('redukuje kalorie o deficyt dla weight_loss (0.5 kg/tydzień)', () => {
    // Deficyt: 0.5 × 7700 / 7 = 550 kcal/dzień
    const result = applyGoalAdjustment(baseTdee, 'weight_loss', 0.5)
    expect(result).toBeCloseTo(baseTdee - 550, 0)
  })

  it('redukuje kalorie o deficyt dla weight_loss (1.0 kg/tydzień)', () => {
    // Deficyt: 1.0 × 7700 / 7 = 1100 kcal/dzień
    const result = applyGoalAdjustment(baseTdee, 'weight_loss', 1.0)
    expect(result).toBeCloseTo(baseTdee - 1100, 0)
  })

  it('rzuca błąd gdy weight_loss bez weight_loss_rate', () => {
    expect(() => {
      applyGoalAdjustment(baseTdee, 'weight_loss')
    }).toThrow('weight_loss_rate_kg_week jest wymagane dla celu weight_loss')
  })

  it('rzuca błąd gdy weight_loss z zerowym rate', () => {
    expect(() => {
      applyGoalAdjustment(baseTdee, 'weight_loss', 0)
    }).toThrow('weight_loss_rate_kg_week jest wymagane dla celu weight_loss')
  })

  it('deficyt rośnie proporcjonalnie do tempa utraty wagi', () => {
    const result025 = applyGoalAdjustment(baseTdee, 'weight_loss', 0.25)
    const result050 = applyGoalAdjustment(baseTdee, 'weight_loss', 0.5)
    const result100 = applyGoalAdjustment(baseTdee, 'weight_loss', 1.0)

    const deficit025 = baseTdee - result025
    const deficit050 = baseTdee - result050
    const deficit100 = baseTdee - result100

    expect(deficit050).toBeCloseTo(deficit025 * 2, 0)
    expect(deficit100).toBeCloseTo(deficit050 * 2, 0)
  })
})

describe('validateMinimumCalories', () => {
  it('zwraca isValid=true dla kalorii powyżej minimum dla kobiet (1400)', () => {
    const result = validateMinimumCalories(1500, 'female')
    expect(result.isValid).toBe(true)
    expect(result.minimumCalories).toBe(1400)
    expect(result.calculatedCalories).toBe(1500)
  })

  it('zwraca isValid=true dla kalorii powyżej minimum dla mężczyzn (1600)', () => {
    const result = validateMinimumCalories(1700, 'male')
    expect(result.isValid).toBe(true)
    expect(result.minimumCalories).toBe(1600)
    expect(result.calculatedCalories).toBe(1700)
  })

  it('zwraca isValid=false dla kalorii poniżej minimum dla kobiet', () => {
    const result = validateMinimumCalories(1300, 'female')
    expect(result.isValid).toBe(false)
    expect(result.minimumCalories).toBe(1400)
    expect(result.message).toContain('poniżej bezpiecznego minimum')
    expect(result.message).toContain('kobiet')
    expect(result.message).toContain('1400')
  })

  it('zwraca isValid=false dla kalorii poniżej minimum dla mężczyzn', () => {
    const result = validateMinimumCalories(1500, 'male')
    expect(result.isValid).toBe(false)
    expect(result.minimumCalories).toBe(1600)
    expect(result.message).toContain('poniżej bezpiecznego minimum')
    expect(result.message).toContain('mężczyzn')
    expect(result.message).toContain('1600')
  })

  it('zwraca isValid=true dla kalorii równych minimum', () => {
    const resultFemale = validateMinimumCalories(1400, 'female')
    const resultMale = validateMinimumCalories(1600, 'male')

    expect(resultFemale.isValid).toBe(true)
    expect(resultMale.isValid).toBe(true)
  })

  it('zaokrągla obliczone kalorie', () => {
    const result = validateMinimumCalories(1523.7, 'female')
    expect(result.calculatedCalories).toBe(1524)
  })
})

describe('calculateMacros', () => {
  const targetCalories = 1800

  it('oblicza poprawne gramy dla proporcji 60_25_15 (domyślne keto)', () => {
    const macros = calculateMacros(targetCalories, '60_25_15')

    // Węgle: 1800 × 0.15 / 4 = 67.5 → 68g
    expect(macros.carbs_g).toBe(68)
    // Białko: 1800 × 0.25 / 4 = 112.5 → 113g
    expect(macros.protein_g).toBe(113)
    // Tłuszcze: 1800 × 0.60 / 9 = 120g
    expect(macros.fats_g).toBe(120)
  })

  it('oblicza poprawne gramy dla proporcji 70_25_5 (bardzo restrykcyjne keto)', () => {
    const macros = calculateMacros(targetCalories, '70_25_5')

    // Węgle: 1800 × 0.05 / 4 = 22.5 → 23g
    expect(macros.carbs_g).toBe(23)
    // Białko: 1800 × 0.25 / 4 = 112.5 → 113g
    expect(macros.protein_g).toBe(113)
    // Tłuszcze: 1800 × 0.70 / 9 = 140g
    expect(macros.fats_g).toBe(140)
  })

  it('oblicza poprawne gramy dla proporcji 40_40_20 (wysokobiałkowe)', () => {
    const macros = calculateMacros(targetCalories, '40_40_20')

    // Węgle: 1800 × 0.20 / 4 = 90g
    expect(macros.carbs_g).toBe(90)
    // Białko: 1800 × 0.40 / 4 = 180g
    expect(macros.protein_g).toBe(180)
    // Tłuszcze: 1800 × 0.40 / 9 = 80g
    expect(macros.fats_g).toBe(80)
  })

  it('kalorie z makro sumują się do docelowych kalorii (z tolerancją zaokrągleń)', () => {
    const ratios = [
      '70_25_5',
      '60_35_5',
      '60_30_10',
      '60_25_15',
      '50_30_20',
      '45_30_25',
      '40_40_20',
    ] as const

    for (const ratio of ratios) {
      const macros = calculateMacros(targetCalories, ratio)
      const totalCalories =
        macros.carbs_g * 4 + macros.protein_g * 4 + macros.fats_g * 9

      // Tolerancja ±20 kcal ze względu na zaokrąglenia
      expect(totalCalories).toBeCloseTo(targetCalories, -1)
    }
  })

  it('używa domyślnego ratio gdy nie podano', () => {
    const macros = calculateMacros(targetCalories)
    const macrosExplicit = calculateMacros(targetCalories, '60_25_15')

    expect(macros).toEqual(macrosExplicit)
  })
})

describe('calculateNutritionTargets (funkcja fasadowa)', () => {
  it('oblicza kompletne cele dla kobiety z utrzymaniem wagi', () => {
    const result = calculateNutritionTargets({
      gender: 'female',
      age: 30,
      weight_kg: 70,
      height_cm: 165,
      activity_level: 'moderate',
      goal: 'weight_maintenance',
    })

    // BMR: 1420.25, TDEE (×1.55): 2201.39
    expect(result.target_calories).toBeCloseTo(2201, -1)
    expect(result.target_carbs_g).toBeGreaterThan(0)
    expect(result.target_protein_g).toBeGreaterThan(0)
    expect(result.target_fats_g).toBeGreaterThan(0)
  })

  it('oblicza kompletne cele dla mężczyzny z utratą wagi', () => {
    const result = calculateNutritionTargets({
      gender: 'male',
      age: 35,
      weight_kg: 85,
      height_cm: 180,
      activity_level: 'moderate',
      goal: 'weight_loss',
      weight_loss_rate_kg_week: 0.5,
    })

    // BMR: 1805, TDEE (×1.55): 2797.75, Po deficycie (-550): 2247.75
    expect(result.target_calories).toBeCloseTo(2248, -1)
  })

  it('respektuje wybrane macro_ratio', () => {
    const result = calculateNutritionTargets({
      gender: 'female',
      age: 25,
      weight_kg: 60,
      height_cm: 160,
      activity_level: 'low',
      goal: 'weight_maintenance',
      macro_ratio: '70_25_5',
    })

    // Sprawdź proporcje: 70% tłuszcze, 25% białko, 5% węgle
    const totalCalories =
      result.target_carbs_g * 4 +
      result.target_protein_g * 4 +
      result.target_fats_g * 9

    const carbsPercent = (result.target_carbs_g * 4) / totalCalories
    const proteinPercent = (result.target_protein_g * 4) / totalCalories
    const fatsPercent = (result.target_fats_g * 9) / totalCalories

    expect(carbsPercent).toBeCloseTo(0.05, 1)
    expect(proteinPercent).toBeCloseTo(0.25, 1)
    expect(fatsPercent).toBeCloseTo(0.7, 1)
  })

  it('rzuca błąd gdy kalorie spadają poniżej minimum', () => {
    // Scenariusz: Kobieta z niskim TDEE i agresywnym deficytem
    expect(() => {
      calculateNutritionTargets({
        gender: 'female',
        age: 60,
        weight_kg: 50,
        height_cm: 155,
        activity_level: 'very_low',
        goal: 'weight_loss',
        weight_loss_rate_kg_week: 1.0,
      })
    }).toThrow('poniżej bezpiecznego minimum')
  })

  it('kalorie są zaokrąglane do pełnej liczby', () => {
    const result = calculateNutritionTargets({
      gender: 'male',
      age: 30,
      weight_kg: 75,
      height_cm: 175,
      activity_level: 'moderate',
      goal: 'weight_maintenance',
    })

    expect(Number.isInteger(result.target_calories)).toBe(true)
    expect(Number.isInteger(result.target_carbs_g)).toBe(true)
    expect(Number.isInteger(result.target_protein_g)).toBe(true)
    expect(Number.isInteger(result.target_fats_g)).toBe(true)
  })

  it('używa domyślnego macro_ratio gdy nie podano lub null', () => {
    const resultNull = calculateNutritionTargets({
      gender: 'female',
      age: 30,
      weight_kg: 65,
      height_cm: 165,
      activity_level: 'moderate',
      goal: 'weight_maintenance',
      macro_ratio: null,
    })

    const resultExplicit = calculateNutritionTargets({
      gender: 'female',
      age: 30,
      weight_kg: 65,
      height_cm: 165,
      activity_level: 'moderate',
      goal: 'weight_maintenance',
      macro_ratio: '60_25_15', // domyślne
    })

    expect(resultNull).toEqual(resultExplicit)
  })
})
