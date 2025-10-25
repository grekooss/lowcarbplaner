/**
 * Server Actions for Planned Meals API
 *
 * Implementuje logikę biznesową dla operacji na zaplanowanych posiłkach:
 * - GET /planned-meals (zakres dat + filtrowanie)
 * - PATCH /planned-meals/{id} (oznaczenie, wymiana, modyfikacja)
 * - GET /planned-meals/{id}/replacements (sugerowane zamienniki)
 *
 * @see .ai/10b01 api-planned-meals-implementation-plan.md
 */

'use server'

import { createServerClient } from '@/lib/supabase/server'
import type {
  PlannedMealDTO,
  IngredientOverrides,
  ReplacementRecipeDTO,
  RecipeDTO,
  IngredientDTO,
  RecipeInstructions,
} from '@/types/dto.types'
import {
  getPlannedMealsQuerySchema,
  updatePlannedMealBodySchema,
  mealIdSchema,
  type GetPlannedMealsQueryInput,
  type UpdatePlannedMealBodyInput,
} from '@/lib/validation/planned-meals'

/**
 * Standardowy typ wyniku Server Action (Discriminated Union)
 */
type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string }

/**
 * Transformuje raw recipe row z Supabase do RecipeDTO
 *
 * @param recipe - Raw row z tabeli recipes + joins
 * @returns RecipeDTO - Typowany obiekt zgodny z DTO
 */
function transformRecipeToDTO(recipe: {
  id: number
  name: string
  instructions: unknown
  meal_types: unknown
  tags: string[] | null
  image_url: string | null
  difficulty_level: unknown
  average_rating?: number | null
  reviews_count?: number
  health_score?: number | null
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
  recipe_ingredients?: {
    base_amount: number
    unit: string
    is_scalable: boolean
    calories: number | null
    protein_g: number | null
    carbs_g: number | null
    fats_g: number | null
    ingredient: {
      id: number
      name: string
      category: unknown
    }
  }[]
}): RecipeDTO {
  // Agregacja składników z recipe_ingredients + ingredients
  const ingredients: IngredientDTO[] = (recipe.recipe_ingredients || []).map(
    (ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      amount: ri.base_amount,
      unit: ri.unit,
      calories: ri.calories || 0,
      protein_g: ri.protein_g || 0,
      carbs_g: ri.carbs_g || 0,
      fats_g: ri.fats_g || 0,
      category: ri.ingredient.category as IngredientDTO['category'],
      is_scalable: ri.is_scalable,
    })
  )

  return {
    id: recipe.id,
    name: recipe.name,
    instructions: recipe.instructions as RecipeInstructions,
    meal_types: recipe.meal_types as RecipeDTO['meal_types'],
    tags: recipe.tags,
    image_url: recipe.image_url,
    difficulty_level: recipe.difficulty_level as RecipeDTO['difficulty_level'],
    average_rating: recipe.average_rating ?? null,
    reviews_count: recipe.reviews_count ?? 0,
    health_score: recipe.health_score ?? null,
    total_calories: recipe.total_calories,
    total_protein_g: recipe.total_protein_g,
    total_carbs_g: recipe.total_carbs_g,
    total_fats_g: recipe.total_fats_g,
    ingredients,
  }
}

/**
 * Transformuje raw planned meal row z Supabase do PlannedMealDTO
 *
 * @param meal - Raw row z tabeli planned_meals + joins
 * @returns PlannedMealDTO - Typowany obiekt zgodny z DTO
 */
function transformPlannedMealToDTO(meal: {
  id: number
  meal_date: string
  meal_type: unknown
  is_eaten: boolean
  ingredient_overrides: unknown
  created_at: string
  recipe: {
    id: number
    name: string
    instructions: unknown
    meal_types: unknown
    tags: string[] | null
    image_url: string | null
    difficulty_level: unknown
    total_calories: number | null
    total_protein_g: number | null
    total_carbs_g: number | null
    total_fats_g: number | null
    recipe_ingredients?: {
      base_amount: number
      unit: string
      is_scalable: boolean
      calories: number | null
      protein_g: number | null
      carbs_g: number | null
      fats_g: number | null
      ingredient: {
        id: number
        name: string
        category: unknown
      }
    }[]
  }
}): PlannedMealDTO {
  return {
    id: meal.id,
    meal_date: meal.meal_date,
    meal_type: meal.meal_type as PlannedMealDTO['meal_type'],
    is_eaten: meal.is_eaten,
    ingredient_overrides:
      meal.ingredient_overrides as IngredientOverrides | null,
    recipe: transformRecipeToDTO(meal.recipe),
    created_at: meal.created_at,
  }
}

