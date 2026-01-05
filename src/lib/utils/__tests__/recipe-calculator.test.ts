/**
 * Tests for recipe-calculator utility
 */

import { describe, it, expect } from 'vitest'
import {
  calculateRecipeNutritionWithOverrides,
  hasIngredientOverrides,
  getAdjustedIngredientAmount,
} from '../recipe-calculator'
import type { RecipeDTO } from '@/types/dto.types'

describe('recipe-calculator', () => {
  describe('calculateRecipeNutritionWithOverrides', () => {
    const mockRecipeWithIngredients: RecipeDTO = {
      id: 1,
      name: 'Test Recipe',
      instructions: [],
      meal_types: ['breakfast'],
      tags: [],
      image_url: null,
      difficulty_level: 'easy',
      total_calories: 380,
      total_protein_g: 30,
      total_carbs_g: 20,
      total_fats_g: 25,
      prep_time_min: 10,
      required_equipment: [],
      average_rating: null,
      ingredients: [
        {
          id: 1,
          name: 'Chicken Breast',
          amount: 100,
          unit: 'g',
          category: 'meat',
          is_scalable: true,
          calories: 200,
          protein_g: 25,
          carbs_g: 0,
          fats_g: 5,
        },
        {
          id: 2,
          name: 'Rice',
          amount: 50,
          unit: 'g',
          category: 'grains',
          is_scalable: true,
          calories: 180,
          protein_g: 5,
          carbs_g: 20,
          fats_g: 20,
        },
      ],
    }

    const mockRecipeWithoutIngredients: RecipeDTO = {
      id: 2,
      name: 'Recipe Without Ingredients',
      instructions: [],
      meal_types: ['lunch'],
      tags: [],
      image_url: null,
      difficulty_level: 'easy',
      total_calories: 500,
      total_protein_g: 40,
      total_carbs_g: 30,
      total_fats_g: 20,
      prep_time_min: 15,
      required_equipment: [],
      average_rating: null,
      ingredients: [],
    }

    it('should return recipe totals when no ingredients', () => {
      const result = calculateRecipeNutritionWithOverrides(
        mockRecipeWithoutIngredients,
        null
      )
      expect(result).toEqual({
        calories: 500,
        protein_g: 40,
        carbs_g: 30,
        fats_g: 20,
      })
    })

    it('should calculate nutrition from ingredients without overrides', () => {
      const result = calculateRecipeNutritionWithOverrides(
        mockRecipeWithIngredients,
        null
      )
      // 200 + 180 = 380 calories
      expect(result.calories).toBe(380)
      // 25 + 5 = 30 protein
      expect(result.protein_g).toBe(30)
      // 0 + 20 = 20 carbs
      expect(result.carbs_g).toBe(20)
      // 5 + 20 = 25 fats
      expect(result.fats_g).toBe(25)
    })

    it('should apply overrides to nutrition calculation', () => {
      const overrides = [
        { ingredient_id: 1, new_amount: 150, auto_adjusted: false }, // 150% of chicken
      ]
      const result = calculateRecipeNutritionWithOverrides(
        mockRecipeWithIngredients,
        overrides
      )
      // Chicken: 200 * 1.5 = 300, Rice: 180
      expect(result.calories).toBe(480)
      // Chicken protein: 25 * 1.5 = 37.5, Rice: 5, Total: 42.5 -> 43 (rounded)
      expect(result.protein_g).toBe(43)
    })

    it('should handle zero amount override (excluded ingredient)', () => {
      const overrides = [
        { ingredient_id: 1, new_amount: 0, auto_adjusted: false },
      ]
      const result = calculateRecipeNutritionWithOverrides(
        mockRecipeWithIngredients,
        overrides
      )
      // Only rice: 180 calories
      expect(result.calories).toBe(180)
      expect(result.protein_g).toBe(5)
    })

    it('should handle multiple overrides', () => {
      const overrides = [
        { ingredient_id: 1, new_amount: 200, auto_adjusted: false }, // 200% chicken
        { ingredient_id: 2, new_amount: 100, auto_adjusted: false }, // 200% rice
      ]
      const result = calculateRecipeNutritionWithOverrides(
        mockRecipeWithIngredients,
        overrides
      )
      // Chicken: 200 * 2 = 400, Rice: 180 * 2 = 360, Total: 760
      expect(result.calories).toBe(760)
    })

    it('should round results to nearest integer', () => {
      const overrides = [
        { ingredient_id: 1, new_amount: 133, auto_adjusted: false }, // 133% of chicken
      ]
      const result = calculateRecipeNutritionWithOverrides(
        mockRecipeWithIngredients,
        overrides
      )
      // Result should be rounded, not have decimals
      expect(Number.isInteger(result.calories)).toBe(true)
      expect(Number.isInteger(result.protein_g)).toBe(true)
    })

    it('should handle empty overrides array', () => {
      const result = calculateRecipeNutritionWithOverrides(
        mockRecipeWithIngredients,
        []
      )
      expect(result.calories).toBe(380)
    })
  })

  describe('hasIngredientOverrides', () => {
    it('should return false for null', () => {
      expect(hasIngredientOverrides(null)).toBe(false)
    })

    it('should return false for empty array', () => {
      expect(hasIngredientOverrides([])).toBe(false)
    })

    it('should return true for non-empty array', () => {
      expect(
        hasIngredientOverrides([
          { ingredient_id: 1, new_amount: 100, auto_adjusted: false },
        ])
      ).toBe(true)
    })
  })

  describe('getAdjustedIngredientAmount', () => {
    const overrides = [
      { ingredient_id: 1, new_amount: 150, auto_adjusted: false },
      { ingredient_id: 2, new_amount: 75, auto_adjusted: true },
    ]

    it('should return original amount when no overrides', () => {
      expect(getAdjustedIngredientAmount(1, 100, null)).toBe(100)
    })

    it('should return original amount when ingredient not in overrides', () => {
      expect(getAdjustedIngredientAmount(999, 100, overrides)).toBe(100)
    })

    it('should return overridden amount', () => {
      expect(getAdjustedIngredientAmount(1, 100, overrides)).toBe(150)
    })

    it('should find correct override for multiple overrides', () => {
      expect(getAdjustedIngredientAmount(2, 50, overrides)).toBe(75)
    })

    it('should handle empty overrides array', () => {
      expect(getAdjustedIngredientAmount(1, 100, [])).toBe(100)
    })
  })
})
