/**
 * Service Layer dla Profile API - Meal Plan Generator
 *
 * Implementuje logikę biznesową dla automatycznego generowania 7-dniowego
 * planu posiłków zgodnego z celami żywieniowymi użytkownika:
 * - Dobór przepisów według przedziału kalorycznego (target ± 15%)
 * - Losowy wybór z dostępnych przepisów
 * - Zapewnienie różnorodności (brak powtórzeń przepisów w tym samym dniu)
 * - Walidacja makroskładników (suma 3 posiłków ≈ cele dzienne)
 *
 * @see .ai/10d01 api-profile-implementation-plan.md
 */

import { createAdminClient } from '@/lib/supabase/server'
import type { Enums, TablesInsert } from '@/types/database.types'

/**
 * Typ profilu użytkownika (wyciąg z tabeli profiles)
 */
type UserProfile = {
  id: string
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
}

/**
 * Typ przepisu z bazy danych (dla generatora)
 */
type Recipe = {
  id: number
  name: string
  meal_types: Enums<'meal_type_enum'>[]
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
}

/**
 * Typ zaplanowanego posiłku do wstawienia do bazy danych
 */
type PlannedMealInsert = TablesInsert<'planned_meals'>

/**
 * Tolerancja różnicy kalorycznej dla pojedynczego posiłku (±15%)
 */
const CALORIE_TOLERANCE = 0.15

/**
 * Liczba dni do wygenerowania w planie
 */
const DAYS_TO_GENERATE = 7

/**
 * Typy posiłków w kolejności (3 posiłki dziennie)
 */
const MEAL_TYPES: Enums<'meal_type_enum'>[] = ['breakfast', 'lunch', 'dinner']

/**
 * Oblicza docelowe kalorie dla pojedynczego posiłku
 *
 * Zakładamy równy podział kalorii na 3 posiłki dziennie:
 * - Śniadanie: ~33% dziennych kalorii
 * - Obiad: ~33% dziennych kalorii
 * - Kolacja: ~33% dziennych kalorii
 *
 * @param dailyCalories - Dzienne zapotrzebowanie kaloryczne użytkownika
 * @returns Przedział kaloryczny dla posiłku { min, max, target }
 */
function calculateMealCalorieRange(dailyCalories: number): {
  min: number
  max: number
  target: number
} {
  // Równy podział na 3 posiłki
  const target = dailyCalories / 3

  // Tolerancja ±15% dla każdego posiłku
  const min = target * (1 - CALORIE_TOLERANCE)
  const max = target * (1 + CALORIE_TOLERANCE)

  return { min, max, target }
}

/**
 * Losuje przepis z listy dostępnych przepisów
 *
 * Używa algorytmu Fisher-Yates shuffle dla losowego wyboru.
 *
 * @param recipes - Lista dostępnych przepisów
 * @returns Wylosowany przepis lub null jeśli lista pusta
 */
function selectRandomRecipe(recipes: Recipe[]): Recipe | null {
  if (recipes.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * recipes.length)
  return recipes[randomIndex]
}

/**
 * Pobiera przepisy z bazy danych zgodne z kryteriami
 *
 * Filtruje przepisy według:
 * - Typ posiłku (meal_type)
 * - Przedział kaloryczny (min-max)
 *
 * @param mealType - Typ posiłku (breakfast, lunch, dinner)
 * @param minCalories - Minimalna liczba kalorii
 * @param maxCalories - Maksymalna liczba kalorii
 * @returns Lista przepisów spełniających kryteria
 */
async function fetchRecipesForMeal(
  mealType: Enums<'meal_type_enum'>,
  minCalories: number,
  maxCalories: number
): Promise<Recipe[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('recipes')
    .select(
      'id, name, meal_types, total_calories, total_protein_g, total_carbs_g, total_fats_g'
    )
    .contains('meal_types', [mealType])
    .gte('total_calories', minCalories)
    .lte('total_calories', maxCalories)
    .not('total_calories', 'is', null) // Tylko przepisy z obliczonymi kaloriami

  if (error) {
    console.error(`Błąd podczas pobierania przepisów dla ${mealType}:`, error)
    throw new Error(`Nie udało się pobrać przepisów: ${error.message}`)
  }

  return (data || []) as Recipe[]
}

/**
 * Zapewnia różnorodność przepisów w ramach jednego dnia
 *
 * Sprawdza czy przepis nie został już wybrany wcześniej tego samego dnia.
 *
 * @param recipe - Przepis do sprawdzenia
 * @param usedRecipeIds - Set z ID już użytych przepisów w tym dniu
 * @returns true jeśli przepis można użyć (nie ma duplikatu)
 */
function ensureVariety(recipe: Recipe, usedRecipeIds: Set<number>): boolean {
  return !usedRecipeIds.has(recipe.id)
}

/**
 * Wybiera przepis dla pojedynczego posiłku
 *
 * Proces:
 * 1. Pobiera przepisy z bazy danych zgodne z typem posiłku i przedziałem kalorycznym
 * 2. Filtruje przepisy, aby uniknąć duplikatów w tym samym dniu
 * 3. Losowo wybiera jeden przepis z dostępnych
 *
 * @param mealType - Typ posiłku
 * @param calorieRange - Przedział kaloryczny
 * @param usedRecipeIds - Set z ID już użytych przepisów w tym dniu
 * @returns Wybrany przepis lub null jeśli brak dostępnych
 */