/**
 * GET /planned-meals - Pobiera listę zaplanowanych posiłków w zakresie dat
 *
 * @param params - Parametry zapytania (start_date, end_date)
 * @returns Lista zaplanowanych posiłków z pełnymi szczegółami
 *
 * @example
 * ```typescript
 * const result = await getPlannedMeals({ start_date: '2024-01-01', end_date: '2024-01-07' })
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data) // PlannedMealDTO[]
 * }
 * ```
 */
export async function getPlannedMeals(
  params: GetPlannedMealsQueryInput
): Promise<ActionResult<PlannedMealDTO[]>> {
  try {
    // 1. Walidacja parametrów wejściowych
    const validated = getPlannedMealsQuerySchema.safeParse(params)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe parametry zapytania: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
      }
    }

    const { start_date, end_date } = validated.data

    // 2. Utworzenie Supabase client
    const supabase = await createServerClient()

    // 3. Weryfikacja autentykacji
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Uwierzytelnienie wymagane' }
    }

    // 4. Budowanie zapytania z pełnymi relacjami
    const { data, error } = await supabase
      .from('planned_meals')
      .select(
        `
        id,
        meal_date,
        meal_type,
        is_eaten,
        ingredient_overrides,
        created_at,
        recipe:recipes (
          id,
          name,
          instructions,
          meal_types,
          tags,
          image_url,
          difficulty_level,
          total_calories,
          total_protein_g,
          total_carbs_g,
          total_fats_g,
          recipe_ingredients (
            base_amount,
            unit,
            is_scalable,
            calories,
            protein_g,
            carbs_g,
            fats_g,
            ingredient:ingredients (
              id,
              name,
              category
            )
          )
        )
      `
      )
      .eq('user_id', user.id)
      .gte('meal_date', start_date)
      .lte('meal_date', end_date)
      .order('meal_date', { ascending: true })
      .order('meal_type', { ascending: true })

    if (error) {
      console.error('Błąd Supabase w getPlannedMeals:', error)
      return { error: `Błąd bazy danych: ${error.message}` }
    }

    // 5. Transformacja do DTO (filtrujemy posiłki bez przepisu)
    const meals = (data || [])
      .filter((meal) => meal.recipe !== null)
      .map((meal) =>
        transformPlannedMealToDTO(
          meal as typeof meal & { recipe: NonNullable<typeof meal.recipe> }
        )
      )

    return { data: meals }
  } catch (err) {
    console.error('Nieoczekiwany błąd w getPlannedMeals:', err)
    return { error: 'Wewnętrzny błąd serwera' }
  }
}

/**
 * PATCH /planned-meals/{id} - Aktualizuje pojedynczy zaplanowany posiłek
 *
 * @param mealId - ID zaplanowanego posiłku
 * @param updateData - Dane aktualizacji (discriminated union)
 * @returns Zaktualizowany zaplanowany posiłek
 *
 * @example
 * ```typescript
 * // Oznaczenie jako zjedzony
 * const result = await updatePlannedMeal(123, { action: 'mark_eaten', is_eaten: true })
 *
 * // Wymiana przepisu
 * const result = await updatePlannedMeal(123, { action: 'swap_recipe', recipe_id: 105 })
 *
 * // Modyfikacja składników
 * const result = await updatePlannedMeal(123, {
 *   action: 'modify_ingredients',
 *   ingredient_overrides: [{ ingredient_id: 12, new_amount: 150 }]
 * })
 * ```
 */
export async function updatePlannedMeal(
  mealId: number,
  updateData: UpdatePlannedMealBodyInput
): Promise<ActionResult<PlannedMealDTO>> {
  try {
    // 1. Walidacja ID
    const validatedId = mealIdSchema.safeParse(mealId)
    if (!validatedId.success) {
      return { error: `Nieprawidłowe ID posiłku: ${validatedId.error.message}` }
    }

    // 2. Walidacja danych wejściowych
    const validated = updatePlannedMealBodySchema.safeParse(updateData)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe dane aktualizacji: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
      }
    }

    // 3. Utworzenie Supabase client
    const supabase = await createServerClient()

    // 4. Pobranie user_id z sesji
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Uwierzytelnienie wymagane' }
    }

    // 5. Wykonanie odpowiedniej akcji na podstawie typu
    const data = validated.data

    if (data.action === 'mark_eaten') {
      return await markMealAsEaten(
        supabase,
        user.id,
        validatedId.data,
        data.is_eaten
      )
    } else if (data.action === 'swap_recipe') {
      return await swapMealRecipe(
        supabase,
        user.id,
        validatedId.data,
        data.recipe_id
      )
    } else if (data.action === 'modify_ingredients') {
      return await modifyMealIngredients(
        supabase,
        user.id,
        validatedId.data,
        data.ingredient_overrides
      )
    }

    return { error: 'Nieznana akcja' }
  } catch (err) {
    console.error('Nieoczekiwany błąd w updatePlannedMeal:', err)
    return { error: 'Wewnętrzny błąd serwera' }
  }
}

