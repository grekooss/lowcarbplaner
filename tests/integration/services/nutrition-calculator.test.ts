/**
 * Nutrition Calculator Service - Integration Tests
 *
 * Testy integracyjne dla kalkulatora kalorycznego:
 * - Obliczanie BMR (Mifflin-St Jeor)
 * - Obliczanie TDEE (z mnożnikiem aktywności)
 * - Deficyt kaloryczny
 * - Podział makroskładników (15%C / 35%P / 50%F)
 */

import { describe, test, expect } from 'vitest'
import {
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  calculateNutritionTargets,
} from '@/services/nutrition-calculator'

describe('Nutrition Calculator Service', () => {
  describe('BMR Calculation (Mifflin-St Jeor Formula)', () => {
    test('calculates BMR for male correctly', () => {
      const bmr = calculateBMR('male', 30, 85, 180)

      // BMR = (10 × waga) + (6.25 × wzrost) - (5 × wiek) + 5
      // ≈ 850 + 1125 - 150 + 5 = 1830 kcal
      expect(bmr).toBeGreaterThan(1800)
      expect(bmr).toBeLessThan(1900)
    })

    test('calculates BMR for female correctly', () => {
      const bmr = calculateBMR('female', 25, 65, 165)

      // BMR = (10 × waga) + (6.25 × wzrost) - (5 × wiek) - 161
      // ≈ 650 + 1031.25 - 125 - 161 = 1395 kcal
      expect(bmr).toBeGreaterThan(1350)
      expect(bmr).toBeLessThan(1450)
    })

    test('BMR increases with weight', () => {
      const bmr1 = calculateBMR('male', 30, 70, 180)
      const bmr2 = calculateBMR('male', 30, 90, 180)

      expect(bmr2).toBeGreaterThan(bmr1)
      // Difference should be approximately (90-70) * 10 = 200 kcal
      expect(bmr2 - bmr1).toBeGreaterThan(150)
      expect(bmr2 - bmr1).toBeLessThan(250)
    })

    test('BMR decreases with age', () => {
      const bmr1 = calculateBMR('male', 25, 85, 180)
      const bmr2 = calculateBMR('male', 45, 85, 180)

      expect(bmr1).toBeGreaterThan(bmr2)
      // Difference should be approximately (45-25) * 5 = 100 kcal
      expect(bmr1 - bmr2).toBeGreaterThan(80)
      expect(bmr1 - bmr2).toBeLessThan(120)
    })
  })

  describe('TDEE Calculation (Activity Multiplier)', () => {
    test('calculates TDEE with very_low multiplier (1.2)', () => {
      const bmr = calculateBMR('male', 30, 85, 180)
      const tdee = calculateTDEE(bmr, 'very_low')

      // TDEE = BMR × 1.2 ≈ 1830 × 1.2 ≈ 2196 kcal
      expect(tdee).toBeGreaterThan(2100)
      expect(tdee).toBeLessThan(2300)
    })

    test('calculates TDEE with moderate multiplier (1.55)', () => {
      const bmr = calculateBMR('male', 30, 85, 180)
      const tdee = calculateTDEE(bmr, 'moderate')

      // TDEE = BMR × 1.55 ≈ 1830 × 1.55 ≈ 2836 kcal
      expect(tdee).toBeGreaterThan(2700)
      expect(tdee).toBeLessThan(2950)
    })

    test('calculates TDEE with high multiplier (1.725)', () => {
      const bmr = calculateBMR('female', 25, 65, 165)
      const tdee = calculateTDEE(bmr, 'high')

      // TDEE = BMR × 1.725 ≈ 1395 × 1.725 ≈ 2406 kcal
      expect(tdee).toBeGreaterThan(2300)
      expect(tdee).toBeLessThan(2550)
    })

    test('TDEE increases with activity level', () => {
      const bmr = calculateBMR('male', 30, 85, 180)
      const tdee1 = calculateTDEE(bmr, 'very_low')
      const tdee2 = calculateTDEE(bmr, 'high')

      expect(tdee2).toBeGreaterThan(tdee1)
      // High (1.725) vs Very Low (1.2) should be ~40% difference
      const diff = ((tdee2 - tdee1) / tdee1) * 100
      expect(diff).toBeGreaterThan(35)
      expect(diff).toBeLessThan(50)
    })
  })

  describe('Macro Split (15% Carbs / 35% Protein / 50% Fats)', () => {
    test('calculates macros with fixed ratio for 1800 kcal', () => {
      const macros = calculateMacros(1800)

      // Węglowodany: 1800 × 0.15 / 4 = 67.5g (allow ±1g due to rounding)
      expect(Math.abs(macros.carbs_g - 67.5)).toBeLessThanOrEqual(1)

      // Białko: 1800 × 0.35 / 4 = 157.5g (allow ±1g due to rounding)
      expect(Math.abs(macros.protein_g - 157.5)).toBeLessThanOrEqual(1)

      // Tłuszcze: 1800 × 0.50 / 9 = 100g (allow ±1g due to rounding)
      expect(Math.abs(macros.fats_g - 100)).toBeLessThanOrEqual(1)
    })

    test('macros sum approximately equals target calories', () => {
      const targetCalories = 2000
      const macros = calculateMacros(targetCalories)

      const calculatedCalories =
        macros.carbs_g * 4 + macros.protein_g * 4 + macros.fats_g * 9

      // Should be within 5 kcal due to rounding
      expect(calculatedCalories).toBeCloseTo(targetCalories, -1)
    })

    test('maintains 15/35/50 ratio regardless of calories', () => {
      const macros1 = calculateMacros(1500)
      const macros2 = calculateMacros(3000)

      // Ratio carbs:protein:fats should be the same
      const ratio1 = {
        c: (macros1.carbs_g * 4) / 1500,
        p: (macros1.protein_g * 4) / 1500,
        f: (macros1.fats_g * 9) / 1500,
      }
      const ratio2 = {
        c: (macros2.carbs_g * 4) / 3000,
        p: (macros2.protein_g * 4) / 3000,
        f: (macros2.fats_g * 9) / 3000,
      }

      expect(ratio1.c).toBeCloseTo(0.15, 2)
      expect(ratio1.p).toBeCloseTo(0.35, 2)
      expect(ratio1.f).toBeCloseTo(0.50, 2)
      expect(ratio2.c).toBeCloseTo(ratio1.c, 2)
      expect(ratio2.p).toBeCloseTo(ratio1.p, 2)
      expect(ratio2.f).toBeCloseTo(ratio1.f, 2)
    })
  })

  describe('calculateNutritionTargets - Integration', () => {
    test('calculates complete nutrition targets for weight loss', () => {
      const targets = calculateNutritionTargets({
        gender: 'male',
        age: 30,
        weight_kg: 85,
        height_cm: 180,
        activity_level: 'moderate',
        goal: 'weight_loss',
        weight_loss_rate_kg_week: 0.5,
      })

      // TDEE ≈ 1830 × 1.55 ≈ 2836
      // Deficit for 0.5 kg/week ≈ 550 kcal/day (0.5 × 1100)
      // Target ≈ 2836 - 550 ≈ 2286, but minimum 1600 for male
      expect(targets.target_calories).toBeGreaterThan(1600)
      expect(targets.target_calories).toBeLessThan(2500)

      // Macros should follow 15/35/50 ratio
      const totalCals =
        targets.target_carbs_g * 4 +
        targets.target_protein_g * 4 +
        targets.target_fats_g * 9

      expect(totalCals).toBeCloseTo(targets.target_calories, -1)
    })

    test('calculates complete nutrition targets for maintenance', () => {
      const targets = calculateNutritionTargets({
        gender: 'female',
        age: 25,
        weight_kg: 65,
        height_cm: 165,
        activity_level: 'low',
        goal: 'weight_maintenance',
        weight_loss_rate_kg_week: null,
      })

      // TDEE ≈ 1395 × 1.375 ≈ 1918
      // No deficit for maintenance
      expect(targets.target_calories).toBeGreaterThan(1800)
      expect(targets.target_calories).toBeLessThan(2100)

      // Check macro split
      expect(targets.target_carbs_g).toBeGreaterThan(0)
      expect(targets.target_protein_g).toBeGreaterThan(0)
      expect(targets.target_fats_g).toBeGreaterThan(0)
    })

    test('enforces minimum calories for male (1600)', () => {
      // Aggressive deficit that would go below minimum should throw error
      expect(() => {
        calculateNutritionTargets({
          gender: 'male',
          age: 60,
          weight_kg: 60,
          height_cm: 165,
          activity_level: 'very_low',
          goal: 'weight_loss',
          weight_loss_rate_kg_week: 1.0, // Aggressive - causes calories < 1600
        })
      }).toThrow(/bezpiecznego minimum dla mężczyzn/)
    })

    test('enforces minimum calories for female (1400)', () => {
      // Aggressive deficit that would go below minimum should throw error
      expect(() => {
        calculateNutritionTargets({
          gender: 'female',
          age: 55,
          weight_kg: 55,
          height_cm: 160,
          activity_level: 'very_low',
          goal: 'weight_loss',
          weight_loss_rate_kg_week: 1.0, // Aggressive - causes calories < 1400
        })
      }).toThrow(/bezpiecznego minimum dla kobiet/)
    })
  })

  describe('Edge Cases', () => {
    test('handles minimum weight correctly', () => {
      const bmr = calculateBMR('female', 30, 45, 155)
      expect(bmr).toBeGreaterThan(1000)
      expect(bmr).toBeLessThan(1300)
    })

    test('handles maximum age correctly', () => {
      const bmr = calculateBMR('male', 80, 75, 170)
      expect(bmr).toBeGreaterThan(1200)
      expect(bmr).toBeLessThan(1600)
    })

    test('handles very high activity level', () => {
      const bmr = calculateBMR('male', 25, 90, 185)
      const tdee = calculateTDEE(bmr, 'very_high')

      // TDEE should be significantly higher than BMR (1.9x)
      expect(tdee).toBeGreaterThan(bmr * 1.85)
      expect(tdee).toBeLessThan(bmr * 1.95)
    })
  })
})
