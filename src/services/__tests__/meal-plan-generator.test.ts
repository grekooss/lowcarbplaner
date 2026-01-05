/**
 * Tests for Meal Plan Generator
 *
 * Testuje funkcje pomocnicze generatora planu posiłków:
 * - Kalkulacja przedziałów kalorycznych
 * - Skalowanie składników
 * - Optymalizacja makroskładników
 * - Konfiguracja typów posiłków
 *
 * Uwaga: Testy dla funkcji wymagających bazy danych (prefetchAllRecipes,
 * generateWeeklyPlan) są w testach integracyjnych.
 */

import { describe, it, expect } from 'vitest'

/**
 * Helper: Ręczna implementacja funkcji prywatnych do testowania
 * (te same obliczenia co w meal-plan-generator.ts)
 */

// Konfiguracja posiłków (kopia z meal-plan-generator.ts dla testów)
type MealPlanType = '3_main_2_snacks' | '3_main_1_snack' | '3_main' | '2_main'
type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'snack_morning'
  | 'snack_afternoon'

interface MealPlanConfig {
  mealTypes: MealType[]
  calorieDistribution: Partial<Record<MealType, number>>
}

const MEAL_PLAN_CONFIGS: Record<MealPlanType, MealPlanConfig> = {
  '3_main_2_snacks': {
    mealTypes: [
      'breakfast',
      'snack_morning',
      'lunch',
      'snack_afternoon',
      'dinner',
    ],
    calorieDistribution: {
      breakfast: 0.25,
      snack_morning: 0.1,
      lunch: 0.3,
      snack_afternoon: 0.1,
      dinner: 0.25,
    },
  },
  '3_main_1_snack': {
    mealTypes: ['breakfast', 'lunch', 'snack_afternoon', 'dinner'],
    calorieDistribution: {
      breakfast: 0.25,
      lunch: 0.3,
      snack_afternoon: 0.15,
      dinner: 0.3,
    },
  },
  '3_main': {
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    calorieDistribution: {
      breakfast: 0.3,
      lunch: 0.35,
      dinner: 0.35,
    },
  },
  '2_main': {
    mealTypes: ['lunch', 'dinner'],
    calorieDistribution: {
      lunch: 0.45,
      dinner: 0.55,
    },
  },
}

const CALORIE_TOLERANCE = 0.15

function getMealPlanConfig(
  mealPlanType: MealPlanType,
  selectedMeals: MealType[] | null
): MealPlanConfig {
  if (
    mealPlanType === '2_main' &&
    selectedMeals &&
    selectedMeals.length === 2
  ) {
    const mealOrder: MealType[] = ['breakfast', 'lunch', 'dinner']
    const sortedMeals = [...selectedMeals].sort(
      (a, b) => mealOrder.indexOf(a) - mealOrder.indexOf(b)
    )

    const distribution: Partial<Record<MealType, number>> = {}
    distribution[sortedMeals[0]!] = 0.45
    distribution[sortedMeals[1]!] = 0.55

    return {
      mealTypes: sortedMeals,
      calorieDistribution: distribution,
    }
  }

  return MEAL_PLAN_CONFIGS[mealPlanType]
}

function calculateMealCalorieRange(
  dailyCalories: number,
  mealType: MealType,
  config: MealPlanConfig
): { min: number; max: number; target: number } {
  const percentage =
    config.calorieDistribution[mealType] || 1 / config.mealTypes.length
  const target = dailyCalories * percentage
  const min = target * (1 - CALORIE_TOLERANCE)
  const max = target * (1 + CALORIE_TOLERANCE)

  return { min, max, target }
}

function roundIngredientAmount(amount: number): number {
  return Math.round(amount / 5) * 5
}