/**
 * Oznacza posiłek jako zjedzony/niezjedzony
 */
async function markMealAsEaten(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  mealId: number,
  isEaten: boolean
): Promise<ActionResult<PlannedMealDTO>> {
  // 1. Sprawdzenie własności (RLS + dodatkowa weryfikacja)
  const { data: existing, error: fetchError } = await supabase
    .from('planned_meals')
    .select('user_id')
    .eq('id', mealId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return { error: 'Posiłek nie został znaleziony' }
    }
    return { error: `Błąd bazy danych: ${fetchError.message}` }
  }

  if (!existing) {
    return { error: 'Posiłek nie został znaleziony' }
  }

  if (existing.user_id !== userId) {
    return { error: 'Nie masz uprawnień do modyfikacji tego posiłku' }
  }

  // 2. Update
  const { data, error } = await supabase
    .from('planned_meals')
    .update({ is_eaten: isEaten })
    .eq('id', mealId)
    .select(
      `
      id,
      meal_date,
      meal_type,
      is_eaten,
      ingredient_overrides,
      created_at,
      recipe:recipes (
        id,
        name,
        instructions,
        meal_types,
        tags,
        image_url,
        difficulty_level,
        total_calories,
        total_protein_g,
        total_carbs_g,
        total_fats_g,
        recipe_ingredients (
          base_amount,
          unit,
          is_scalable,
          calories,
          protein_g,
          carbs_g,
          fats_g,
          ingredient:ingredients (
            id,
            name,
            category
          )
        )
      )
    `
    )
    .single()

  if (error) {
    return { error: `Błąd bazy danych: ${error.message}` }
  }

  if (!data.recipe) {
    return { error: 'Przepis nie został znaleziony dla tego posiłku' }
  }

  return {
    data: transformPlannedMealToDTO(
      data as typeof data & { recipe: NonNullable<typeof data.recipe> }
    ),
  }
}

/**
 * Wymienia przepis w posiłku
 */
async function swapMealRecipe(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  mealId: number,
  newRecipeId: number
): Promise<ActionResult<PlannedMealDTO>> {
  // 1. Pobranie oryginalnego posiłku
  const { data: originalMeal, error: fetchError } = await supabase
    .from('planned_meals')
    .select(
      `
      user_id,
      meal_type,
      recipe:recipes (
        id,
        total_calories
      )
    `
    )
    .eq('id', mealId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return { error: 'Posiłek nie został znaleziony' }
    }
    return { error: `Błąd bazy danych: ${fetchError.message}` }
  }

  if (!originalMeal) {
    return { error: 'Posiłek nie został znaleziony' }
  }

  if (originalMeal.user_id !== userId) {
    return { error: 'Nie masz uprawnień do modyfikacji tego posiłku' }
  }

  // 2. Pobranie nowego przepisu
  const { data: newRecipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id, meal_types, total_calories')
    .eq('id', newRecipeId)
    .single()

  if (recipeError || !newRecipe) {
    return { error: 'Przepis nie został znaleziony' }
  }

  // 3. Sprawdzenie czy recipe istnieje
  if (!originalMeal.recipe) {
    return { error: 'Oryginalny przepis nie został znaleziony' }
  }

  // 4. Walidacja meal_type
  if (!newRecipe.meal_types.includes(originalMeal.meal_type)) {
    return {
      error: `Przepis nie pasuje do typu posiłku. Wymagany: ${originalMeal.meal_type}, dostępne: ${newRecipe.meal_types.join(', ')}`,
    }
  }

  // 5. Walidacja różnicy kalorycznej (±15%)
  const originalCalories = originalMeal.recipe.total_calories || 0
  const newCalories = newRecipe.total_calories || 0
  const diffPercent =
    Math.abs((newCalories - originalCalories) / originalCalories) * 100

  if (diffPercent > 15) {
    return {
      error: `Różnica kaloryczna (${diffPercent.toFixed(1)}%) przekracza dozwolone ±15%. Oryginał: ${originalCalories} kcal, nowy: ${newCalories} kcal`,
    }
  }

  // 6. Update
  const { data, error } = await supabase
    .from('planned_meals')
    .update({
      recipe_id: newRecipeId,
      ingredient_overrides: null, // Reset nadpisań
    })
    .eq('id', mealId)
    .select(
      `
      id,
      meal_date,
      meal_type,
      is_eaten,
      ingredient_overrides,
      created_at,
      recipe:recipes (
        id,
        name,
        instructions,
        meal_types,
        tags,
        image_url,
        difficulty_level,
        total_calories,
        total_protein_g,
        total_carbs_g,
        total_fats_g,
        recipe_ingredients (
          base_amount,
          unit,
          is_scalable,
          calories,
          protein_g,
          carbs_g,
          fats_g,
          ingredient:ingredients (
            id,
            name,
            category
          )
        )
      )
    `
    )
    .single()

  if (error) {
    return { error: `Błąd bazy danych: ${error.message}` }
  }

  if (!data.recipe) {
    return { error: 'Przepis nie został znaleziony dla tego posiłku' }
  }

  return {
    data: transformPlannedMealToDTO(
      data as typeof data & { recipe: NonNullable<typeof data.recipe> }
    ),
  }
}

