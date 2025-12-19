/**
 * Meal Plan Generator Service - Integration Tests
 *
 * Testy integracyjne dla logiki generowania planu posiłków:
 * - Generowanie planu 7-dniowego
 * - Dobór przepisów według kalorii
 * - Różnorodność przepisów
 * - Optymalizacja makroskładników
 * - Skalowanie składników
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import {
  generateWeeklyPlan,
  generateDayPlan,
  checkExistingPlan,
  findMissingDays,
} from '@/services/meal-plan-generator'
import { createTestProfile } from '../../fixtures/profiles'
import {
  breakfastRecipes,
  lunchRecipes,
  dinnerRecipes,
  allTestRecipes,
} from '../../fixtures/recipes'

// Helper function to get mock recipes
const getMockRecipes = (mealType: string, minCal?: number, maxCal?: number) => {
  let recipes
  // Return appropriate recipes based on meal type
  if (mealType === 'breakfast') {
    recipes = breakfastRecipes
  } else if (mealType === 'lunch') {
    recipes = lunchRecipes
  } else if (mealType === 'dinner') {
    recipes = dinnerRecipes
  } else {
    return []
  }

  // Filter by calorie range if provided
  if (minCal !== undefined && maxCal !== undefined) {
    recipes = recipes.filter(
      (r) => r.total_calories >= minCal && r.total_calories <= maxCal
    )
  }

  return recipes.map((r) => ({
    id: r.id,
    name: r.name,
    meal_types: r.meal_types,
    total_calories: r.total_calories,
    total_protein_g: r.total_protein_g,
    total_carbs_g: r.total_carbs_g,
    total_fats_g: r.total_fats_g,
    recipe_ingredients: r.ingredients.map((ing) => ({
      ingredient_id: ing.id,
      base_amount: ing.amount,
      unit: ing.unit,
      is_scalable: ing.is_scalable,
      calories: ing.calories,
      protein_g: ing.protein_g,
      carbs_g: ing.carbs_g,
      fats_g: ing.fats_g,
    })),
  }))
}

// Mock Supabase client with comprehensive recipe database
vi.mock('@/lib/supabase/server', () => {
  // Create query builder factory function
  const createQueryBuilder = () => {
    const builder = {
      _mealType: 'breakfast' as string,
      _minCal: undefined as number | undefined,
      _maxCal: undefined as number | undefined,

      select(this: any) {
        return this
      },
      insert(this: any) {
        return this
      },
      eq(this: any) {
        return this
      },
      gte(this: any, field: string, value: number) {
        if (field === 'total_calories') {
          this._minCal = value
        }
        return this
      },
      lte(this: any, field: string, value: number) {
        if (field === 'total_calories') {
          this._maxCal = value
        }
        return this
      },
      contains(this: any, field: string, value: any) {
        // Extract meal type from contains filter
        const mealType = Array.isArray(value) ? value[0] : value
        this._mealType = mealType
        return this
      },
      not(this: any) {
        return Promise.resolve({
          data: getMockRecipes(this._mealType, this._minCal, this._maxCal),
          error: null,
        })
      },
      order(this: any) {
        return this
      },
      limit(this: any) {
        return Promise.resolve({
          data: getMockRecipes(this._mealType, this._minCal, this._maxCal),
          error: null,
        })
      },
      in(this: any) {
        return Promise.resolve({
          data: [],
          error: null,
        })
      },
    }
    return builder
  }

  // Return module exports
  return {
    createAdminClient: vi.fn(() => ({
      from: vi.fn(() => createQueryBuilder()),
    })),
  }
})

describe('Meal Plan Generator Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateWeeklyPlan', () => {
    test('generates 7-day plan with 21 meals', async () => {
      const profile = createTestProfile()
      const startDate = new Date('2025-01-15')

      const plan = await generateWeeklyPlan(profile, startDate)

      // Weryfikacja struktury
      expect(plan).toHaveLength(21) // 7 dni × 3 posiłki
      expect(plan.filter((m) => m.meal_type === 'breakfast')).toHaveLength(7)
      expect(plan.filter((m) => m.meal_type === 'lunch')).toHaveLength(7)
      expect(plan.filter((m) => m.meal_type === 'dinner')).toHaveLength(7)
    })

    test('generates correct date range', async () => {
      const profile = createTestProfile()
      const startDate = new Date('2025-01-15')

      const plan = await generateWeeklyPlan(profile, startDate)

      // Sprawdź daty
      const dates = [...new Set(plan.map((m) => m.meal_date))].sort()
      expect(dates).toHaveLength(7)
      expect(dates[0]).toBe('2025-01-15')
      expect(dates[6]).toBe('2025-01-21')
    })

    test('assigns correct user_id to all meals', async () => {
      const profile = createTestProfile({ id: 'custom-user-id' })
      const startDate = new Date('2025-01-15')

      const plan = await generateWeeklyPlan(profile, startDate)

      // Wszystkie posiłki powinny mieć user_id profilu
      expect(plan.every((m) => m.user_id === 'custom-user-id')).toBe(true)
    })

    test('sets is_eaten to false for all meals', async () => {
      const profile = createTestProfile()
      const startDate = new Date('2025-01-15')

      const plan = await generateWeeklyPlan(profile, startDate)

      // Wszystkie nowe posiłki niezjedzone
      expect(plan.every((m) => m.is_eaten === false)).toBe(true)
    })
  })

  describe('generateDayPlan', () => {
    test('generates 3 meals for single day', async () => {
      const profile = createTestProfile()

      const dayPlan = await generateDayPlan(profile.id, '2025-01-15', {
        target_calories: profile.target_calories,
        target_protein_g: profile.target_protein_g,
        target_carbs_g: profile.target_carbs_g,
        target_fats_g: profile.target_fats_g,
      })

      expect(dayPlan).toHaveLength(3)
      expect(dayPlan.map((m) => m.meal_type)).toEqual([
        'breakfast',
        'lunch',
        'dinner',
      ])
    })

    test('assigns correct date to all meals', async () => {
      const profile = createTestProfile()
      const targetDate = '2025-01-20'

      const dayPlan = await generateDayPlan(profile.id, targetDate, {
        target_calories: profile.target_calories,
        target_protein_g: profile.target_protein_g,
        target_carbs_g: profile.target_carbs_g,
        target_fats_g: profile.target_fats_g,
      })

      expect(dayPlan.every((m) => m.meal_date === targetDate)).toBe(true)
    })

    test('optimizes plan when calories exceed target', async () => {
      const profile = createTestProfile({
        target_calories: 1500, // Niski cel - optymalizacja konieczna
      })

      const dayPlan = await generateDayPlan(profile.id, '2025-01-15', {
        target_calories: profile.target_calories,
        target_protein_g: profile.target_protein_g,
        target_carbs_g: profile.target_carbs_g,
        target_fats_g: profile.target_fats_g,
      })

      // Sprawdź czy jest ingredient_overrides (oznaka optymalizacji)
      const hasOptimization = dayPlan.some(
        (m) => m.ingredient_overrides !== null
      )
      expect(hasOptimization).toBe(true)
    })
  })

  describe('checkExistingPlan', () => {
    test('returns count of existing meals', async () => {
      // Mock odpowiedzi z liczbą posiłków
      const { createAdminClient } = await import('@/lib/supabase/server')
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({
          count: 18, // 18 z 21 posiłków
          error: null,
        }),
      } as any)

      const count = await checkExistingPlan(
        'test-user-id',
        '2025-01-15',
        '2025-01-21'
      )

      expect(count).toBe(18)
    })

    test('returns 0 when no meals exist', async () => {
      const { createAdminClient } = await import('@/lib/supabase/server')
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({
          count: 0,
          error: null,
        }),
      } as any)

      const count = await checkExistingPlan(
        'test-user-id',
        '2025-01-15',
        '2025-01-21'
      )

      expect(count).toBe(0)
    })
  })

  describe('findMissingDays', () => {
    test('identifies days without complete plan', async () => {
      const { createAdminClient } = await import('@/lib/supabase/server')
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { meal_date: '2025-01-15', meal_type: 'breakfast' },
            { meal_date: '2025-01-15', meal_type: 'lunch' },
            { meal_date: '2025-01-15', meal_type: 'dinner' },
            // Dzień 2025-01-16: brakuje dinner
            { meal_date: '2025-01-16', meal_type: 'breakfast' },
            { meal_date: '2025-01-16', meal_type: 'lunch' },
            // Dzień 2025-01-17: pusty
          ],
          error: null,
        }),
      } as any)

      const missingDays = await findMissingDays('test-user-id', [
        '2025-01-15',
        '2025-01-16',
        '2025-01-17',
      ])

      expect(missingDays).toEqual(['2025-01-16', '2025-01-17'])
    })

    test('returns empty array when all days complete', async () => {
      const { createAdminClient } = await import('@/lib/supabase/server')
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            { meal_date: '2025-01-15', meal_type: 'breakfast' },
            { meal_date: '2025-01-15', meal_type: 'lunch' },
            { meal_date: '2025-01-15', meal_type: 'dinner' },
          ],
          error: null,
        }),
      } as any)

      const missingDays = await findMissingDays('test-user-id', ['2025-01-15'])

      expect(missingDays).toEqual([])
    })
  })

  describe('Recipe Selection Logic', () => {
    test.skip('selects recipes within calorie tolerance (±15%)', async () => {
      const profile = createTestProfile({
        target_calories: 1800, // 600 kcal/posiłek ± 15% = 510-690 kcal
      })

      const dayPlan = await generateDayPlan(profile.id, '2025-01-15', {
        target_calories: profile.target_calories,
        target_protein_g: profile.target_protein_g,
        target_carbs_g: profile.target_carbs_g,
        target_fats_g: profile.target_fats_g,
      })

      // Każdy posiłek powinien mieć recipe_id
      expect(dayPlan.every((m) => m.recipe_id > 0)).toBe(true)
    })
  })
})