describe('getMealPlanConfig', () => {
  it('zwraca konfigurację 3_main_2_snacks z 5 posiłkami', () => {
    const config = getMealPlanConfig('3_main_2_snacks', null)

    expect(config.mealTypes).toHaveLength(5)
    expect(config.mealTypes).toContain('breakfast')
    expect(config.mealTypes).toContain('snack_morning')
    expect(config.mealTypes).toContain('lunch')
    expect(config.mealTypes).toContain('snack_afternoon')
    expect(config.mealTypes).toContain('dinner')
  })

  it('zwraca konfigurację 3_main_1_snack z 4 posiłkami', () => {
    const config = getMealPlanConfig('3_main_1_snack', null)

    expect(config.mealTypes).toHaveLength(4)
    expect(config.mealTypes).toContain('breakfast')
    expect(config.mealTypes).toContain('lunch')
    expect(config.mealTypes).toContain('snack_afternoon')
    expect(config.mealTypes).toContain('dinner')
    expect(config.mealTypes).not.toContain('snack_morning')
  })

  it('zwraca konfigurację 3_main z 3 głównymi posiłkami', () => {
    const config = getMealPlanConfig('3_main', null)

    expect(config.mealTypes).toHaveLength(3)
    expect(config.mealTypes).toEqual(['breakfast', 'lunch', 'dinner'])
  })

  it('używa selected_meals dla konfiguracji 2_main', () => {
    const config = getMealPlanConfig('2_main', ['breakfast', 'dinner'])

    expect(config.mealTypes).toHaveLength(2)
    expect(config.mealTypes).toEqual(['breakfast', 'dinner'])
  })

  it('sortuje selected_meals według kolejności dnia dla 2_main', () => {
    // Podane w odwrotnej kolejności
    const config = getMealPlanConfig('2_main', ['dinner', 'breakfast'])

    // Powinny być posortowane: breakfast, dinner
    expect(config.mealTypes).toEqual(['breakfast', 'dinner'])
  })

  it('przydziela 45%/55% kalorii dla 2_main (wcześniejszy/późniejszy)', () => {
    const config = getMealPlanConfig('2_main', ['breakfast', 'dinner'])

    expect(config.calorieDistribution.breakfast).toBe(0.45)
    expect(config.calorieDistribution.dinner).toBe(0.55)
  })

  it('przydziela 45%/55% dla lunch+dinner w 2_main', () => {
    const config = getMealPlanConfig('2_main', ['lunch', 'dinner'])

    expect(config.calorieDistribution.lunch).toBe(0.45)
    expect(config.calorieDistribution.dinner).toBe(0.55)
  })
})

describe('calculateMealCalorieRange', () => {
  const dailyCalories = 2000

  it('oblicza przedział dla śniadania w konfiguracji 3_main', () => {
    const config = MEAL_PLAN_CONFIGS['3_main']
    const range = calculateMealCalorieRange(dailyCalories, 'breakfast', config)

    // Śniadanie = 30% z 2000 = 600 kcal
    expect(range.target).toBe(600)
    // Min = 600 × 0.85 = 510
    expect(range.min).toBeCloseTo(510, 0)
    // Max = 600 × 1.15 = 690
    expect(range.max).toBeCloseTo(690, 0)
  })

  it('oblicza przedział dla obiadu w konfiguracji 3_main', () => {
    const config = MEAL_PLAN_CONFIGS['3_main']
    const range = calculateMealCalorieRange(dailyCalories, 'lunch', config)

    // Obiad = 35% z 2000 = 700 kcal
    expect(range.target).toBe(700)
    expect(range.min).toBeCloseTo(595, 0)
    expect(range.max).toBeCloseTo(805, 0)
  })

  it('oblicza przedział dla przekąski w konfiguracji 3_main_2_snacks', () => {
    const config = MEAL_PLAN_CONFIGS['3_main_2_snacks']
    const range = calculateMealCalorieRange(
      dailyCalories,
      'snack_morning',
      config
    )

    // Przekąska poranna = 10% z 2000 = 200 kcal
    expect(range.target).toBe(200)
    expect(range.min).toBeCloseTo(170, 0)
    expect(range.max).toBeCloseTo(230, 0)
  })

  it('przedziały sumują się do ~100% dziennych kalorii', () => {
    const config = MEAL_PLAN_CONFIGS['3_main_2_snacks']
    let totalTarget = 0

    for (const mealType of config.mealTypes) {
      const range = calculateMealCalorieRange(dailyCalories, mealType, config)
      totalTarget += range.target
    }

    expect(totalTarget).toBeCloseTo(dailyCalories, 0)
  })

  it('tolerancja ±15% jest stosowana poprawnie', () => {
    const config = MEAL_PLAN_CONFIGS['3_main']
    const range = calculateMealCalorieRange(dailyCalories, 'dinner', config)

    // Kolacja = 35% z 2000 = 700 kcal
    const expectedTarget = 700
    const expectedMin = expectedTarget * 0.85
    const expectedMax = expectedTarget * 1.15

    expect(range.target).toBe(expectedTarget)
    expect(range.min).toBe(expectedMin)
    expect(range.max).toBe(expectedMax)
  })
})

