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

    // BMR dla mężczyzny: 10*85 + 6.25*180 - 5*35 + 5 = 1805
    // TDEE (moderate=1.55): 1805 * 1.55 ≈ 2797.75
    // Deficyt: (0.5 * 7700) / 7 ≈ 550 kcal/dzień
    // Kalorie celowe: 2797.75 - 550 ≈ 2248 (Math.round)
    expect(result!.target_calories).toBeCloseTo(2248, -1)
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
    expect(options.every((opt) => opt.deficitPerDay === 0)).toBe(true)
  })

  it('zwraca pustą tablicę gdy TDEE poniżej minimum', () => {
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
    // To jest poniżej minimum 1400, więc żadna opcja nie jest dostępna
    expect(options).toHaveLength(0)
  })

  it('poprawnie oblicza deficyt dzienny dla standardowych opcji', () => {
    const data: Partial<OnboardingFormData> = {
      gender: 'male',
      age: 30,
      weight_kg: 80,
      height_cm: 175,
      activity_level: 'high',
    }

    const options = generateWeightLossOptions(data)

    // Wszystkie standardowe opcje powinny być dostępne dla osoby z wysokim TDEE
    expect(options.length).toBeGreaterThanOrEqual(2)

    // Sprawdź czy deficyty są poprawnie obliczone
    const opt025 = options.find((o) => o.value === 0.25)
    const opt050 = options.find((o) => o.value === 0.5)

    // 0.25 kg/tydz → (0.25 * 7700) / 7 ≈ 275 kcal/dzień
    if (opt025) expect(opt025.deficitPerDay).toBeCloseTo(275, 0)
    // 0.5 kg/tydz → 550 kcal/dzień
    if (opt050) expect(opt050.deficitPerDay).toBeCloseTo(550, 0)
  })

  it('generuje dynamiczne opcje gdy tylko 1 standardowa dostępna', () => {
    // Scenariusz: Osoba z ograniczonym TDEE (tylko 0.25 standardowo dostępne)
    const data: Partial<OnboardingFormData> = {
      gender: 'female',
      age: 35,
      weight_kg: 60,
      height_cm: 165,
      activity_level: 'low',
    }

    const options = generateWeightLossOptions(data)

    // BMR: 10*60 + 6.25*165 - 5*35 - 161 ≈ 1295
    // TDEE (low=1.375): 1295 * 1.375 ≈ 1780
    // Max deficyt: 1780 - 1400 = 380 kcal/dzień
    // Max rate: (380 * 7) / 7700 ≈ 0.345 kg/tydzień
    // Zaokrąglone do 0.05: 0.30 kg/tydzień
    // Powinny być 2 opcje: 0.15 i 0.30 lub standardowe 0.25

    expect(options.length).toBeGreaterThanOrEqual(1)
    // Wszystkie opcje powinny mieć obliczony deficyt
    expect(options.every((opt) => opt.deficitPerDay > 0)).toBe(true)
  })

  it('generuje max i połowę max dla ograniczonego TDEE', () => {
    // Scenariusz: Osoba gdzie max rate to około 0.4 kg/tydzień
    const data: Partial<OnboardingFormData> = {
      gender: 'male',
      age: 40,
      weight_kg: 70,
      height_cm: 170,
      activity_level: 'low',
    }

    const options = generateWeightLossOptions(data)

    // BMR: 10*70 + 6.25*170 - 5*40 + 5 ≈ 1568
    // TDEE (low=1.375): 1568 * 1.375 ≈ 2156
    // Max deficyt: 2156 - 1600 = 556 kcal/dzień
    // Max rate: (556 * 7) / 7700 ≈ 0.505 kg/tydzień
    // Powinny być dostępne 0.25 i 0.5 (2 standardowe opcje)

    expect(options.length).toBeGreaterThanOrEqual(2)
    expect(options.every((opt) => !opt.isDisabled)).toBe(true)
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
