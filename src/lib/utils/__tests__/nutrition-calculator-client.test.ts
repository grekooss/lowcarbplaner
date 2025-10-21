/**
 * Tests for Client-side Nutrition Calculator
 */

import { describe, it, expect } from 'vitest'
import {
  calculateNutritionTargetsClient,
  generateWeightLossOptions,
  calculateTDEE,
} from '../nutrition-calculator-client'
import type { OnboardingFormData } from '@/types/onboarding-view.types'

describe('calculateNutritionTargetsClient', () => {
  it('zwraca null gdy brakuje wymaganych danych', () => {
    const incompleteData: Partial<OnboardingFormData> = {
      gender: 'female',
      age: 30,
    }

    const result = calculateNutritionTargetsClient(incompleteData)
    expect(result).toBeNull()
  })

  it('oblicza poprawnie cele dla kobiety z utrzymaniem wagi', () => {
    const data: Partial<OnboardingFormData> = {
      gender: 'female',
      age: 30,
      weight_kg: 70,
      height_cm: 165,
      activity_level: 'moderate',
      goal: 'weight_maintenance',
    }

    const result = calculateNutritionTargetsClient(data)

    expect(result).not.toBeNull()
    expect(result!.target_calories).toBeGreaterThan(0)
    expect(result!.target_carbs_g).toBeGreaterThan(0)
    expect(result!.target_protein_g).toBeGreaterThan(0)
    expect(result!.target_fats_g).toBeGreaterThan(0)

    // BMR dla kobiety: 10*70 + 6.25*165 - 5*30 - 161 = 1420.25
    // TDEE (moderate=1.55): 1420.25 * 1.55 ≈ 2201
    expect(result!.target_calories).toBeCloseTo(2201, -1)
  })

  it('oblicza poprawnie cele dla mężczyzny z utratą wagi', () => {
    const data: Partial<OnboardingFormData> = {
      gender: 'male',
      age: 35,
      weight_kg: 85,
      height_cm: 180,
      activity_level: 'moderate',
      goal: 'weight_loss',
      weight_loss_rate_kg_week: 0.5,
    }

    const result = calculateNutritionTargetsClient(data)

    expect(result).not.toBeNull()

    // BMR dla mężczyzny: 10*85 + 6.25*180 - 5*35 + 5 = 1810
    // TDEE (moderate=1.55): 1810 * 1.55 ≈ 2806
    // Deficyt: (0.5 * 7700) / 7 ≈ 550 kcal/dzień
    // Kalorie celowe: 2806 - 550 ≈ 2256
    expect(result!.target_calories).toBeCloseTo(2256, -1)
  })

  it('rozkład makro sumuje się do pełnych kalorii', () => {
    const data: Partial<OnboardingFormData> = {
      gender: 'female',
      age: 25,
      weight_kg: 60,
      height_cm: 160,
      activity_level: 'low',
      goal: 'weight_maintenance',
    }

    const result = calculateNutritionTargetsClient(data)
    expect(result).not.toBeNull()

    // Oblicz kalorie z makro (15% W, 35% B, 50% T)
    const caloriesFromMacro =
      result!.target_carbs_g * 4 +
      result!.target_protein_g * 4 +
      result!.target_fats_g * 9

    // Powinno być bliskie target_calories (dopuszczamy zaokrąglenia)
    expect(caloriesFromMacro).toBeCloseTo(result!.target_calories, -1)
  })
})

describe('generateWeightLossOptions', () => {
  it('zwraca wszystkie opcje bez walidacji gdy brakuje danych', () => {
    const incompleteData: Partial<OnboardingFormData> = {
      gender: 'female',
    }

    const options = generateWeightLossOptions(incompleteData)

    expect(options).toHaveLength(4)
    expect(options.every((opt) => !opt.isDisabled)).toBe(true)
    expect(options.every((opt) => opt.deficitPerDay === 0)).toBe(true)
  })

  it('wyłącza opcje prowadzące poniżej minimum dla kobiety', () => {
    // Scenariusz: Kobieta z niskim TDEE
    const data: Partial<OnboardingFormData> = {
      gender: 'female',
      age: 60,
      weight_kg: 50,
      height_cm: 155,
      activity_level: 'very_low',
    }

    const options = generateWeightLossOptions(data)

    // BMR: 10*50 + 6.25*155 - 5*60 - 161 ≈ 807.75
    // TDEE (very_low=1.2): 807.75 * 1.2 ≈ 969
    // To jest poniżej minimum 1400, więc wszystkie opcje powinny być disabled
    expect(options.some((opt) => opt.isDisabled)).toBe(true)
  })

  it('poprawnie oblicza deficyt dzienny dla każdej opcji', () => {
    const data: Partial<OnboardingFormData> = {
      gender: 'male',
      age: 30,
      weight_kg: 80,
      height_cm: 175,
      activity_level: 'high',
    }

    const options = generateWeightLossOptions(data)

    // Sprawdź czy deficyty są poprawnie obliczone
    // 0.25 kg/tydz → (0.25 * 7700) / 7 ≈ 275 kcal/dzień
    expect(options[0].deficitPerDay).toBeCloseTo(275, 0)
    // 0.5 kg/tydz → 550 kcal/dzień
    expect(options[1].deficitPerDay).toBeCloseTo(550, 0)
    // 0.75 kg/tydz → 825 kcal/dzień
    expect(options[2].deficitPerDay).toBeCloseTo(825, 0)
    // 1.0 kg/tydz → 1100 kcal/dzień
    expect(options[3].deficitPerDay).toBeCloseTo(1100, 0)
  })

  it('ustawia reasonDisabled dla wyłączonych opcji', () => {
    const data: Partial<OnboardingFormData> = {
      gender: 'female',
      age: 50,
      weight_kg: 55,
      height_cm: 160,
      activity_level: 'low',
    }

    const options = generateWeightLossOptions(data)

    const disabledOptions = options.filter((opt) => opt.isDisabled)

    disabledOptions.forEach((opt) => {
      expect(opt.reasonDisabled).toBeDefined()
      expect(opt.reasonDisabled).toContain('1400 kcal')
    })
  })
})

describe('calculateTDEE', () => {
  it('zwraca null gdy brakuje danych', () => {
    const incompleteData: Partial<OnboardingFormData> = {
      gender: 'male',
      age: 30,
    }

    const result = calculateTDEE(incompleteData)
    expect(result).toBeNull()
  })

  it('oblicza poprawnie TDEE dla różnych poziomów aktywności', () => {
    const baseData: Partial<OnboardingFormData> = {
      gender: 'male',
      age: 30,
      weight_kg: 75,
      height_cm: 175,
    }

    // Test dla różnych poziomów aktywności
    const tdeeVeryLow = calculateTDEE({
      ...baseData,
      activity_level: 'very_low',
    })
    const tdeeModerate = calculateTDEE({
      ...baseData,
      activity_level: 'moderate',
    })
    const tdeeVeryHigh = calculateTDEE({
      ...baseData,
      activity_level: 'very_high',
    })

    expect(tdeeVeryLow).not.toBeNull()
    expect(tdeeModerate).not.toBeNull()
    expect(tdeeVeryHigh).not.toBeNull()

    // TDEE powinno rosnąć wraz z poziomem aktywności
    expect(tdeeVeryLow!).toBeLessThan(tdeeModerate!)
    expect(tdeeModerate!).toBeLessThan(tdeeVeryHigh!)
  })
})