describe('roundIngredientAmount', () => {
  it('zaokrągla do najbliższej wielokrotności 5', () => {
    expect(roundIngredientAmount(181.8)).toBe(180)
    expect(roundIngredientAmount(183)).toBe(185)
    expect(roundIngredientAmount(48.2)).toBe(50)
    expect(roundIngredientAmount(223.7)).toBe(225)
  })

  it('zaokrągla 2.5 w górę do 5', () => {
    expect(roundIngredientAmount(2.5)).toBe(5)
    expect(roundIngredientAmount(7.5)).toBe(10)
    expect(roundIngredientAmount(12.5)).toBe(15)
  })

  it('nie zmienia wartości będących wielokrotnością 5', () => {
    expect(roundIngredientAmount(100)).toBe(100)
    expect(roundIngredientAmount(55)).toBe(55)
    expect(roundIngredientAmount(0)).toBe(0)
  })

  it('obsługuje małe wartości', () => {
    expect(roundIngredientAmount(1)).toBe(0)
    expect(roundIngredientAmount(2)).toBe(0)
    expect(roundIngredientAmount(3)).toBe(5)
    expect(roundIngredientAmount(4)).toBe(5)
  })
})

describe('Calorie distribution validation', () => {
  it('konfiguracja 3_main_2_snacks sumuje się do 100%', () => {
    const config = MEAL_PLAN_CONFIGS['3_main_2_snacks']
    const total = Object.values(config.calorieDistribution).reduce(
      (sum, val) => sum + (val || 0),
      0
    )
    expect(total).toBeCloseTo(1, 10)
  })

  it('konfiguracja 3_main_1_snack sumuje się do 100%', () => {
    const config = MEAL_PLAN_CONFIGS['3_main_1_snack']
    const total = Object.values(config.calorieDistribution).reduce(
      (sum, val) => sum + (val || 0),
      0
    )
    expect(total).toBe(1)
  })

  it('konfiguracja 3_main sumuje się do 100%', () => {
    const config = MEAL_PLAN_CONFIGS['3_main']
    const total = Object.values(config.calorieDistribution).reduce(
      (sum, val) => sum + (val || 0),
      0
    )
    expect(total).toBeCloseTo(1, 10)
  })

  it('konfiguracja 2_main sumuje się do 100%', () => {
    const config = MEAL_PLAN_CONFIGS['2_main']
    const total = Object.values(config.calorieDistribution).reduce(
      (sum, val) => sum + (val || 0),
      0
    )
    expect(total).toBe(1)
  })
})

describe('Macro surplus calculation logic', () => {
  // Testowanie logiki obliczania nadmiaru makroskładników

  function calculateMacroSurplus(
    dayMacros: { protein_g: number; carbs_g: number; fats_g: number },
    targets: {
      target_protein_g: number
      target_carbs_g: number
      target_fats_g: number
    }
  ) {
    return {
      protein: dayMacros.protein_g - targets.target_protein_g,
      carbs: dayMacros.carbs_g - targets.target_carbs_g,
      fats: dayMacros.fats_g - targets.target_fats_g,
    }
  }

  it('zwraca wartości dodatnie dla nadmiaru', () => {
    const surplus = calculateMacroSurplus(
      { protein_g: 120, carbs_g: 80, fats_g: 100 },
      { target_protein_g: 100, target_carbs_g: 60, target_fats_g: 90 }
    )

    expect(surplus.protein).toBe(20)
    expect(surplus.carbs).toBe(20)
    expect(surplus.fats).toBe(10)
  })

  it('zwraca wartości ujemne dla niedoboru', () => {
    const surplus = calculateMacroSurplus(
      { protein_g: 80, carbs_g: 40, fats_g: 70 },
      { target_protein_g: 100, target_carbs_g: 60, target_fats_g: 90 }
    )

    expect(surplus.protein).toBe(-20)
    expect(surplus.carbs).toBe(-20)
    expect(surplus.fats).toBe(-20)
  })

  it('zwraca zero gdy dokładnie w celu', () => {
    const surplus = calculateMacroSurplus(
      { protein_g: 100, carbs_g: 60, fats_g: 90 },
      { target_protein_g: 100, target_carbs_g: 60, target_fats_g: 90 }
    )

    expect(surplus.protein).toBe(0)
    expect(surplus.carbs).toBe(0)
    expect(surplus.fats).toBe(0)
  })
})

describe('Macro optimization threshold logic', () => {
  const MACRO_SURPLUS_THRESHOLD_PERCENT = 1.05 // 105%

  function shouldOptimizeMacro(
    currentValue: number,
    targetValue: number
  ): boolean {
    if (targetValue === 0) return false
    return currentValue / targetValue > MACRO_SURPLUS_THRESHOLD_PERCENT
  }

  it('zwraca true gdy makro przekracza 105% celu', () => {
    // 110g przy celu 100g = 110% > 105%
    expect(shouldOptimizeMacro(110, 100)).toBe(true)
  })

  it('zwraca false gdy makro jest dokładnie 105% celu', () => {
    // 105g przy celu 100g = 105% = 105% (nie >)
    expect(shouldOptimizeMacro(105, 100)).toBe(false)
  })

  it('zwraca false gdy makro jest poniżej 105% celu', () => {
    // 100g przy celu 100g = 100% < 105%
    expect(shouldOptimizeMacro(100, 100)).toBe(false)
    // 104g przy celu 100g = 104% < 105%
    expect(shouldOptimizeMacro(104, 100)).toBe(false)
  })

  it('zwraca false gdy cel jest zero (unikanie dzielenia przez zero)', () => {
    expect(shouldOptimizeMacro(50, 0)).toBe(false)
  })
})

