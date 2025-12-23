/**
 * Recipe Fixtures
 *
 * Dane testowe przepisów dla testów integracyjnych.
 */

import type { RecipeDTO, IngredientDTO } from '@/types/dto.types'

export const testIngredients: IngredientDTO[] = [
  {
    id: 1,
    name: 'Kurczak (pierś)',
    amount: 200,
    unit: 'g',
    calories: 330,
    protein_g: 62,
    carbs_g: 0,
    fats_g: 7,
    category: 'meat',
    is_scalable: true,
  },
  {
    id: 2,
    name: 'Brokuły',
    amount: 150,
    unit: 'g',
    calories: 51,
    protein_g: 4,
    carbs_g: 10,
    fats_g: 1,
    category: 'vegetables',
    is_scalable: true,
  },
  {
    id: 3,
    name: 'Oliwa z oliwek',
    amount: 15,
    unit: 'ml',
    calories: 119,
    protein_g: 0,
    carbs_g: 0,
    fats_g: 14,
    category: 'oils_fats',
    is_scalable: true,
  },
  {
    id: 4,
    name: 'Sól',
    amount: 2,
    unit: 'g',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fats_g: 0,
    category: 'spices_herbs',
    is_scalable: false, // Przyprawy nie są skalowalne
  },
]

export const testRecipeBreakfast: RecipeDTO = {
  id: 101,
  name: 'Omlet z warzywami',
  instructions: [
    { step: 1, description: 'Rozbij jajka do miski i ubij' },
    { step: 2, description: 'Dodaj pokrojone warzywa' },
    { step: 3, description: 'Smaż na patelni przez 5 minut' },
  ],
  meal_types: ['breakfast'],
  tags: ['low-carb', 'high-protein', 'quick'],
  image_url: 'https://example.com/omlet.jpg',
  difficulty_level: 'easy',
  average_rating: 4.5,
  reviews_count: 120,
  prep_time_minutes: 5,
  cook_time_minutes: 5,
  total_calories: 500,
  total_protein_g: 40,
  total_carbs_g: 10,
  total_fats_g: 35,
  ingredients: testIngredients.slice(0, 3),
  equipment: [],
}

export const testRecipeLunch: RecipeDTO = {
  id: 102,
  name: 'Grillowany kurczak z brokułami',
  instructions: [
    { step: 1, description: 'Przypraw kurczaka' },
    { step: 2, description: 'Grilluj kurczaka przez 20 minut' },
    { step: 3, description: 'Ugotuj brokuły na parze' },
    { step: 4, description: 'Polej oliwą' },
  ],
  meal_types: ['lunch', 'dinner'],
  tags: ['low-carb', 'high-protein', 'healthy'],
  image_url: 'https://example.com/chicken.jpg',
  difficulty_level: 'easy',
  average_rating: 4.8,
  reviews_count: 250,
  prep_time_minutes: 10,
  cook_time_minutes: 25,
  total_calories: 600,
  total_protein_g: 66,
  total_carbs_g: 10,
  total_fats_g: 22,
  ingredients: testIngredients,
  equipment: [],
}

export const testRecipeDinner: RecipeDTO = {
  id: 103,
  name: 'Stek z wołowiny z sałatką',
  instructions: [
    { step: 1, description: 'Przypraw stek' },
    { step: 2, description: 'Smaż na patelni przez 6 minut z każdej strony' },
    { step: 3, description: 'Przygotuj sałatkę' },
    { step: 4, description: 'Podaj razem' },
  ],
  meal_types: ['lunch', 'dinner'],
  tags: ['low-carb', 'high-protein', 'keto'],
  image_url: 'https://example.com/steak.jpg',
  difficulty_level: 'medium',
  average_rating: 4.9,
  reviews_count: 180,
  prep_time_minutes: 10,
  cook_time_minutes: 15,
  total_calories: 700,
  total_protein_g: 70,
  total_carbs_g: 8,
  total_fats_g: 40,
  ingredients: [],
  equipment: [],
}

export const testRecipes: RecipeDTO[] = [
  testRecipeBreakfast,
  testRecipeLunch,
  testRecipeDinner,
]

export const createTestRecipe = (
  overrides?: Partial<RecipeDTO>
): RecipeDTO => ({
  ...testRecipeLunch,
  ...overrides,
})

/**
 * Helper function to create recipe with specific calorie target
 * Automatically adjusts protein, carbs, and fats based on low-carb ratios
 */
export const createRecipeWithCalories = (
  mealType: 'breakfast' | 'lunch' | 'dinner',
  targetCalories: number,
  name?: string
): RecipeDTO => {
  // Low-carb makro split: 15% carbs, 35% protein, 50% fats
  const protein_g = Math.round((targetCalories * 0.35) / 4) // 4 kcal/g
  const carbs_g = Math.round((targetCalories * 0.15) / 4) // 4 kcal/g
  const fats_g = Math.round((targetCalories * 0.5) / 9) // 9 kcal/g

  const recipeId = 200 + Math.floor(targetCalories / 10)

  return {
    id: recipeId,
    name: name || `${mealType} ${targetCalories}kcal`,
    instructions: [
      { step: 1, description: 'Przygotuj składniki' },
      { step: 2, description: 'Gotuj zgodnie z przepisem' },
      { step: 3, description: 'Podaj' },
    ],
    meal_types: [mealType],
    tags: ['low-carb', 'high-protein'],
    image_url: `https://example.com/${mealType}-${targetCalories}.jpg`,
    difficulty_level: 'easy',
    average_rating: 4.5,
    reviews_count: 50,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    total_calories: targetCalories,
    total_protein_g: protein_g,
    total_carbs_g: carbs_g,
    total_fats_g: fats_g,
    ingredients: testIngredients.slice(0, 2),
    equipment: [],
  }
}

// Breakfast recipes covering 300-700 kcal range
export const breakfastRecipes: RecipeDTO[] = [
  createRecipeWithCalories('breakfast', 350, 'Jajecznica z awokado'),
  createRecipeWithCalories('breakfast', 450, 'Omlet z serem i szpinakiem'),
  createRecipeWithCalories('breakfast', 550, 'Śniadanie proteinowe z jajkami'),
  createRecipeWithCalories('breakfast', 650, 'Scrambled eggs z łososiem'),
]

// Lunch recipes covering 400-800 kcal range
export const lunchRecipes: RecipeDTO[] = [
  createRecipeWithCalories('lunch', 450, 'Sałatka z kurczakiem'),
  createRecipeWithCalories('lunch', 550, 'Zupa krem z brokułów'),
  createRecipeWithCalories('lunch', 650, 'Grillowany kurczak z warzywami'),
  createRecipeWithCalories('lunch', 750, 'Lunch bowl z indykiem'),
]

// Dinner recipes covering 400-900 kcal range
export const dinnerRecipes: RecipeDTO[] = [
  createRecipeWithCalories('dinner', 450, 'Ryba z warzywami'),
  createRecipeWithCalories('dinner', 550, 'Kotlety drobiowe z sałatką'),
  createRecipeWithCalories('dinner', 650, 'Stek z wołowiny z brokułami'),
  createRecipeWithCalories('dinner', 750, 'Pieczona pierś z kurczaka'),
  createRecipeWithCalories('dinner', 850, 'Kolacja proteinowa z łososiem'),
]

// All recipes combined
export const allTestRecipes: RecipeDTO[] = [
  testRecipeBreakfast,
  testRecipeLunch,
  testRecipeDinner,
  ...breakfastRecipes,
  ...lunchRecipes,
  ...dinnerRecipes,
]
