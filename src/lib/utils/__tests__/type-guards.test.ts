/**
 * Tests for type-guards utility
 */

import { describe, it, expect } from 'vitest'
import {
  isValidMealData,
  isValidRecipeData,
  isValidProfileData,
  assertObject,
  assertNonEmptyArray,
  isDefined,
  isNonEmptyString,
  isPositiveNumber,
} from '../type-guards'

describe('type-guards', () => {
  describe('isValidMealData', () => {
    const validMealData = {
      id: 1,
      meal_date: '2025-01-15',
      meal_type: 'breakfast',
      is_eaten: false,
      ingredient_overrides: null,
      created_at: '2025-01-15T10:00:00Z',
      recipe: {
        id: 1,
        name: 'Test Recipe',
        instructions: [],
        meal_types: ['breakfast'],
        tags: null,
        image_url: null,
        difficulty_level: 'easy',
        total_calories: 500,
        total_protein_g: 30,
        total_carbs_g: 20,
        total_fats_g: 25,
      },
    }

    it('should return true for valid meal data', () => {
      expect(isValidMealData(validMealData)).toBe(true)
    })

    it('should return false for null', () => {
      expect(isValidMealData(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidMealData(undefined)).toBe(false)
    })

    it('should return false when missing id', () => {
      const { id: _, ...data } = validMealData
      expect(isValidMealData(data)).toBe(false)
    })

    it('should return false when missing recipe', () => {
      const { recipe: _, ...data } = validMealData
      expect(isValidMealData(data)).toBe(false)
    })

    it('should return false when recipe is null', () => {
      expect(isValidMealData({ ...validMealData, recipe: null })).toBe(false)
    })

    it('should return false when recipe missing name', () => {
      const data = {
        ...validMealData,
        recipe: { id: 1 },
      }
      expect(isValidMealData(data)).toBe(false)
    })
  })

  describe('isValidRecipeData', () => {
    it('should return true for valid recipe data', () => {
      expect(isValidRecipeData({ id: 1, name: 'Test Recipe' })).toBe(true)
    })

    it('should return false for null', () => {
      expect(isValidRecipeData(null)).toBe(false)
    })

    it('should return false when missing id', () => {
      expect(isValidRecipeData({ name: 'Test Recipe' })).toBe(false)
    })

    it('should return false when missing name', () => {
      expect(isValidRecipeData({ id: 1 })).toBe(false)
    })

    it('should return false when id is not a number', () => {
      expect(isValidRecipeData({ id: '1', name: 'Test' })).toBe(false)
    })
  })

  describe('isValidProfileData', () => {
    it('should return true for valid profile data', () => {
      expect(isValidProfileData({ id: 'user-id', target_calories: 2000 })).toBe(
        true
      )
    })

    it('should return false for null', () => {
      expect(isValidProfileData(null)).toBe(false)
    })

    it('should return false when id is not a string', () => {
      expect(isValidProfileData({ id: 123, target_calories: 2000 })).toBe(false)
    })

    it('should return false when target_calories is not a number', () => {
      expect(
        isValidProfileData({ id: 'user-id', target_calories: '2000' })
      ).toBe(false)
    })
  })

  describe('assertObject', () => {
    it('should not throw for valid object', () => {
      expect(() => assertObject({ key: 'value' })).not.toThrow()
    })

    it('should throw for null', () => {
      expect(() => assertObject(null)).toThrow('Expected an object')
    })

    it('should throw for undefined', () => {
      expect(() => assertObject(undefined)).toThrow('Expected an object')
    })

    it('should use custom error message', () => {
      expect(() => assertObject(null, 'Custom error')).toThrow('Custom error')
    })
  })

  describe('assertNonEmptyArray', () => {
    it('should not throw for non-empty array', () => {
      expect(() => assertNonEmptyArray([1, 2, 3])).not.toThrow()
    })

    it('should throw for empty array', () => {
      expect(() => assertNonEmptyArray([])).toThrow(
        'Expected a non-empty array'
      )
    })

    it('should throw for non-array', () => {
      expect(() => assertNonEmptyArray('not-array')).toThrow(
        'Expected a non-empty array'
      )
    })

    it('should throw for null', () => {
      expect(() => assertNonEmptyArray(null)).toThrow(
        'Expected a non-empty array'
      )
    })
  })

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined(0)).toBe(true)
      expect(isDefined('')).toBe(true)
      expect(isDefined(false)).toBe(true)
      expect(isDefined({})).toBe(true)
    })

    it('should return false for null', () => {
      expect(isDefined(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isDefined(undefined)).toBe(false)
    })
  })

  describe('isNonEmptyString', () => {
    it('should return true for non-empty string', () => {
      expect(isNonEmptyString('hello')).toBe(true)
      expect(isNonEmptyString(' ')).toBe(true)
    })

    it('should return false for empty string', () => {
      expect(isNonEmptyString('')).toBe(false)
    })

    it('should return false for non-string', () => {
      expect(isNonEmptyString(123)).toBe(false)
      expect(isNonEmptyString(null)).toBe(false)
      expect(isNonEmptyString(undefined)).toBe(false)
    })
  })

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true)
      expect(isPositiveNumber(0.5)).toBe(true)
      expect(isPositiveNumber(100)).toBe(true)
    })

    it('should return false for zero', () => {
      expect(isPositiveNumber(0)).toBe(false)
    })

    it('should return false for negative numbers', () => {
      expect(isPositiveNumber(-1)).toBe(false)
      expect(isPositiveNumber(-0.5)).toBe(false)
    })

    it('should return false for NaN', () => {
      expect(isPositiveNumber(NaN)).toBe(false)
    })

    it('should return false for non-numbers', () => {
      expect(isPositiveNumber('1')).toBe(false)
      expect(isPositiveNumber(null)).toBe(false)
    })
  })
})