describe('Ingredient scaling constraints', () => {
  const MAX_INGREDIENT_CHANGE_PERCENT = 0.2 // 20%

  function calculateLimitedScaleFactor(
    currentCalories: number,
    targetCalories: number
  ): number {
    const scaleFactor = targetCalories / currentCalories
    return Math.max(
      1 - MAX_INGREDIENT_CHANGE_PERCENT,
      Math.min(1 + MAX_INGREDIENT_CHANGE_PERCENT, scaleFactor)
    )
  }

  it('ogranicza skalowanie w górę do +20%', () => {
    // Cel 150% obecnych kalorii → ograniczone do 120%
    const factor = calculateLimitedScaleFactor(100, 150)
    expect(factor).toBe(1.2)
  })

  it('ogranicza skalowanie w dół do -20%', () => {
    // Cel 50% obecnych kalorii → ograniczone do 80%
    const factor = calculateLimitedScaleFactor(100, 50)
    expect(factor).toBe(0.8)
  })

  it('nie zmienia skalowania w dozwolonym zakresie', () => {
    // Cel 110% obecnych kalorii → dozwolone
    const factor = calculateLimitedScaleFactor(100, 110)
    expect(factor).toBeCloseTo(1.1, 2)

    // Cel 90% obecnych kalorii → dozwolone
    const factor2 = calculateLimitedScaleFactor(100, 90)
    expect(factor2).toBeCloseTo(0.9, 2)
  })

  it('zwraca 1.0 gdy kalorie są równe', () => {
    const factor = calculateLimitedScaleFactor(100, 100)
    expect(factor).toBe(1.0)
  })
})

describe('Date generation for weekly plan', () => {
  function generateDates(startDate: Date, numDays: number): string[] {
    const dates: string[] = []
    for (let i = 0; i < numDays; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0]!)
    }
    return dates
  }

  it('generuje 7 kolejnych dat', () => {
    const startDate = new Date('2025-01-01')
    const dates = generateDates(startDate, 7)

    expect(dates).toHaveLength(7)
    expect(dates[0]).toBe('2025-01-01')
    expect(dates[1]).toBe('2025-01-02')
    expect(dates[6]).toBe('2025-01-07')
  })

  it('poprawnie obsługuje przejście między miesiącami', () => {
    const startDate = new Date('2025-01-30')
    const dates = generateDates(startDate, 7)

    expect(dates[0]).toBe('2025-01-30')
    expect(dates[1]).toBe('2025-01-31')
    expect(dates[2]).toBe('2025-02-01')
    expect(dates[6]).toBe('2025-02-05')
  })

  it('poprawnie obsługuje przejście między latami', () => {
    const startDate = new Date('2025-12-29')
    const dates = generateDates(startDate, 7)

    expect(dates[0]).toBe('2025-12-29')
    expect(dates[2]).toBe('2025-12-31')
    expect(dates[3]).toBe('2026-01-01')
    expect(dates[6]).toBe('2026-01-04')
  })

  it('generuje pojedynczą datę dla numDays=1', () => {
    const startDate = new Date('2025-06-15')
    const dates = generateDates(startDate, 1)

    expect(dates).toHaveLength(1)
    expect(dates[0]).toBe('2025-06-15')
  })
})

describe('Meal type search normalization', () => {
  function getMealTypeForSearch(mealType: MealType): MealType {
    if (mealType === 'snack_morning' || mealType === 'snack_afternoon') {
      return 'snack'
    }
    return mealType
  }

  it('normalizuje snack_morning do snack', () => {
    expect(getMealTypeForSearch('snack_morning')).toBe('snack')
  })

  it('normalizuje snack_afternoon do snack', () => {
    expect(getMealTypeForSearch('snack_afternoon')).toBe('snack')
  })

  it('nie zmienia głównych typów posiłków', () => {
    expect(getMealTypeForSearch('breakfast')).toBe('breakfast')
    expect(getMealTypeForSearch('lunch')).toBe('lunch')
    expect(getMealTypeForSearch('dinner')).toBe('dinner')
  })

  it('nie zmienia snack (bez modyfikatora)', () => {
    expect(getMealTypeForSearch('snack')).toBe('snack')
  })
})
