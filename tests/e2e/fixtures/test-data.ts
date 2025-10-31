import { type SupabaseClient } from '@supabase/supabase-js'

/**
 * Verify test data exists in database
 * Auto-seeds if missing
 */
export async function ensureTestDataExists(
  supabase: SupabaseClient
): Promise<void> {
  // Check if test data exists
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('ingredients')
    .select('id')
    .limit(1)

  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('id')
    .limit(1)

  // If data exists, we're good
  if (
    !ingredientsError &&
    ingredients &&
    ingredients.length > 0 &&
    !recipesError &&
    recipes &&
    recipes.length > 0
  ) {
    return
  }

  // Data missing - throw helpful error
  throw new Error(
    `❌ Test data not found in database!\n\n` +
      `📋 To fix this:\n` +
      `   1. Ensure you've run: npm run db:clone\n` +
      `   2. Or manually seed: psql $TARGET_DATABASE_URL -f supabase/test-seed.sql\n\n` +
      `📖 Full guide: tests/e2e/DATABASE_SETUP.md`
  )
}

/**
 * Get test recipes by meal type
 * Returns subset of recipes suitable for testing
 */
export async function getTestRecipes(
  supabase: SupabaseClient,
  mealType?: 'breakfast' | 'lunch' | 'dinner',
  limit: number = 10
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  let query = supabase
    .from('recipes')
    .select('id, name, meal_types, total_calories')
    .limit(limit)

  if (mealType) {
    query = query.contains('meal_types', [mealType])
  }

  const { data: recipes, error } = await query

  if (error) {
    throw new Error(`Failed to fetch test recipes: ${error.message}`)
  }

  if (!recipes || recipes.length === 0) {
    throw new Error(
      `No ${mealType || 'test'} recipes found. Run: npm run db:clone`
    )
  }

  return recipes
}

/**
 * User Profile Test Data
 * Matches profiles table schema
 */
export type TestUserProfile = {
  id: string
  email: string
  age: number
  gender: 'male' | 'female'
  weight_kg: number
  height_cm: number
  activity_level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
  goal: 'weight_loss' | 'weight_maintenance'
  disclaimer_accepted_at: string
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fats_g: number
  weight_loss_rate_kg_week?: number
}

/**
 * Setup test user profile with nutrition goals
 */
export async function setupUserProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  profileData?: Partial<TestUserProfile>
): Promise<void> {
  const defaultProfile: TestUserProfile = {
    id: userId,
    email: email,
    disclaimer_accepted_at: new Date().toISOString(),
    age: 30,
    gender: 'male',
    weight_kg: 80,
    height_cm: 180,
    activity_level: 'moderate',
    goal: 'weight_loss',
    target_calories: 2000,
    target_protein_g: 150,
    target_carbs_g: 50,
    target_fats_g: 140,
    weight_loss_rate_kg_week: 0.5,
    ...profileData,
  }

  const { error } = await supabase.from('profiles').insert(defaultProfile)

  if (error) {
    throw new Error(`Failed to setup user profile: ${error.message}`)
  }
}

/**
 * Setup test meal plan for user
 * Creates a 7-day meal plan with recipes
 */
export async function setupMealPlan(
  supabase: SupabaseClient,
  userId: string,
  startDate?: Date
): Promise<void> {
  const planStartDate = startDate || new Date()

  // Verify profile exists before creating meal plan
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, disclaimer_accepted_at')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error(
      `Profile not found for user ${userId}. Profile must exist before creating meal plan.`
    )
  }

  if (!profile.disclaimer_accepted_at) {
    throw new Error(
      `Profile for user ${userId} has no disclaimer_accepted_at. Profile may not be fully initialized.`
    )
  }

  // Verify test data exists first
  await ensureTestDataExists(supabase)

  // Get recipes for each meal type
  const breakfasts = await getTestRecipes(supabase, 'breakfast', 7)
  const lunches = await getTestRecipes(supabase, 'lunch', 7)
  const dinners = await getTestRecipes(supabase, 'dinner', 7)

  if (breakfasts.length < 2 || lunches.length < 2 || dinners.length < 2) {
    throw new Error('Not enough recipes in database. Run: npm run db:clone')
  }

  const recipes = {
    breakfast: breakfasts,
    lunch: lunches,
    dinner: dinners,
  }

  // Create planned meals for 7 days
  const plannedMeals = []
  const mealTypes = ['breakfast', 'lunch', 'dinner'] as const

  for (let day = 0; day < 7; day++) {
    const date = new Date(planStartDate)
    date.setDate(date.getDate() + day)

    for (const mealType of mealTypes) {
      const recipesForType = recipes[mealType]
      const recipe = recipesForType[day % recipesForType.length]

      plannedMeals.push({
        user_id: userId,
        meal_date: date.toISOString().split('T')[0],
        meal_type: mealType,
        recipe_id: recipe.id,
      })
    }
  }

  const { error: insertError } = await supabase
    .from('planned_meals')
    .insert(plannedMeals)

  if (insertError) {
    throw new Error(`Failed to setup meal plan: ${insertError.message}`)
  }
}

/**
 * Setup test shopping list items
 */
export async function setupShoppingList(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // Get user's planned meals
  const { data: plannedMeals, error: mealsError } = await supabase
    .from('planned_meals')
    .select('recipe_id')
    .eq('user_id', userId)
    .limit(7)

  if (mealsError || !plannedMeals || plannedMeals.length === 0) {
    throw new Error('No planned meals found for user')
  }

  // Get recipe ingredients
  const recipeIds = plannedMeals.map((m) => m.recipe_id)
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .select('ingredient_id, quantity, unit')
    .in('recipe_id', recipeIds)

  if (ingredientsError || !ingredients) {
    throw new Error('Failed to fetch recipe ingredients')
  }

  // Create shopping list items
  const shoppingListItems = ingredients.map((ing) => ({
    user_id: userId,
    ingredient_id: ing.ingredient_id,
    quantity: ing.quantity,
    unit: ing.unit,
    checked: false,
  }))

  const { error: insertError } = await supabase
    .from('shopping_list')
    .insert(shoppingListItems)

  if (insertError) {
    throw new Error(`Failed to setup shopping list: ${insertError.message}`)
  }
}

/**
 * Cleanup all test data for a user
 * Removes planned meals, shopping list, and profile
 */
export async function cleanupUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // Delete in reverse order of dependencies
  await supabase.from('shopping_list').delete().eq('user_id', userId)
  await supabase.from('planned_meals').delete().eq('user_id', userId)
  await supabase.from('profiles').delete().eq('id', userId)
}

/**
 * Wait for specific condition with timeout
 * Useful for waiting for async operations in the app
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeoutMs: number = 10000,
  intervalMs: number = 100
): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error(`Condition not met within ${timeoutMs}ms`)
}
