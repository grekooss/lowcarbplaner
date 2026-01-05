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
import { logErrorLevel } from '@/lib/error-logger'
import { isValidMealData, type PlannedMealRow } from '@/lib/utils/type-guards'
import { validateIngredientOverrides } from '@/lib/utils/ingredient-validation'
import {
  recordMealEaten,
  removeMealEaten,
  type MealEatenData,
} from '@/lib/actions/user-history'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'
import { withRetry } from '@/lib/utils/retry'

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
 * @param meal - Raw row z tabeli planned_meals + joins (validated by isValidMealData)
 * @returns PlannedMealDTO - Typowany obiekt zgodny z DTO
 */
function transformPlannedMealToDTO(meal: PlannedMealRow): PlannedMealDTO {
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
      logErrorLevel(error, {
        source: 'planned-meals.getPlannedMeals',
        userId: user.id,
        metadata: { start_date, end_date, errorCode: error.code },
      })
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 5. Transformacja do DTO (filtrujemy posiłki bez przepisu używając type guard)
    const rawMeals: unknown[] = data ?? []
    const validMeals = rawMeals.filter(isValidMealData)
    const meals = validMeals.map((meal) => transformPlannedMealToDTO(meal))

    return { data: meals }
  } catch (err) {
    logErrorLevel(err, { source: 'planned-meals.getPlannedMeals' })
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
    logErrorLevel(err, { source: 'planned-meals.updatePlannedMeal' })
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
  if (!isValidMealData(data)) {
    return {
      error: 'Przepis nie został znaleziony dla tego posiłku',
      code: 'NOT_FOUND',
    }
  }

  const transformedMeal = transformPlannedMealToDTO(data)

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

    // Zapisz do historii z retry (nie blokujemy na błędzie - historia jest poboczna)
    // Retry z exponential backoff zapewnia większą niezawodność zapisu
    withRetry(
      () => recordMealEaten(mealEatenData),
      { maxRetries: 3, delayMs: 500, backoff: true },
      {
        source: 'planned-meals.updatePlannedMeal.recordMealEaten',
        userId,
        metadata: { mealId, mealEatenData },
      }
    )
  } else {
    // Posiłek odkliknięty - usuń z historii z retry
    withRetry(
      () => removeMealEaten(transformedMeal.id),
      { maxRetries: 3, delayMs: 500, backoff: true },
      {
        source: 'planned-meals.updatePlannedMeal.removeMealEaten',
        userId,
        metadata: { mealId: transformedMeal.id },
      }
    )
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
  if (!isValidMealData(data)) {
    return {
      error: 'Przepis nie został znaleziony dla tego posiłku',
      code: 'NOT_FOUND',
    }
  }

  return {
    data: transformPlannedMealToDTO(data),
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

  // 2. Walidacja każdego override (używając współdzielonej logiki walidacji)
  const recipeIngredientsMap = new Map(
    meal.recipe.recipe_ingredients.map((ri) => [
      ri.ingredient_id,
      { base_amount: ri.base_amount, is_scalable: ri.is_scalable },
    ])
  )

  const validationResult = validateIngredientOverrides(
    overrides,
    recipeIngredientsMap
  )

  if (!validationResult.valid) {
    return {
      error: validationResult.error!,
      code: 'VALIDATION_ERROR',
    }
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
  if (!isValidMealData(data)) {
    return {
      error: 'Przepis nie został znaleziony dla tego posiłku',
      code: 'NOT_FOUND',
    }
  }

  return {
    data: transformPlannedMealToDTO(data),
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
      // Build Map for O(1) lookup instead of O(n) find() in loop
      const overrideMap = new Map(
        overrides.map((o) => [o.ingredient_id, o.new_amount])
      )

      originalCalories = meal.recipe.recipe_ingredients.reduce((total, ri) => {
        const originalAmount = ri.base_amount
        const adjustedAmount =
          overrideMap.get(ri.ingredient.id) ?? originalAmount

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
        'id, name, image_url, meal_types, difficulty_level, total_calories, total_protein_g, total_carbs_g, total_fiber_g, total_polyols_g, total_net_carbs_g, total_fats_g, total_saturated_fat_g'
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

    // 6. Dodanie calorie_diff i sortowanie (z fiber, polyols i net carbs)
    const replacementsWithDiff: ReplacementRecipeDTO[] = (
      replacements || []
    ).map((recipe) => {
      const totalCarbsG = recipe.total_carbs_g ?? 0
      const totalFiberG = recipe.total_fiber_g ?? 0
      const totalPolyolsG = recipe.total_polyols_g ?? 0
      // Użyj wartości z bazy jeśli dostępna, inaczej oblicz (Net Carbs = Carbs - Fiber - Polyols)
      const totalNetCarbsG =
        recipe.total_net_carbs_g ??
        Math.max(0, totalCarbsG - totalFiberG - totalPolyolsG)

      return {
        id: recipe.id,
        name: recipe.name,
        image_url: recipe.image_url,
        meal_types: recipe.meal_types as ReplacementRecipeDTO['meal_types'],
        difficulty_level:
          recipe.difficulty_level as ReplacementRecipeDTO['difficulty_level'],
        total_calories: recipe.total_calories,
        total_protein_g: recipe.total_protein_g,
        total_carbs_g: recipe.total_carbs_g,
        total_fiber_g: recipe.total_fiber_g,
        total_polyols_g: recipe.total_polyols_g,
        total_net_carbs_g: totalNetCarbsG,
        total_fats_g: recipe.total_fats_g,
        total_saturated_fat_g: recipe.total_saturated_fat_g,
        calorie_diff: (recipe.total_calories || 0) - originalCalories,
      }
    })

    replacementsWithDiff.sort(
      (a, b) => Math.abs(a.calorie_diff) - Math.abs(b.calorie_diff)
    )

    return { data: replacementsWithDiff }
  } catch (err) {
    logErrorLevel(err, { source: 'planned-meals.getReplacementRecipes' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}
