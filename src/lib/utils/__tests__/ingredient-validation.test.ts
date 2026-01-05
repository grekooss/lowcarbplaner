/**
 * Tests for ingredient-validation utility
 */

import { describe, it, expect } from 'vitest'
import {
  validateIngredientAmount,
  validateIngredientOverrides,
  MAX_INGREDIENT_SCALE,
  LARGE_CHANGE_THRESHOLD_PERCENT,
} from '../ingredient-validation'

describe('ingredient-validation', () => {
  describe('validateIngredientAmount', () => {
    const scalableIngredient = {
      id: 1,
      amount: 100,
      is_scalable: true,
    }

    const nonScalableIngredient = {
      id: 2,
      amount: 50,
      is_scalable: false,
    }

    describe('negative amount', () => {
      it('should reject negative amounts', () => {
        const result = validateIngredientAmount(scalableIngredient, -10)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Ilość nie może być ujemna')
      })
    })

    describe('zero amount', () => {
      it('should allow zero amount (excluded ingredient)', () => {
        const result = validateIngredientAmount(scalableIngredient, 0)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should allow zero for non-scalable ingredients', () => {
        const result = validateIngredientAmount(nonScalableIngredient, 0)
        expect(result.valid).toBe(true)
      })
    })

    describe('non-scalable ingredients', () => {
      it('should reject amount different from original', () => {
        const result = validateIngredientAmount(nonScalableIngredient, 60)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Ten składnik nie może być skalowany')
      })

      it('should allow original amount', () => {
        const result = validateIngredientAmount(nonScalableIngredient, 50)
        expect(result.valid).toBe(true)
      })

      it('should allow amounts within tolerance (0.01)', () => {
        const result = validateIngredientAmount(nonScalableIngredient, 50.005)
        expect(result.valid).toBe(true)
      })
    })

    describe('max scale validation', () => {
      it('should reject amounts exceeding max scale (200%)', () => {
        const result = validateIngredientAmount(scalableIngredient, 250)
        expect(result.valid).toBe(false)
        expect(result.error).toContain('200%')
      })

      it('should allow amounts at max scale', () => {
        const maxAmount = scalableIngredient.amount * MAX_INGREDIENT_SCALE
        const result = validateIngredientAmount(scalableIngredient, maxAmount)
        expect(result.valid).toBe(true)
      })

      it('should allow amounts below max scale', () => {
        const result = validateIngredientAmount(scalableIngredient, 150)
        expect(result.valid).toBe(true)
      })
    })

    describe('large change warnings', () => {
      it('should warn for changes exceeding 15%', () => {
        // 20% increase: 100 -> 120
        const result = validateIngredientAmount(scalableIngredient, 120)
        expect(result.valid).toBe(true)
        expect(result.warning).toContain('Duża zmiana')
        expect(result.warning).toContain('20.0%')
      })

      it('should not warn for small changes', () => {
        // 10% increase: 100 -> 110
        const result = validateIngredientAmount(scalableIngredient, 110)
        expect(result.valid).toBe(true)
        expect(result.warning).toBeUndefined()
      })

      it('should not include warnings when disabled', () => {
        const result = validateIngredientAmount(scalableIngredient, 120, {
          includeWarnings: false,
        })
        expect(result.valid).toBe(true)
        expect(result.warning).toBeUndefined()
      })
    })
  })

  describe('validateIngredientOverrides', () => {
    const recipeIngredients = new Map([
      [1, { base_amount: 100, is_scalable: true }],
      [2, { base_amount: 50, is_scalable: false }],
    ])

    it('should return valid for empty overrides', () => {
      const result = validateIngredientOverrides([], recipeIngredients)
      expect(result.valid).toBe(true)
    })

    it('should return valid for valid overrides', () => {
      const overrides = [{ ingredient_id: 1, new_amount: 150 }]
      const result = validateIngredientOverrides(overrides, recipeIngredients)
      expect(result.valid).toBe(true)
    })

    it('should reject unknown ingredient', () => {
      const overrides = [{ ingredient_id: 999, new_amount: 100 }]
      const result = validateIngredientOverrides(overrides, recipeIngredients)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('nie istnieje w przepisie')
      expect(result.ingredientId).toBe(999)
    })

    it('should reject invalid amounts', () => {
      const overrides = [{ ingredient_id: 1, new_amount: -10 }]
      const result = validateIngredientOverrides(overrides, recipeIngredients)
      expect(result.valid).toBe(false)
      expect(result.ingredientId).toBe(1)
    })

    it('should reject scaling non-scalable ingredients', () => {
      const overrides = [{ ingredient_id: 2, new_amount: 60 }]
      const result = validateIngredientOverrides(overrides, recipeIngredients)
      expect(result.valid).toBe(false)
      expect(result.ingredientId).toBe(2)
    })

    it('should validate multiple overrides', () => {
      const overrides = [
        { ingredient_id: 1, new_amount: 150 },
        { ingredient_id: 2, new_amount: 0 }, // Exclude non-scalable
      ]
      const result = validateIngredientOverrides(overrides, recipeIngredients)
      expect(result.valid).toBe(true)
    })
  })

  describe('constants', () => {
    it('MAX_INGREDIENT_SCALE should be 2.0', () => {
      expect(MAX_INGREDIENT_SCALE).toBe(2.0)
    })

    it('LARGE_CHANGE_THRESHOLD_PERCENT should be 15', () => {
      expect(LARGE_CHANGE_THRESHOLD_PERCENT).toBe(15)
    })
  })
})
