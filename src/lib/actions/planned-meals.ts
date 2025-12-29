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
} from '@/types/dto.types'
import {
  getPlannedMealsQuerySchema,
  updatePlannedMealBodySchema,
  mealIdSchema,
  type GetPlannedMealsQueryInput,
  type UpdatePlannedMealBodyInput,
} from '@/lib/validation/planned-meals'
import {
  transformRecipeToDTO,
  PLANNED_MEAL_SELECT_FULL,
} from '@/lib/utils/recipe-transformer'
import { isValidMealData } from '@/lib/utils/type-guards'
import {
  recordMealEaten,
  removeMealEaten,
  type MealEatenData,
} from '@/lib/actions/user-history'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'

/**
 * Kody błędów dla akcji planned meals
 */
type PlannedMealsErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR'

/**
 * Standardowy typ wyniku Server Action (Discriminated Union)
 */
type ActionResult<T> =
  | { data: T; error?: never; code?: never }
  | { data?: never; error: string; code: PlannedMealsErrorCode }

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
      step_number: number | null
      ingredient: {
        id: number
        name: string
        category: unknown
        unit: string
        ingredient_unit_conversions?: {
          unit_name: string
          grams_equivalent: number
        }[]
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
        code: 'VALIDATION_ERROR',
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
      return { error: 'Uwierzytelnienie wymagane', code: 'UNAUTHORIZED' }
    }

    // 4. Budowanie zapytania z pełnymi relacjami
    const { data, error } = await supabase
      .from('planned_meals')
      .select(PLANNED_MEAL_SELECT_FULL)
      .eq('user_id', user.id)
      .gte('meal_date', start_date)
      .lte('meal_date', end_date)
      .order('meal_date', { ascending: true })
      .order('meal_type', { ascending: true })

    if (error) {
      console.error('Błąd Supabase w getPlannedMeals:', error)
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 5. Transformacja do DTO (filtrujemy posiłki bez przepisu)
    type PlannedMealRow = Parameters<typeof transformPlannedMealToDTO>[0]
    const rawMeals = data ?? []
    const validMeals: PlannedMealRow[] = []

    for (const meal of rawMeals) {
      // Skip if meal doesn't have required structure
      const mealObj = meal as unknown as Record<string, unknown> | null
      if (
        mealObj &&
        typeof mealObj === 'object' &&
        'id' in mealObj &&
        'recipe' in mealObj &&
        mealObj.recipe !== null
      ) {
        validMeals.push(mealObj as PlannedMealRow)
      }
    }

    const meals = validMeals.map((meal) => transformPlannedMealToDTO(meal))

    return { data: meals }
  } catch (err) {
    console.error('Nieoczekiwany błąd w getPlannedMeals:', err)
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
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
      return {
        error: `Nieprawidłowe ID posiłku: ${validatedId.error.message}`,
        code: 'VALIDATION_ERROR',
      }
    }

    // 2. Walidacja danych wejściowych
    const validated = updatePlannedMealBodySchema.safeParse(updateData)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe dane aktualizacji: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
        code: 'VALIDATION_ERROR',
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
      return { error: 'Uwierzytelnienie wymagane', code: 'UNAUTHORIZED' }
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

    return { error: 'Nieznana akcja', code: 'VALIDATION_ERROR' }
  } catch (err) {
    console.error('Nieoczekiwany błąd w updatePlannedMeal:', err)
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
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
      return { error: 'Posiłek nie został znaleziony', code: 'NOT_FOUND' }
    }
    return {
      error: `Błąd bazy danych: ${fetchError.message}`,
      code: 'DATABASE_ERROR',
    }
  }

  if (!existing) {
    return { error: 'Posiłek nie został znaleziony', code: 'NOT_FOUND' }
  }

  if (existing.user_id !== userId) {
    return {
      error: 'Nie masz uprawnień do modyfikacji tego posiłku',
      code: 'UNAUTHORIZED',
    }
  }

  // 2. Update
  const { data, error } = await supabase
    .from('planned_meals')
    .update({ is_eaten: isEaten })
    .eq('id', mealId)
    .select(PLANNED_MEAL_SELECT_FULL)
    .single()

  if (error) {
    return {
      error: `Błąd bazy danych: ${error.message}`,
      code: 'DATABASE_ERROR',
    }
  }

  // Type guard check for recipe
  type PlannedMealRow = Parameters<typeof transformPlannedMealToDTO>[0]
  const mealData = data as unknown

  if (!isValidMealData(mealData)) {
    return {
      error: 'Przepis nie został znaleziony dla tego posiłku',
      code: 'NOT_FOUND',
    }
  }

  const transformedMeal = transformPlannedMealToDTO(mealData as PlannedMealRow)

  // 3. Aktualizuj historię w zależności od stanu is_eaten
  if (isEaten) {
    // Posiłek oznaczony jako zjedzony - zapisz do historii
    const nutrition = calculateRecipeNutritionWithOverrides(
      transformedMeal.recipe,
      transformedMeal.ingredient_overrides
    )

    const mealEatenData: MealEatenData = {
      planned_meal_id: transformedMeal.id,
      recipe_id: transformedMeal.recipe.id,
      recipe_name: transformedMeal.recipe.name,
      meal_type: transformedMeal.meal_type,
      meal_date: transformedMeal.meal_date,
      calories: Math.round(nutrition.calories),
      protein_g: Math.round(nutrition.protein_g * 10) / 10,
      carbs_g: Math.round(nutrition.carbs_g * 10) / 10,
      fats_g: Math.round(nutrition.fats_g * 10) / 10,
      ingredient_overrides: transformedMeal.ingredient_overrides,
    }

    // Zapisz do historii (nie blokujemy na błędzie - historia jest poboczna)
    recordMealEaten(mealEatenData).catch((err) => {
      console.warn('Błąd zapisu historii meal_eaten:', err)
    })
  } else {
    // Posiłek odkliknięty - usuń z historii
    removeMealEaten(transformedMeal.id).catch((err) => {
      console.warn('Błąd usuwania historii meal_eaten:', err)
    })
  }

  return {
    data: transformedMeal,
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
      return { error: 'Posiłek nie został znaleziony', code: 'NOT_FOUND' }
    }
    return {
      error: `Błąd bazy danych: ${fetchError.message}`,
      code: 'DATABASE_ERROR',
    }
  }

  if (!originalMeal) {
    return { error: 'Posiłek nie został znaleziony', code: 'NOT_FOUND' }
  }

  if (originalMeal.user_id !== userId) {
    return {
      error: 'Nie masz uprawnień do modyfikacji tego posiłku',
      code: 'UNAUTHORIZED',
    }
  }

  // 2. Pobranie nowego przepisu
  const { data: newRecipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id, meal_types, total_calories')
    .eq('id', newRecipeId)
    .single()

  if (recipeError || !newRecipe) {
    return { error: 'Przepis nie został znaleziony', code: 'NOT_FOUND' }
  }

  // 3. Sprawdzenie czy recipe istnieje
  if (!originalMeal.recipe) {
    return {
      error: 'Oryginalny przepis nie został znaleziony',
      code: 'NOT_FOUND',
    }
  }

  // 4. Walidacja meal_type
  if (!newRecipe.meal_types.includes(originalMeal.meal_type)) {
    return {
      error: `Przepis nie pasuje do typu posiłku. Wymagany: ${originalMeal.meal_type}, dostępne: ${newRecipe.meal_types.join(', ')}`,
      code: 'VALIDATION_ERROR',
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
      code: 'VALIDATION_ERROR',
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
    .select(PLANNED_MEAL_SELECT_FULL)
    .single()

  if (error) {
    return {
      error: `Błąd bazy danych: ${error.message}`,
      code: 'DATABASE_ERROR',
    }
  }

  // Type guard check for recipe
  type PlannedMealRow = Parameters<typeof transformPlannedMealToDTO>[0]
  const mealData = data as unknown

  if (!isValidMealData(mealData)) {
    return {
      error: 'Przepis nie został znaleziony dla tego posiłku',
      code: 'NOT_FOUND',
    }
  }

  return {
    data: transformPlannedMealToDTO(mealData as PlannedMealRow),
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
      return { error: 'Posiłek nie został znaleziony', code: 'NOT_FOUND' }
    }
    return {
      error: `Błąd bazy danych: ${fetchError.message}`,
      code: 'DATABASE_ERROR',
    }
  }

  if (!meal) {
    return { error: 'Posiłek nie został znaleziony', code: 'NOT_FOUND' }
  }

  if (meal.user_id !== userId) {
    return {
      error: 'Nie masz uprawnień do modyfikacji tego posiłku',
      code: 'UNAUTHORIZED',
    }
  }

  if (!meal.recipe) {
    return {
      error: 'Przepis nie został znaleziony dla tego posiłku',
      code: 'NOT_FOUND',
    }
  }

  // 2. Walidacja każdego override
  for (const override of overrides) {
    const ingredient = meal.recipe.recipe_ingredients.find(
      (ri) => ri.ingredient_id === override.ingredient_id
    )

    if (!ingredient) {
      return {
        error: `Składnik o ID ${override.ingredient_id} nie istnieje w przepisie`,
        code: 'VALIDATION_ERROR',
      }
    }

    // Walidacja podstawowa (ilość >= 0, 0 oznacza wykluczenie składnika)
    if (override.new_amount < 0) {
      return {
        error: `Ilość składnika o ID ${override.ingredient_id} nie może być ujemna`,
        code: 'VALIDATION_ERROR',
      }
    }

    // Składniki nie-skalowalne mogą być tylko wykluczane (0) lub przywracane do oryginalnej wartości
    if (!ingredient.is_scalable && override.new_amount !== 0) {
      // Allow restoring to original amount
      if (Math.abs(override.new_amount - ingredient.base_amount) > 0.01) {
        return {
          error: `Składnik o ID ${override.ingredient_id} nie może być skalowany (tylko wykluczenie lub oryginalna wartość)`,
          code: 'VALIDATION_ERROR',
        }
      }
    }

    // Note: Backend accepts any positive value
    // Frontend shows warning at ±15% but allows changes
  }

  // 3. Update (pusta tablica = null, czyli reset do oryginalnych wartości)
  const { data, error } = await supabase
    .from('planned_meals')
    .update({
      ingredient_overrides:
        overrides.length > 0 ? structuredClone(overrides) : null,
    })
    .eq('id', mealId)
    .select(PLANNED_MEAL_SELECT_FULL)
    .single()

  if (error) {
    return {
      error: `Błąd bazy danych: ${error.message}`,
      code: 'DATABASE_ERROR',
    }
  }

  // Type guard check for recipe
  type PlannedMealRow = Parameters<typeof transformPlannedMealToDTO>[0]
  const mealData = data as unknown

  if (!isValidMealData(mealData)) {
    return {
      error: 'Przepis nie został znaleziony dla tego posiłku',
      code: 'NOT_FOUND',
    }
  }

  return {
    data: transformPlannedMealToDTO(mealData as PlannedMealRow),
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
      return {
        error: `Nieprawidłowe ID posiłku: ${validatedId.error.message}`,
        code: 'VALIDATION_ERROR',
      }
    }

    // 2. Utworzenie Supabase client
    const supabase = await createServerClient()

    // 3. Weryfikacja autentykacji
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Uwierzytelnienie wymagane', code: 'UNAUTHORIZED' }
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
        return { error: 'Posiłek nie został znaleziony', code: 'NOT_FOUND' }
      }
      return {
        error: `Błąd bazy danych: ${fetchError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    if (!meal) {
      return { error: 'Posiłek nie został znaleziony', code: 'NOT_FOUND' }
    }

    if (meal.user_id !== user.id) {
      return {
        error: 'Nie masz uprawnień do przeglądania tego posiłku',
        code: 'UNAUTHORIZED',
      }
    }

    if (!meal.recipe) {
      return {
        error: 'Przepis nie został znaleziony dla tego posiłku',
        code: 'NOT_FOUND',
      }
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
      return {
        error: `Błąd bazy danych: ${searchError.message}`,
        code: 'DATABASE_ERROR',
      }
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
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}