/**
 * Modyfikuje gramaturę składników w posiłku
 */
async function modifyMealIngredients(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  mealId: number,
  overrides: IngredientOverrides
): Promise<ActionResult<PlannedMealDTO>> {
  // 1. Pobranie posiłku z przepisem i składnikami
  const { data: meal, error: fetchError } = await supabase
    .from('planned_meals')
    .select(
      `
      user_id,
      recipe:recipes (
        id,
        recipe_ingredients (
          ingredient_id,
          base_amount,
          is_scalable
        )
      )
    `
    )
    .eq('id', mealId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return { error: 'Posiłek nie został znaleziony' }
    }
    return { error: `Błąd bazy danych: ${fetchError.message}` }
  }

  if (!meal) {
    return { error: 'Posiłek nie został znaleziony' }
  }

  if (meal.user_id !== userId) {
    return { error: 'Nie masz uprawnień do modyfikacji tego posiłku' }
  }

  if (!meal.recipe) {
    return { error: 'Przepis nie został znaleziony dla tego posiłku' }
  }

  // 2. Walidacja każdego override
  for (const override of overrides) {
    const ingredient = meal.recipe.recipe_ingredients.find(
      (ri) => ri.ingredient_id === override.ingredient_id
    )

    if (!ingredient) {
      return {
        error: `Składnik o ID ${override.ingredient_id} nie istnieje w przepisie`,
      }
    }

    if (!ingredient.is_scalable) {
      return {
        error: `Składnik o ID ${override.ingredient_id} nie może być skalowany`,
      }
    }

    // Walidacja podstawowa (ilość > 0)
    if (override.new_amount <= 0) {
      return {
        error: `Ilość składnika o ID ${override.ingredient_id} musi być większa od 0`,
      }
    }

    // Note: Backend accepts any positive value
    // Frontend shows warning at ±15% but allows changes
  }

  // 3. Update
  const { data, error } = await supabase
    .from('planned_meals')
    .update({ ingredient_overrides: JSON.parse(JSON.stringify(overrides)) })
    .eq('id', mealId)
    .select(
      `
      id,
      meal_date,
      meal_type,
      is_eaten,
      ingredient_overrides,
      created_at,
      recipe:recipes (
        id,
        name,
        instructions,
        meal_types,
        tags,
        image_url,
        difficulty_level,
        total_calories,
        total_protein_g,
        total_carbs_g,
        total_fats_g,
        recipe_ingredients (
          base_amount,
          unit,
          is_scalable,
          calories,
          protein_g,
          carbs_g,
          fats_g,
          ingredient:ingredients (
            id,
            name,
            category
          )
        )
      )
    `
    )
    .single()

  if (error) {
    return { error: `Błąd bazy danych: ${error.message}` }
  }

  if (!data.recipe) {
    return { error: 'Przepis nie został znaleziony dla tego posiłku' }
  }

  return {
    data: transformPlannedMealToDTO(
      data as typeof data & { recipe: NonNullable<typeof data.recipe> }
    ),
  }
}

