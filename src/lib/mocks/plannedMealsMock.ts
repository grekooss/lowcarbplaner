/**
 * Mock data helpers for planned meals.
 *
 * Provides deterministic fallback meals when authentication is disabled
 * (local development without Supabase session).
 */

import type { PlannedMealDTO } from '@/types/dto.types'

type MealTemplate = {
  recipe: PlannedMealDTO['recipe']
  meal_type: PlannedMealDTO['meal_type']
  is_eaten: boolean
}

const MOCK_MEALS_TEMPLATES: MealTemplate[] = [
  {
    meal_type: 'breakfast',
    is_eaten: true,
    recipe: {
      id: 10_001,
      name: 'Omlet ze szpinakiem i serem feta',
      instructions: {
        steps: [
          { step: 1, description: 'Roztrzep jajka z mlekiem i przyprawami.' },
          {
            step: 2,
            description: 'Smaz na masle klarowanym dodajac szpinak.',
          },
          { step: 3, description: 'Posyp feta i zawin omlet przed podaniem.' },
        ],
      },
      meal_types: ['breakfast'],
      tags: ['wysokobialkowe', 'low_carb'],
      image_url: null,
      difficulty_level: 'easy',
      average_rating: 4.8,
      reviews_count: 24,
      health_score: 85,
      total_calories: 430,
      total_protein_g: 32,
      total_carbs_g: 9,
      total_fats_g: 30,
      ingredients: [
        {
          id: 20_001,
          name: 'Jajka',
          amount: 3,
          unit: 'szt',
          calories: 210,
          protein_g: 18,
          carbs_g: 1,
          fats_g: 15,
          category: 'eggs',
          is_scalable: true,
        },
        {
          id: 20_002,
          name: 'Szpinak swiezy',
          amount: 60,
          unit: 'g',
          calories: 14,
          protein_g: 2,
          carbs_g: 2,
          fats_g: 0,
          category: 'vegetables',
          is_scalable: true,
        },
        {
          id: 20_003,
          name: 'Ser feta',
          amount: 30,
          unit: 'g',
          calories: 81,
          protein_g: 4,
          carbs_g: 1,
          fats_g: 7,
          category: 'dairy',
          is_scalable: true,
        },
      ],
    },
  },
  {
    meal_type: 'lunch',
    is_eaten: false,
    recipe: {
      id: 10_101,
      name: 'Losos pieczony z warzywami',
      instructions: {
        steps: [
          { step: 1, description: 'Rozgrzej piekarnik do 200C.' },
          {
            step: 2,
            description:
              'Uloz lososia na blasze, skrop oliwa i dopraw sola oraz pieprzem.',
          },
          {
            step: 3,
            description:
              'Dodaj warzywa, piecz przez 15 minut i podawaj z cytryna.',
          },
        ],
      },
      meal_types: ['lunch'],
      tags: ['omega_3', 'low_carb'],
      image_url: null,
      difficulty_level: 'medium',
      average_rating: 4.6,
      reviews_count: 37,
      health_score: 92,
      total_calories: 520,
      total_protein_g: 38,
      total_carbs_g: 14,
      total_fats_g: 34,
      ingredients: [
        {
          id: 20_101,
          name: 'Filet z lososia',
          amount: 150,
          unit: 'g',
          calories: 300,
          protein_g: 32,
          carbs_g: 0,
          fats_g: 20,
          category: 'fish',
          is_scalable: true,
        },
        {
          id: 20_102,
          name: 'Brokul',
          amount: 120,
          unit: 'g',
          calories: 41,
          protein_g: 3,
          carbs_g: 7,
          fats_g: 0,
          category: 'vegetables',
          is_scalable: true,
        },
        {
          id: 20_103,
          name: 'Oliwa z oliwek',
          amount: 10,
          unit: 'ml',
          calories: 90,
          protein_g: 0,
          carbs_g: 0,
          fats_g: 10,
          category: 'oils_fats',
          is_scalable: false,
        },
      ],
    },
  },
  {
    meal_type: 'dinner',
    is_eaten: false,
    recipe: {
      id: 10_201,
      name: 'Salatka z kurczakiem i awokado',
      instructions: {
        steps: [
          { step: 1, description: 'Usmaz piers z kurczaka na zloty kolor.' },
          {
            step: 2,
            description: 'Pokroj warzywa i awokado, przygotuj salate.',
          },
          {
            step: 3,
            description:
              'Polacz skladniki i skrop dressingiem z oliwy i cytryny.',
          },
        ],
      },
      meal_types: ['dinner'],
      tags: ['wysokobialkowe', 'bez_glutenu'],
      image_url: null,
      difficulty_level: 'easy',
      average_rating: 4.4,
      reviews_count: 19,
      health_score: 88,
      total_calories: 460,
      total_protein_g: 36,
      total_carbs_g: 12,
      total_fats_g: 28,
      ingredients: [
        {
          id: 20_201,
          name: 'Piers z kurczaka',
          amount: 130,
          unit: 'g',
          calories: 215,
          protein_g: 35,
          carbs_g: 0,
          fats_g: 5,
          category: 'meat',
          is_scalable: true,
        },
        {
          id: 20_202,
          name: 'Awokado',
          amount: 70,
          unit: 'g',
          calories: 112,
          protein_g: 1,
          carbs_g: 6,
          fats_g: 10,
          category: 'fruits',
          is_scalable: true,
        },
        {
          id: 20_203,
          name: 'Salata rzymska',
          amount: 60,
          unit: 'g',
          calories: 10,
          protein_g: 1,
          carbs_g: 2,
          fats_g: 0,
          category: 'vegetables',
          is_scalable: true,
        },
      ],
    },
  },
]

function buildDateRange(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate) {
    return []
  }

  const from = new Date(startDate)
  const to = new Date(endDate)

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return []
  }

  const range: string[] = []
  const cursor = new Date(from)

  while (cursor <= to) {
    range.push(cursor.toISOString().split('T')[0] ?? '')
    cursor.setDate(cursor.getDate() + 1)
  }

  return range
}

/**
 * Generates deterministic planned meals for the provided date range.
 */
export function getMockPlannedMeals(
  startDate: string,
  endDate: string
): PlannedMealDTO[] {
  const dates = buildDateRange(startDate, endDate)

  if (dates.length === 0) {
    return []
  }

  return dates.flatMap((date, dateIndex) =>
    MOCK_MEALS_TEMPLATES.map((template, templateIndex) => {
      const idSeed = parseInt(
        `${date.replace(/-/g, '')}${templateIndex + 1}`,
        10
      )

      return {
        id: Number.isNaN(idSeed) ? dateIndex * 10 + templateIndex + 1 : idSeed,
        meal_date: date,
        meal_type: template.meal_type,
        is_eaten: template.is_eaten && templateIndex === 0,
        ingredient_overrides: null,
        created_at: new Date(`${date}T07:30:00.000Z`).toISOString(),
        recipe: {
          ...template.recipe,
          id: template.recipe.id + dateIndex,
        },
      } satisfies PlannedMealDTO
    })
  )
}