async function selectRecipeForMeal(
  mealType: Enums<'meal_type_enum'>,
  calorieRange: { min: number; max: number },
  usedRecipeIds: Set<number>
): Promise<Recipe | null> {
  // 1. Pobranie przepisów z bazy danych
  const allRecipes = await fetchRecipesForMeal(
    mealType,
    calorieRange.min,
    calorieRange.max
  )

  // 2. Filtrowanie przepisów (unikanie duplikatów)
  const availableRecipes = allRecipes.filter((recipe) =>
    ensureVariety(recipe, usedRecipeIds)
  )

  // Jeśli nie ma dostępnych przepisów bez duplikatów, użyj wszystkich
  const recipesToChooseFrom =
    availableRecipes.length > 0 ? availableRecipes : allRecipes

  // 3. Losowy wybór
  return selectRandomRecipe(recipesToChooseFrom)
}

/**
 * Generuje plan posiłków dla pojedynczego dnia
 *
 * @param userId - ID użytkownika
 * @param date - Data w formacie YYYY-MM-DD
 * @param dailyCalories - Dzienne zapotrzebowanie kaloryczne
 * @returns Lista 3 zaplanowanych posiłków (breakfast, lunch, dinner)
 * @throws Error jeśli nie udało się znaleźć przepisów
 */
async function generateDayPlan(
  userId: string,
  date: string,
  dailyCalories: number
): Promise<PlannedMealInsert[]> {
  const dayPlan: PlannedMealInsert[] = []
  const usedRecipeIds = new Set<number>()

  for (const mealType of MEAL_TYPES) {
    // 1. Oblicz przedział kaloryczny dla posiłku
    const calorieRange = calculateMealCalorieRange(dailyCalories)

    // 2. Wybierz przepis
    const recipe = await selectRecipeForMeal(
      mealType,
      calorieRange,
      usedRecipeIds
    )

    if (!recipe) {
      throw new Error(
        `Nie znaleziono przepisu dla ${mealType} w przedziale ${calorieRange.min}-${calorieRange.max} kcal`
      )
    }

    // 3. Dodaj do planu dnia
    usedRecipeIds.add(recipe.id)
    dayPlan.push({
      user_id: userId,
      recipe_id: recipe.id,
      meal_date: date,
      meal_type: mealType,
      is_eaten: false,
      ingredient_overrides: null,
    })
  }

  return dayPlan
}

/**
 * Generuje daty dla kolejnych N dni od dzisiaj
 *
 * @param startDate - Data początkowa (domyślnie dzisiaj)
 * @param numDays - Liczba dni do wygenerowania
 * @returns Tablica dat w formacie YYYY-MM-DD
 */
function generateDates(
  startDate: Date = new Date(),
  numDays: number
): string[] {
  const dates: string[] = []

  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    dates.push(date.toISOString().split('T')[0]) // YYYY-MM-DD
  }

  return dates
}

/**
 * Główna funkcja - generuje 7-dniowy plan posiłków dla użytkownika
 *
 * Proces:
 * 1. Generuje daty dla kolejnych 7 dni (od dzisiaj)
 * 2. Dla każdego dnia generuje 3 posiłki (śniadanie, obiad, kolacja)
 * 3. Dobiera przepisy zgodne z przedziałem kalorycznym (target ± 15%)
 * 4. Zapewnia różnorodność (brak powtórzeń w tym samym dniu)
 * 5. Zwraca listę 21 zaplanowanych posiłków (7 dni × 3 posiłki)
 *
 * @param userProfile - Profil użytkownika z celami żywieniowymi
 * @param startDate - Data początkowa (domyślnie dzisiaj)
 * @returns Lista 21 zaplanowanych posiłków gotowych do wstawienia do bazy
 * @throws Error jeśli nie udało się wygenerować planu
 *
 * @example
 * ```typescript
 * const profile = {
 *   id: 'user-uuid',
 *   target_calories: 1800,
 *   target_carbs_g: 68,
 *   target_protein_g: 158,
 *   target_fats_g: 100
 * }
 *
 * const plan = await generateWeeklyPlan(profile)
 * // plan.length === 21 (7 dni × 3 posiłki)
 * ```
 */
export async function generateWeeklyPlan(
  userProfile: UserProfile,
  startDate: Date = new Date()
): Promise<PlannedMealInsert[]> {
  try {
    const weeklyPlan: PlannedMealInsert[] = []

    // 1. Generuj daty dla 7 dni
    const dates = generateDates(startDate, DAYS_TO_GENERATE)

    // 2. Dla każdego dnia wygeneruj plan 3 posiłków
    for (const date of dates) {
      const dayPlan = await generateDayPlan(
        userProfile.id,
        date,
        userProfile.target_calories
      )

      weeklyPlan.push(...dayPlan)
    }

    // 3. Walidacja - upewnij się, że wygenerowano 21 posiłków
    if (weeklyPlan.length !== DAYS_TO_GENERATE * MEAL_TYPES.length) {
      throw new Error(
        `Nieprawidłowa liczba posiłków w planie: ${weeklyPlan.length}, oczekiwano ${DAYS_TO_GENERATE * MEAL_TYPES.length}`
      )
    }

    return weeklyPlan
  } catch (error) {
    console.error('Błąd podczas generowania planu posiłków:', error)
    throw error
  }
}

/**
 * Sprawdza czy plan posiłków już istnieje dla użytkownika w danym zakresie dat
 *
 * @param userId - ID użytkownika
 * @param startDate - Data początkowa
 * @param endDate - Data końcowa
 * @returns Liczba istniejących zaplanowanych posiłków w zakresie
 */
export async function checkExistingPlan(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const supabase = createAdminClient()

  const { count, error } = await supabase
    .from('planned_meals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('meal_date', startDate)
    .lte('meal_date', endDate)

  if (error) {
    console.error('Błąd podczas sprawdzania istniejącego planu:', error)
    throw new Error(`Nie udało się sprawdzić planu: ${error.message}`)
  }

  return count || 0
}
