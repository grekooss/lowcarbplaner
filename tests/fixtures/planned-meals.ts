/**
 * Planned Meals Fixtures
 *
 * Dane testowe zaplanowanych posiłków.
 */

import type { PlannedMealDTO } from '@/types/dto.types'
import { testRecipeBreakfast, testRecipeLunch, testRecipeDinner } from './recipes'

export const testPlannedMeals: PlannedMealDTO[] = [
  // Dzień 1: 2025-01-15
  {
    id: 1,
    meal_date: '2025-01-15',
    meal_type: 'breakfast',
    is_eaten: false,
    ingredient_overrides: null,
    recipe: testRecipeBreakfast,
    created_at: '2025-01-14T00:00:00Z',
  },
  {
    id: 2,
    meal_date: '2025-01-15',
    meal_type: 'lunch',
    is_eaten: false,
    ingredient_overrides: null,
    recipe: testRecipeLunch,
    created_at: '2025-01-14T00:00:00Z',
  },
  {
    id: 3,
    meal_date: '2025-01-15',
    meal_type: 'dinner',
    is_eaten: false,
    ingredient_overrides: null,
    recipe: testRecipeDinner,
    created_at: '2025-01-14T00:00:00Z',
  },
  // Dzień 2: 2025-01-16
  {
    id: 4,
    meal_date: '2025-01-16',
    meal_type: 'breakfast',
    is_eaten: false,
    ingredient_overrides: null,
    recipe: testRecipeBreakfast,
    created_at: '2025-01-14T00:00:00Z',
  },
  {
    id: 5,
    meal_date: '2025-01-16',
    meal_type: 'lunch',
    is_eaten: false,
    ingredient_overrides: [
      {
        ingredient_id: 1,
        new_amount: 180, // Kurczak: 200g → 180g
      },
    ],
    recipe: testRecipeLunch,
    created_at: '2025-01-14T00:00:00Z',
  },
  {
    id: 6,
    meal_date: '2025-01-16',
    meal_type: 'dinner',
    is_eaten: true, // Zjedzony
    ingredient_overrides: null,
    recipe: testRecipeDinner,
    created_at: '2025-01-14T00:00:00Z',
  },
]

export const createTestPlannedMeal = (
  overrides?: Partial<PlannedMealDTO>
): PlannedMealDTO => ({
  id: 999,
  meal_date: '2025-01-15',
  meal_type: 'lunch',
  is_eaten: false,
  ingredient_overrides: null,
  recipe: testRecipeLunch,
  created_at: '2025-01-14T00:00:00Z',
  ...overrides,
})

/**
 * Generuje pełny plan 7-dniowy (21 posiłków)
 */
export const generateWeekPlan = (startDate: string): PlannedMealDTO[] => {
  const meals: PlannedMealDTO[] = []
  let id = 1

  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + day)
    const dateStr = date.toISOString().split('T')[0]!

    // Śniadanie
    meals.push({
      id: id++,
      meal_date: dateStr,
      meal_type: 'breakfast',
      is_eaten: false,
      ingredient_overrides: null,
      recipe: testRecipeBreakfast,
      created_at: '2025-01-14T00:00:00Z',
    })

    // Obiad
    meals.push({
      id: id++,
      meal_date: dateStr,
      meal_type: 'lunch',
      is_eaten: false,
      ingredient_overrides: null,
      recipe: testRecipeLunch,
      created_at: '2025-01-14T00:00:00Z',
    })

    // Kolacja
    meals.push({
      id: id++,
      meal_date: dateStr,
      meal_type: 'dinner',
      is_eaten: false,
      ingredient_overrides: null,
      recipe: testRecipeDinner,
      created_at: '2025-01-14T00:00:00Z',
    })
  }

  return meals
}