/**
 * GET /planned-meals/{id}/replacements - Pobiera listę sugerowanych zamienników dla posiłku
 *
 * @param mealId - ID zaplanowanego posiłku
 * @returns Lista zamienników przepisów z różnicą kaloryczną
 *
 * @example
 * ```typescript
 * const result = await getReplacementRecipes(123)
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data) // ReplacementRecipeDTO[]
 * }
 * ```
 */
export async function getReplacementRecipes(
  mealId: number
): Promise<ActionResult<ReplacementRecipeDTO[]>> {
  try {
    // 1. Walidacja ID
    const validatedId = mealIdSchema.safeParse(mealId)
    if (!validatedId.success) {
      return { error: `Nieprawidłowe ID posiłku: ${validatedId.error.message}` }
    }

    // 2. Utworzenie Supabase client
    const supabase = await createServerClient()

    // 3. Weryfikacja autentykacji
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Uwierzytelnienie wymagane' }
    }

    // 4. Pobranie oryginalnego posiłku z pełnymi danymi
    const { data: meal, error: fetchError } = await supabase
      .from('planned_meals')
      .select(
        `
        user_id,
        meal_type,
        ingredient_overrides,
        recipe:recipes (
          id,
          total_calories,
          total_protein_g,
          total_carbs_g,
          total_fats_g,
          recipe_ingredients (
            base_amount,
            calories,
            protein_g,
            carbs_g,
            fats_g,
            ingredient:ingredients (
              id
            )
          )
        )
      `
      )
      .eq('id', validatedId.data)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return { error: 'Posiłek nie został znaleziony' }
      }
      return { error: `Błąd bazy danych: ${fetchError.message}` }
    }

    if (!meal) {
      return { error: 'Posiłek nie został znaleziony' }
    }

    if (meal.user_id !== user.id) {
      return { error: 'Nie masz uprawnień do przeglądania tego posiłku' }
    }

    if (!meal.recipe) {
      return { error: 'Przepis nie został znaleziony dla tego posiłku' }
    }

    // 5. Obliczenie aktualnych kalorii z uwzględnieniem ingredient_overrides
    let originalCalories = meal.recipe.total_calories || 0

    // Jeśli są nadpisania składników, przelicz kalorie
    const overrides = meal.ingredient_overrides as IngredientOverrides | null
    if (overrides && overrides.length > 0 && meal.recipe.recipe_ingredients) {
      originalCalories = meal.recipe.recipe_ingredients.reduce((total, ri) => {
        const override = overrides.find(
          (o) => o.ingredient_id === ri.ingredient.id
        )
        const originalAmount = ri.base_amount
        const adjustedAmount = override?.new_amount ?? originalAmount

        if (originalAmount === 0) return total

        const scale = adjustedAmount / originalAmount
        return total + (ri.calories || 0) * scale
      }, 0)

      originalCalories = Math.round(originalCalories)
    }
    const minCalories = Math.floor(originalCalories * 0.85)
    const maxCalories = Math.ceil(originalCalories * 1.15)

    const { data: replacements, error: searchError } = await supabase
      .from('recipes')
      .select(
        'id, name, image_url, meal_types, difficulty_level, total_calories, total_protein_g, total_carbs_g, total_fats_g'
      )
      .contains('meal_types', [meal.meal_type])
      .neq('id', meal.recipe.id)
      .gte('total_calories', minCalories)
      .lte('total_calories', maxCalories)
      .order('total_calories', { ascending: true })
      .limit(10)

    if (searchError) {
      return { error: `Błąd bazy danych: ${searchError.message}` }
    }

    // 6. Dodanie calorie_diff i sortowanie
    const replacementsWithDiff: ReplacementRecipeDTO[] = (
      replacements || []
    ).map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      image_url: recipe.image_url,
      meal_types: recipe.meal_types as ReplacementRecipeDTO['meal_types'],
      difficulty_level:
        recipe.difficulty_level as ReplacementRecipeDTO['difficulty_level'],
      total_calories: recipe.total_calories,
      total_protein_g: recipe.total_protein_g,
      total_carbs_g: recipe.total_carbs_g,
      total_fats_g: recipe.total_fats_g,
      calorie_diff: (recipe.total_calories || 0) - originalCalories,
    }))

    replacementsWithDiff.sort(
      (a, b) => Math.abs(a.calorie_diff) - Math.abs(b.calorie_diff)
    )

    return { data: replacementsWithDiff }
  } catch (err) {
    console.error('Nieoczekiwany błąd w getReplacementRecipes:', err)
    return { error: 'Wewnętrzny błąd serwera' }
  }
}
