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
import { formatLocalDate } from '@/lib/utils/date-formatting'
import { logErrorLevel } from '@/lib/error-logger'
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
  meal_plan_type: Enums<'meal_plan_type_enum'>
  selected_meals: Enums<'meal_type_enum'>[] | null
  /** Array of equipment IDs that user doesn't have - recipes requiring these will be excluded */
  excluded_equipment_ids?: number[]
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
 * Typ dla pełnych danych przepisu (z recipe_ingredients i recipe_equipment)
 */
type RecipeWithIngredients = Recipe & {
  recipe_ingredients: {
    ingredient_id: number
    base_amount: number
    unit: string
    is_scalable: boolean
    calories: number | null
    protein_g: number | null
    carbs_g: number | null
    fats_g: number | null
  }[]
  /** IDs of equipment required for this recipe */
  required_equipment_ids: number[]
}

/**
 * Typ nadpisań składników
 */
type IngredientOverride = {
  ingredient_id: number
  new_amount: number
}

/**
 * Cache dla prefetchowanych przepisów
 * Klucz: typ posiłku do wyszukiwania ('breakfast', 'lunch', 'dinner', 'snack')
 * Wartość: przepisy posortowane po kaloriach
 */
type RecipeCache = Map<Enums<'meal_type_enum'>, RecipeWithIngredients[]>

/**
 * Metadane cache'u z indeksem kalorycznym dla szybkiego wyszukiwania
 */
type RecipeCacheMetadata = {
  recipes: RecipeCache
  calorieIndex: Map<
    Enums<'meal_type_enum'>,
    {
      minCalories: number
      maxCalories: number
      sortedByCalories: RecipeWithIngredients[]
    }
  >
  /** Equipment IDs to exclude (recipes requiring these are filtered out) */
  excludedEquipmentIds: Set<number>
}

/**
 * Tolerancja różnicy kalorycznej dla pojedynczego posiłku (±15%)
 */
const CALORIE_TOLERANCE = 0.15

/**
 * Liczba dni do wygenerowania w planie
 */
const DAYS_TO_GENERATE = 7

/**
 * Konfiguracja posiłków dla każdego typu planu
 * Zawiera typy posiłków i ich procentowy udział w dziennych kaloriach
 */
type MealPlanConfig = {
  mealTypes: Enums<'meal_type_enum'>[]
  calorieDistribution: Partial<Record<Enums<'meal_type_enum'>, number>>
}

/**
 * Konfiguracje dla standardowych typów planów posiłków
 */
const MEAL_PLAN_CONFIGS: Record<
  Enums<'meal_plan_type_enum'>,
  MealPlanConfig
> = {
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
    // Domyślna konfiguracja - zostanie nadpisana przez selected_meals
    mealTypes: ['lunch', 'dinner'],
    calorieDistribution: {
      lunch: 0.45,
      dinner: 0.55,
    },
  },
}

/**
 * Pobiera konfigurację posiłków dla użytkownika
 * Uwzględnia meal_plan_type oraz selected_meals dla konfiguracji '2_main'
 *
 * @param mealPlanType - Typ planu posiłków
 * @param selectedMeals - Wybrane posiłki (dla '2_main')
 * @returns Konfiguracja posiłków z typami i podziałem kalorii
 */
function getMealPlanConfig(
  mealPlanType: Enums<'meal_plan_type_enum'>,
  selectedMeals: Enums<'meal_type_enum'>[] | null
): MealPlanConfig {
  // Dla '2_main' używamy selected_meals
  if (
    mealPlanType === '2_main' &&
    selectedMeals &&
    selectedMeals.length === 2
  ) {
    // Sortuj posiłki według kolejności w ciągu dnia
    const mealOrder: Enums<'meal_type_enum'>[] = [
      'breakfast',
      'lunch',
      'dinner',
    ]
    const sortedMeals = [...selectedMeals].sort(
      (a, b) => mealOrder.indexOf(a) - mealOrder.indexOf(b)
    ) as Enums<'meal_type_enum'>[]

    const firstMeal = sortedMeals[0]!
    const secondMeal = sortedMeals[1]!

    // Wcześniejszy posiłek dostaje 45%, późniejszy 55%
    const distribution: Partial<Record<Enums<'meal_type_enum'>, number>> = {}
    distribution[firstMeal] = 0.45
    distribution[secondMeal] = 0.55

    return {
      mealTypes: sortedMeals,
      calorieDistribution: distribution,
    }
  }

  // Dla pozostałych konfiguracji używamy predefiniowanych wartości
  return MEAL_PLAN_CONFIGS[mealPlanType]
}

/**
 * Maksymalna procentowa zmiana ilości składnika podczas optymalizacji (20%)
 */
const MAX_INGREDIENT_CHANGE_PERCENT = 0.2

/**
 * Rozszerzony zakres kaloryczny do wyszukiwania (±50% od celu)
 * Używany gdy nie znajdzie przepisu w standardowym zakresie ±15%
 */
const EXTENDED_CALORIE_TOLERANCE = 0.5

/**
 * Zaokrąglanie ilości składników do wielokrotności (5g)
 */
const INGREDIENT_ROUNDING_STEP = 5

/**
 * Próg nadmiaru makroskładnika (białko/węgle/tłuszcze) do optymalizacji (>105% zapotrzebowania)
 */
const MACRO_SURPLUS_THRESHOLD_PERCENT = 1.05

/**
 * Typ makroskładnika
 */
type MacroType = 'protein' | 'carbs' | 'fats'

/**
 * Zaokrągla ilość składnika do najbliższej wielokrotności INGREDIENT_ROUNDING_STEP
 *
 * Przykłady:
 * - 181.8g → 180g
 * - 48.2g → 50g
 * - 223.7g → 225g
 *
 * @param amount - Ilość do zaokrąglenia
 * @returns Zaokrąglona ilość do wielokrotności 5g
 */
function roundIngredientAmount(amount: number): number {
  return (
    Math.round(amount / INGREDIENT_ROUNDING_STEP) * INGREDIENT_ROUNDING_STEP
  )
}

/**
 * Oblicza docelowe kalorie dla pojedynczego posiłku
 *
 * Podział kalorii zależy od konfiguracji planu posiłków:
 * - 3+2: śniadanie 25%, przekąska 10%, obiad 30%, przekąska 10%, kolacja 25%
 * - 3+1: śniadanie 25%, obiad 30%, przekąska 15%, kolacja 30%
 * - 3: śniadanie 30%, obiad 35%, kolacja 35%
 * - 2: według selected_meals (45%/55%)
 *
 * @param dailyCalories - Dzienne zapotrzebowanie kaloryczne użytkownika
 * @param mealType - Typ posiłku
 * @param config - Konfiguracja planu posiłków
 * @returns Przedział kaloryczny dla posiłku { min, max, target }
 */
function calculateMealCalorieRange(
  dailyCalories: number,
  mealType: Enums<'meal_type_enum'>,
  config: MealPlanConfig
): {
  min: number
  max: number
  target: number
} {
  // Pobierz procentowy udział posiłku w dziennych kaloriach
  const percentage =
    config.calorieDistribution[mealType] || 1 / config.mealTypes.length
  const target = dailyCalories * percentage

  // Tolerancja ±15% dla każdego posiłku
  const min = target * (1 - CALORIE_TOLERANCE)
  const max = target * (1 + CALORIE_TOLERANCE)

  return { min, max, target }
}

/**
 * Oblicza makroskładniki dla pojedynczego przepisu z uwzględnieniem nadpisań
 *
 * @param recipe - Przepis z składnikami
 * @param overrides - Nadpisania ilości składników (opcjonalne)
 * @returns Suma makroskładników
 */
function calculateRecipeMacros(
  recipe: RecipeWithIngredients,
  overrides?: IngredientOverride[]
): {
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
} {
  if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
    return {
      calories: recipe.total_calories || 0,
      protein_g: recipe.total_protein_g || 0,
      carbs_g: recipe.total_carbs_g || 0,
      fats_g: recipe.total_fats_g || 0,
    }
  }

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFats = 0

  for (const ingredient of recipe.recipe_ingredients) {
    const override = overrides?.find(
      (o) => o.ingredient_id === ingredient.ingredient_id
    )
    const baseAmount = ingredient.base_amount
    const adjustedAmount = override?.new_amount ?? baseAmount

    if (baseAmount === 0) continue

    const scale = adjustedAmount / baseAmount

    totalCalories += (ingredient.calories || 0) * scale
    totalProtein += (ingredient.protein_g || 0) * scale
    totalCarbs += (ingredient.carbs_g || 0) * scale
    totalFats += (ingredient.fats_g || 0) * scale
  }

  return {
    calories: Math.round(totalCalories),
    protein_g: Math.round(totalProtein * 10) / 10,
    carbs_g: Math.round(totalCarbs * 10) / 10,
    fats_g: Math.round(totalFats * 10) / 10,
  }
}

/**
 * Oblicza nadmiar makroskładników dla dnia
 *
 * @param dayMacros - Suma makroskładników z 3 posiłków
 * @param targets - Docelowe wartości makroskładników
 * @returns Obiekt z nadmiarem dla każdego makroskładnika (wartość dodatnia = nadmiar)
 */
function calculateMacroSurplus(
  dayMacros: {
    protein_g: number
    carbs_g: number
    fats_g: number
  },
  targets: {
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
): {
  protein: number
  carbs: number
  fats: number
} {
  return {
    protein: dayMacros.protein_g - targets.target_protein_g,
    carbs: dayMacros.carbs_g - targets.target_carbs_g,
    fats: dayMacros.fats_g - targets.target_fats_g,
  }
}

/**
 * Sprawdza czy makroskładnik wymaga optymalizacji
 *
 * Makroskładnik (białko/węgle/tłuszcze) wymaga optymalizacji gdy >105% zapotrzebowania
 *
 * @param dayMacros - Aktualne makroskładniki dla dnia
 * @param targets - Docelowe wartości makroskładników
 * @param macroType - Typ sprawdzanego makroskładnika
 * @returns true jeśli makroskładnik przekracza 105% zapotrzebowania
 */
function shouldOptimizeMacro(
  dayMacros: {
    protein_g: number
    carbs_g: number
    fats_g: number
  },
  targets: {
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  },
  macroType: MacroType
): boolean {
  const macroValue =
    macroType === 'protein'
      ? dayMacros.protein_g
      : macroType === 'carbs'
        ? dayMacros.carbs_g
        : dayMacros.fats_g

  const targetValue =
    macroType === 'protein'
      ? targets.target_protein_g
      : macroType === 'carbs'
        ? targets.target_carbs_g
        : targets.target_fats_g

  if (targetValue === 0) return false

  const percentOfTarget = macroValue / targetValue

  // Optymalizuj makro gdy przekracza 105%
  return percentOfTarget > MACRO_SURPLUS_THRESHOLD_PERCENT
}

/**
 * Znajduje makroskładnik, który najbardziej wymaga optymalizacji
 *
 * Priorytet: makro które przekracza 105% zapotrzebowania
 *
 * @param surplus - Nadmiar dla każdego makroskładnika
 * @param dayMacros - Aktualne makroskładniki dla dnia
 * @param targets - Docelowe wartości makroskładników
 * @returns Nazwa makroskładnika z największym nadmiarem (>105%) lub null
 */
function findMacroForOptimization(
  surplus: {
    protein: number
    carbs: number
    fats: number
  },
  dayMacros: {
    protein_g: number
    carbs_g: number
    fats_g: number
  },
  targets: {
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
): MacroType | null {
  // Tylko makro które przekraczają 105% zapotrzebowania
  const validMacros = Object.entries(surplus)
    .filter(([key, value]) => {
      if (value <= 0) return false
      const macroType = key as MacroType
      return shouldOptimizeMacro(dayMacros, targets, macroType)
    })
    .sort(([, a], [, b]) => b - a)

  if (validMacros.length === 0) {
    return null
  }

  const firstEntry = validMacros[0]
  if (!firstEntry) {
    return null
  }

  return firstEntry[0] as MacroType
}

/**
 * Losuje przepis z listy dostępnych przepisów
 *
 * Używa algorytmu Fisher-Yates shuffle dla losowego wyboru.
 *
 * @param recipes - Lista dostępnych przepisów
 * @returns Wylosowany przepis lub null jeśli lista pusta
 */
function selectRandomRecipe(
  recipes: RecipeWithIngredients[]
): RecipeWithIngredients | null {
  if (recipes.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * recipes.length)
  return recipes[randomIndex] || null
}

/**
 * Oblicza nadpisania składników aby dostosować przepis do celu kalorycznego
 *
 * Skaluje składniki oznaczone jako is_scalable proporcjonalnie,
 * aby osiągnąć docelową liczbę kalorii (w granicach ±20% na składnik).
 *
 * @param recipe - Przepis z składnikami
 * @param targetCalories - Docelowa liczba kalorii
 * @returns Lista nadpisań składników lub null jeśli nie potrzeba/nie można skalować
 */
function calculateCalorieScalingOverrides(
  recipe: RecipeWithIngredients,
  targetCalories: number
): IngredientOverride[] | null {
  const currentCalories = recipe.total_calories || 0

  // Jeśli przepis już mieści się w ±5% celu, nie skaluj
  if (
    currentCalories >= targetCalories * 0.95 &&
    currentCalories <= targetCalories * 1.05
  ) {
    return null
  }

  // Oblicz współczynnik skalowania
  const scaleFactor = targetCalories / currentCalories

  // Ogranicz skalowanie do ±20% (czyli scale factor 0.8-1.2)
  const limitedScaleFactor = Math.max(
    1 - MAX_INGREDIENT_CHANGE_PERCENT,
    Math.min(1 + MAX_INGREDIENT_CHANGE_PERCENT, scaleFactor)
  )

  // Jeśli skalowanie jest zbyt małe (< 0.01 różnicy), pomiń
  if (Math.abs(limitedScaleFactor - 1) < 0.01) {
    return null
  }

  // Znajdź składniki, które można skalować i mają kalorie
  const scalableIngredients = recipe.recipe_ingredients.filter(
    (ing) => ing.is_scalable && (ing.calories || 0) > 0
  )

  if (scalableIngredients.length === 0) {
    return null
  }

  // Oblicz sumę kalorii ze skalowalnych składników
  const scalableCalories = scalableIngredients.reduce(
    (sum, ing) => sum + (ing.calories || 0),
    0
  )

  // Jeśli skalowalne składniki to mniej niż 20% kalorii, nie skaluj
  if (scalableCalories < currentCalories * 0.2) {
    return null
  }

  // Stwórz nadpisania dla skalowalnych składników
  const overrides: IngredientOverride[] = []

  for (const ing of scalableIngredients) {
    const newAmount = roundIngredientAmount(
      ing.base_amount * limitedScaleFactor
    )

    // Tylko dodaj nadpisanie jeśli różni się od bazowej ilości
    if (newAmount !== ing.base_amount) {
      overrides.push({
        ingredient_id: ing.ingredient_id,
        new_amount: newAmount,
      })
    }
  }

  return overrides.length > 0 ? overrides : null
}

/**
 * Prefetchuje wszystkie przepisy z bazy danych w jednym zapytaniu
 *
 * Organizuje przepisy w cache według typu posiłku dla szybkiego dostępu.
 * Używane przez generateWeeklyPlan() do eliminacji N+1 queries.
 * Filters out recipes that require excluded equipment.
 *
 * @param excludedEquipmentIds - IDs of equipment that user doesn't have
 * @returns RecipeCacheMetadata z przepisami zorganizowanymi według meal_type
 */
async function prefetchAllRecipes(
  excludedEquipmentIds: number[] = []
): Promise<RecipeCacheMetadata> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      id,
      name,
      meal_types,
      total_calories,
      total_protein_g,
      total_carbs_g,
      total_fats_g,
      recipe_ingredients (
        ingredient_id,
        base_amount,
        unit,
        is_scalable,
        calories,
        protein_g,
        carbs_g,
        fats_g
      ),
      recipe_equipment (
        equipment_id
      )
      `
    )
    .not('total_calories', 'is', null)
    .order('total_calories', { ascending: true })

  if (error) {
    logErrorLevel(error, {
      source: 'meal-plan-generator.prefetchAllRecipes',
      metadata: { errorCode: error.code },
    })
    throw new Error(`Nie udało się pobrać przepisów: ${error.message}`)
  }

  // Build excluded equipment set for fast lookup
  const excludedSet = new Set(excludedEquipmentIds)

  // Transform raw data to RecipeWithIngredients with required_equipment_ids
  type RawRecipe = Omit<RecipeWithIngredients, 'required_equipment_ids'> & {
    recipe_equipment?: { equipment_id: number }[]
  }

  const transformedRecipes: RecipeWithIngredients[] = (
    (data || []) as RawRecipe[]
  )
    .map((recipe) => ({
      ...recipe,
      required_equipment_ids: (recipe.recipe_equipment || []).map(
        (re) => re.equipment_id
      ),
    }))
    // Filter out recipes that require excluded equipment
    .filter((recipe) => {
      if (excludedSet.size === 0) return true
      // Recipe is valid if NONE of its required equipment is in the excluded set
      return !recipe.required_equipment_ids.some((eqId) =>
        excludedSet.has(eqId)
      )
    })

  // Organizuj przepisy według meal_type
  const recipes: RecipeCache = new Map()
  const searchTypes: Enums<'meal_type_enum'>[] = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ]

  for (const mealType of searchTypes) {
    recipes.set(mealType, [])
  }

  for (const recipe of transformedRecipes) {
    for (const mealType of recipe.meal_types) {
      // Normalizuj snack_morning/snack_afternoon do 'snack' dla wyszukiwania
      const searchType =
        mealType === 'snack_morning' || mealType === 'snack_afternoon'
          ? 'snack'
          : mealType

      const existing = recipes.get(searchType)
      if (existing) {
        existing.push(recipe)
      }
    }
  }

  // Buduj indeks kaloryczny dla każdego typu posiłku
  const calorieIndex = new Map<
    Enums<'meal_type_enum'>,
    {
      minCalories: number
      maxCalories: number
      sortedByCalories: RecipeWithIngredients[]
    }
  >()

  for (const [mealType, mealRecipes] of recipes) {
    // Sortuj po kaloriach (już posortowane z query, ale upewniamy się)
    const sortedRecipes = [...mealRecipes].sort(
      (a, b) => (a.total_calories || 0) - (b.total_calories || 0)
    )

    if (sortedRecipes.length > 0) {
      const firstRecipe = sortedRecipes[0]
      const lastRecipe = sortedRecipes[sortedRecipes.length - 1]

      calorieIndex.set(mealType, {
        minCalories: firstRecipe?.total_calories || 0,
        maxCalories: lastRecipe?.total_calories || 0,
        sortedByCalories: sortedRecipes,
      })

      // Aktualizuj recipes z posortowaną wersją
      recipes.set(mealType, sortedRecipes)
    }
  }

  return { recipes, calorieIndex, excludedEquipmentIds: excludedSet }
}

/**
 * Binary search do znalezienia pierwszego indeksu gdzie recipe.total_calories >= target
 *
 * @param recipes - Posortowana tablica przepisów po kaloriach
 * @param targetCalories - Szukana wartość kalorii
 * @returns Indeks pierwszego przepisu >= targetCalories
 */
function binarySearchLowerBound(
  recipes: RecipeWithIngredients[],
  targetCalories: number
): number {
  let left = 0
  let right = recipes.length

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    const midCalories = recipes[mid]?.total_calories || 0

    if (midCalories < targetCalories) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  return left
}

/**
 * Pobiera przepisy z cache'u według zakresu kalorycznego
 *
 * Używa binary search dla O(log n) wyszukiwania zamiast query do DB.
 *
 * @param cache - Prefetchowany cache przepisów
 * @param mealType - Typ posiłku
 * @param minCalories - Minimalna liczba kalorii
 * @param maxCalories - Maksymalna liczba kalorii
 * @returns Lista przepisów w zakresie kalorycznym
 */
function getRecipesFromCache(
  cache: RecipeCacheMetadata,
  mealType: Enums<'meal_type_enum'>,
  minCalories: number,
  maxCalories: number
): RecipeWithIngredients[] {
  const index = cache.calorieIndex.get(mealType)

  if (!index || index.sortedByCalories.length === 0) {
    return []
  }

  // Binary search dla pierwszego przepisu >= minCalories
  const startIdx = binarySearchLowerBound(index.sortedByCalories, minCalories)

  // Linear scan od startIdx do momentu gdy przekroczymy maxCalories
  const result: RecipeWithIngredients[] = []
  for (let i = startIdx; i < index.sortedByCalories.length; i++) {
    const recipe = index.sortedByCalories[i]
    if (!recipe) break

    const calories = recipe.total_calories || 0
    if (calories > maxCalories) break
    if (calories >= minCalories) {
      result.push(recipe)
    }
  }

  return result
}

/**
 * Cached version: Wybiera przepis dla pojedynczego posiłku używając prefetchowanego cache'u
 *
 * Synchroniczna wersja selectRecipeForMeal() - bez zapytań do DB.
 * Używana przez generateDayPlanCached() w kontekście generateWeeklyPlan().
 *
 * @param cache - Prefetchowany cache przepisów
 * @param mealType - Typ posiłku
 * @param calorieRange - Przedział kaloryczny z celem
 * @param usedRecipeIds - Set z ID już użytych przepisów w tym dniu
 * @returns Wybrany przepis z opcjonalnymi nadpisaniami lub null
 */
function selectRecipeForMealCached(
  cache: RecipeCacheMetadata,
  mealType: Enums<'meal_type_enum'>,
  calorieRange: { min: number; max: number; target: number },
  usedRecipeIds: Set<number>
): RecipeSelectionResult | null {
  const searchMealType = getMealTypeForSearch(mealType)

  // 1. Standard range lookup z cache'u
  const standardRecipes = getRecipesFromCache(
    cache,
    searchMealType,
    calorieRange.min,
    calorieRange.max
  )

  // 2. Filtrowanie dla różnorodności (brak duplikatów w tym samym dniu)
  const availableRecipes = standardRecipes.filter(
    (recipe) => !usedRecipeIds.has(recipe.id)
  )

  const recipesToChooseFrom =
    availableRecipes.length > 0 ? availableRecipes : standardRecipes

  // 3. Losowy wybór ze standardowego zakresu
  const selectedRecipe = selectRandomRecipe(recipesToChooseFrom)

  if (selectedRecipe) {
    return {
      recipe: selectedRecipe,
      ingredientOverrides: null,
    }
  }

  // 4. Extended range fallback (±50%)
  const extendedMin = calorieRange.target * (1 - EXTENDED_CALORIE_TOLERANCE)
  const extendedMax = calorieRange.target * (1 + EXTENDED_CALORIE_TOLERANCE)

  const extendedRecipes = getRecipesFromCache(
    cache,
    searchMealType,
    extendedMin,
    extendedMax
  )

  const availableExtended = extendedRecipes.filter(
    (recipe) => !usedRecipeIds.has(recipe.id)
  )

  const extendedToChooseFrom =
    availableExtended.length > 0 ? availableExtended : extendedRecipes

  if (extendedToChooseFrom.length === 0) {
    return null
  }

  // 5. Wybierz przepis najbliższy celowi
  const sortedByCloseness = [...extendedToChooseFrom].sort((a, b) => {
    const diffA = Math.abs((a.total_calories || 0) - calorieRange.target)
    const diffB = Math.abs((b.total_calories || 0) - calorieRange.target)
    return diffA - diffB
  })

  const closestRecipe = sortedByCloseness[0]
  if (!closestRecipe) {
    return null
  }

  // 6. Oblicz nadpisania składników dla skalowania
  const overrides = calculateCalorieScalingOverrides(
    closestRecipe,
    calorieRange.target
  )

  return {
    recipe: closestRecipe,
    ingredientOverrides: overrides,
  }
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
 * @returns Lista przepisów spełniających kryteria (z recipe_ingredients)
 */
async function fetchRecipesForMeal(
  mealType: Enums<'meal_type_enum'>,
  minCalories: number,
  maxCalories: number
): Promise<RecipeWithIngredients[]> {
  const supabase = createAdminClient()

  // Zaokrąglij kalorie do integer (kolumna total_calories w bazie to integer)
  const minCal = Math.floor(minCalories)
  const maxCal = Math.ceil(maxCalories)

  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      id,
      name,
      meal_types,
      total_calories,
      total_protein_g,
      total_carbs_g,
      total_fats_g,
      recipe_ingredients (
        ingredient_id,
        base_amount,
        unit,
        is_scalable,
        calories,
        protein_g,
        carbs_g,
        fats_g
      )
      `
    )
    .contains('meal_types', [mealType])
    .gte('total_calories', minCal)
    .lte('total_calories', maxCal)
    .not('total_calories', 'is', null) // Tylko przepisy z obliczonymi kaloriami

  if (error) {
    logErrorLevel(error, {
      source: 'meal-plan-generator.fetchRecipesForMeal',
      metadata: { mealType, minCalories, maxCalories, errorCode: error.code },
    })
    throw new Error(`Nie udało się pobrać przepisów: ${error.message}`)
  }

  return (data || []) as RecipeWithIngredients[]
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
function ensureVariety(
  recipe: RecipeWithIngredients,
  usedRecipeIds: Set<number>
): boolean {
  return !usedRecipeIds.has(recipe.id)
}

/**
 * Wynik wyboru przepisu z opcjonalnymi nadpisaniami składników
 */
type RecipeSelectionResult = {
  recipe: RecipeWithIngredients
  ingredientOverrides: IngredientOverride[] | null
}

/**
 * Wybiera przepis dla pojedynczego posiłku
 *
 * Proces:
 * 1. Pobiera przepisy z bazy danych zgodne z typem posiłku i przedziałem kalorycznym
 * 2. Filtruje przepisy, aby uniknąć duplikatów w tym samym dniu
 * 3. Losowo wybiera jeden przepis z dostępnych
 * 4. Jeśli nie znajdzie przepisu w standardowym zakresie, rozszerza zakres i skaluje składniki
 *
 * @param mealType - Typ posiłku
 * @param calorieRange - Przedział kaloryczny z celem
 * @param usedRecipeIds - Set z ID już użytych przepisów w tym dniu
 * @returns Wybrany przepis z opcjonalnymi nadpisaniami lub null
 */
async function selectRecipeForMeal(
  mealType: Enums<'meal_type_enum'>,
  calorieRange: { min: number; max: number; target: number },
  usedRecipeIds: Set<number>
): Promise<RecipeSelectionResult | null> {
  // 1. Pobranie przepisów z bazy danych w standardowym zakresie
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

  // 3. Losowy wybór ze standardowego zakresu
  const selectedRecipe = selectRandomRecipe(recipesToChooseFrom)

  if (selectedRecipe) {
    // Przepis znaleziony w standardowym zakresie - bez skalowania
    return {
      recipe: selectedRecipe,
      ingredientOverrides: null,
    }
  }

  // 4. Nie znaleziono przepisu - rozszerz zakres wyszukiwania
  const extendedMin = calorieRange.target * (1 - EXTENDED_CALORIE_TOLERANCE)
  const extendedMax = calorieRange.target * (1 + EXTENDED_CALORIE_TOLERANCE)

  const extendedRecipes = await fetchRecipesForMeal(
    mealType,
    extendedMin,
    extendedMax
  )

  // Filtruj duplikaty w rozszerzonym zakresie
  const availableExtendedRecipes = extendedRecipes.filter((recipe) =>
    ensureVariety(recipe, usedRecipeIds)
  )

  const extendedRecipesToChooseFrom =
    availableExtendedRecipes.length > 0
      ? availableExtendedRecipes
      : extendedRecipes

  if (extendedRecipesToChooseFrom.length === 0) {
    return null
  }

  // 5. Wybierz przepis najbliższy celowi kalorycznemu
  const sortedByCloseness = [...extendedRecipesToChooseFrom].sort((a, b) => {
    const diffA = Math.abs((a.total_calories || 0) - calorieRange.target)
    const diffB = Math.abs((b.total_calories || 0) - calorieRange.target)
    return diffA - diffB
  })

  const closestRecipe = sortedByCloseness[0]
  if (!closestRecipe) {
    return null
  }

  // 6. Oblicz nadpisania składników aby zbliżyć się do celu
  const overrides = calculateCalorieScalingOverrides(
    closestRecipe,
    calorieRange.target
  )

  return {
    recipe: closestRecipe,
    ingredientOverrides: overrides,
  }
}

/**
 * Maksymalna liczba iteracji optymalizacji (zabezpieczenie przed nieskończoną pętlą)
 */
const MAX_OPTIMIZATION_ITERATIONS = 10

/**
 * Oblicza aktualne kalorie i makroskładniki dla dnia
 */
function calculateDayTotals(
  dayPlan: PlannedMealInsert[],
  selectedRecipes: RecipeWithIngredients[]
): {
  dayCalories: number
  dayMacros: { protein_g: number; carbs_g: number; fats_g: number }
} {
  let dayCalories = 0
  const dayMacros = {
    protein_g: 0,
    carbs_g: 0,
    fats_g: 0,
  }

  for (let i = 0; i < selectedRecipes.length; i++) {
    const recipe = selectedRecipes[i]
    if (!recipe) continue

    const existingOverrides = dayPlan[i]?.ingredient_overrides as
      | IngredientOverride[]
      | null

    const macros = calculateRecipeMacros(recipe, existingOverrides ?? undefined)
    dayCalories += macros.calories
    dayMacros.protein_g += macros.protein_g
    dayMacros.carbs_g += macros.carbs_g
    dayMacros.fats_g += macros.fats_g
  }

  return { dayCalories, dayMacros }
}

/**
 * Optymalizuje plan dnia aby zmieścić się w celach kalorycznych i makroskładników
 *
 * Algorytm iteracyjny:
 * 1. Kalorie ZAWSZE muszą być ≤100% dziennego zapotrzebowania
 * 2. Makro (białko/węgle/tłuszcze) optymalizujemy gdy >105%
 *
 * Pętla iteracyjna:
 * - Wykonuje wielokrotne przejścia (max 10 iteracji)
 * - W każdej iteracji redukuje 1 składnik o max 20%
 * - Kontynuuje aż cel zostanie osiągnięty lub wyczerpie iteracje
 * - Pozwala na stopniową redukcję wielu składników gdy nadmiar jest duży
 *
 * @param dayPlan - Plan dnia (3 posiłki) z przepisami
 * @param selectedRecipes - Pełne dane przepisów (z recipe_ingredients)
 * @param targets - Cele kaloryczne i makroskładników użytkownika
 * @returns Zoptymalizowany plan z ingredient_overrides
 */
function optimizeDayPlan(
  dayPlan: PlannedMealInsert[],
  selectedRecipes: RecipeWithIngredients[],
  targets: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
): PlannedMealInsert[] {
  let currentPlan = [...dayPlan]

  // Iteracyjna optymalizacja - max 10 przebiegów
  for (
    let iteration = 0;
    iteration < MAX_OPTIMIZATION_ITERATIONS;
    iteration++
  ) {
    // Oblicz aktualne wartości
    const { dayCalories, dayMacros } = calculateDayTotals(
      currentPlan,
      selectedRecipes
    )

    // PRIORYTET 1: Sprawdź kalorie - ZAWSZE muszą być ≤100%
    if (dayCalories > targets.target_calories) {
      const calorieSurplus = dayCalories - targets.target_calories
      const { plan: optimizedPlan, hasChanges } = optimizeSingleCaloriePass(
        currentPlan,
        selectedRecipes,
        calorieSurplus
      )

      // Sprawdź czy optymalizacja coś zmieniła
      if (!hasChanges) {
        // Brak dalszej możliwości optymalizacji kalorii - przejdź do makro
        break
      }
      currentPlan = optimizedPlan
      continue // Następna iteracja - sprawdź ponownie kalorie
    }

    // PRIORYTET 2: Sprawdź makroskładniki - optymalizuj gdy >105%
    const surplus = calculateMacroSurplus(dayMacros, targets)
    const macroToOptimize = findMacroForOptimization(
      surplus,
      dayMacros,
      targets
    )

    if (!macroToOptimize) {
      // Wszystkie makro w normie - zakończ optymalizację
      break
    }

    // Wykonaj pojedynczy przebieg optymalizacji makro
    const { plan: optimizedPlan, hasChanges } = optimizeSingleMacroPass(
      currentPlan,
      selectedRecipes,
      macroToOptimize,
      surplus[macroToOptimize]
    )

    // Sprawdź czy optymalizacja coś zmieniła
    if (!hasChanges) {
      // Brak dalszej możliwości optymalizacji - zakończ
      break
    }

    currentPlan = optimizedPlan
  }

  return currentPlan
}

/**
 * Pojedynczy przebieg optymalizacji kalorii
 * Redukuje 1 składnik o max 20%
 * @returns Object with optimized plan and flag indicating if changes were made
 */
function optimizeSingleCaloriePass(
  dayPlan: PlannedMealInsert[],
  selectedRecipes: RecipeWithIngredients[],
  calorieTarget: number
): { plan: PlannedMealInsert[]; hasChanges: boolean } {
  // Znajdź wszystkie skalowalne składniki z kaloriami
  const candidates: Array<{
    recipeIndex: number
    ingredient: {
      ingredient_id: number
      calories: number
      base_amount: number
      currentAmount: number
    }
  }> = []

  for (let i = 0; i < selectedRecipes.length; i++) {
    const recipe = selectedRecipes[i]
    if (!recipe || !recipe.recipe_ingredients) continue

    const existingOverrides =
      (dayPlan[i]?.ingredient_overrides as IngredientOverride[] | null) || []

    for (const ing of recipe.recipe_ingredients) {
      if (!ing.is_scalable || !ing.calories || ing.calories <= 0) continue

      // Sprawdź aktualną ilość (może być już zredukowana)
      const override = existingOverrides.find(
        (o) => o.ingredient_id === ing.ingredient_id
      )
      const currentAmount = override?.new_amount ?? ing.base_amount

      // Minimalna ilość to 80% bazowej (po 1 redukcji 20%)
      // Ale jeśli już zredukowane, pozwól na dalszą redukcję do 50% bazowej
      const minAllowedAmount = ing.base_amount * 0.5
      if (currentAmount <= minAllowedAmount) continue

      candidates.push({
        recipeIndex: i,
        ingredient: {
          ingredient_id: ing.ingredient_id,
          calories: ing.calories,
          base_amount: ing.base_amount,
          currentAmount,
        },
      })
    }
  }

  if (candidates.length === 0) {
    return { plan: dayPlan, hasChanges: false }
  }

  // Wybierz składnik z największą liczbą kalorii (który jeszcze można zredukować)
  candidates.sort((a, b) => {
    // Przelicz kalorie proporcjonalnie do aktualnej ilości
    const caloriesA =
      (a.ingredient.calories / a.ingredient.base_amount) *
      a.ingredient.currentAmount
    const caloriesB =
      (b.ingredient.calories / b.ingredient.base_amount) *
      b.ingredient.currentAmount
    return caloriesB - caloriesA
  })

  const best = candidates[0]
  if (!best) return { plan: dayPlan, hasChanges: false }

  const { recipeIndex, ingredient } = best

  // Oblicz redukcję
  const caloriesPerGram = ingredient.calories / ingredient.base_amount
  const gramsToReduce = calorieTarget / caloriesPerGram

  // Ogranicz do max 20% AKTUALNEJ ilości (nie bazowej)
  const maxReduction = ingredient.currentAmount * MAX_INGREDIENT_CHANGE_PERCENT
  const actualGramsReduction = Math.min(gramsToReduce, maxReduction)
  const newAmount = Math.max(
    ingredient.base_amount * 0.5, // Minimum 50% bazowej ilości
    ingredient.currentAmount - actualGramsReduction
  )

  const roundedAmount = roundIngredientAmount(newAmount)

  // Jeśli zaokrąglona ilość = aktualna, nie ma sensu aktualizować
  if (roundedAmount >= ingredient.currentAmount) {
    return { plan: dayPlan, hasChanges: false }
  }

  // Zaktualizuj plan
  const optimizedPlan = [...dayPlan]
  const mealToUpdate = optimizedPlan[recipeIndex]

  if (mealToUpdate) {
    const existingOverrides =
      (mealToUpdate.ingredient_overrides as IngredientOverride[] | null) || []
    const newOverride = {
      ingredient_id: ingredient.ingredient_id,
      new_amount: roundedAmount,
      auto_adjusted: true,
    }

    const updatedOverrides = existingOverrides.filter(
      (o) => o.ingredient_id !== ingredient.ingredient_id
    )
    updatedOverrides.push(newOverride)

    mealToUpdate.ingredient_overrides = updatedOverrides
  }

  return { plan: optimizedPlan, hasChanges: true }
}

/**
 * Pojedynczy przebieg optymalizacji makroskładnika
 * Redukuje 1 składnik o max 20%
 * @returns Object with optimized plan and flag indicating if changes were made
 */
function optimizeSingleMacroPass(
  dayPlan: PlannedMealInsert[],
  selectedRecipes: RecipeWithIngredients[],
  macroType: MacroType,
  targetReduction: number
): { plan: PlannedMealInsert[]; hasChanges: boolean } {
  const macroField =
    macroType === 'protein'
      ? 'protein_g'
      : macroType === 'carbs'
        ? 'carbs_g'
        : 'fats_g'

  // Znajdź wszystkie skalowalne składniki z danym makro
  const candidates: Array<{
    recipeIndex: number
    ingredient: {
      ingredient_id: number
      macro_value: number
      base_amount: number
      currentAmount: number
    }
  }> = []

  for (let i = 0; i < selectedRecipes.length; i++) {
    const recipe = selectedRecipes[i]
    if (!recipe || !recipe.recipe_ingredients) continue

    const existingOverrides =
      (dayPlan[i]?.ingredient_overrides as IngredientOverride[] | null) || []

    for (const ing of recipe.recipe_ingredients) {
      const macroValue = ing[macroField] || 0
      if (!ing.is_scalable || macroValue <= 0) continue

      const override = existingOverrides.find(
        (o) => o.ingredient_id === ing.ingredient_id
      )
      const currentAmount = override?.new_amount ?? ing.base_amount

      // Minimum 50% bazowej ilości
      const minAllowedAmount = ing.base_amount * 0.5
      if (currentAmount <= minAllowedAmount) continue

      candidates.push({
        recipeIndex: i,
        ingredient: {
          ingredient_id: ing.ingredient_id,
          macro_value: macroValue,
          base_amount: ing.base_amount,
          currentAmount,
        },
      })
    }
  }

  if (candidates.length === 0) {
    return { plan: dayPlan, hasChanges: false }
  }

  // Wybierz składnik z największą wartością makro
  candidates.sort((a, b) => {
    const macroA =
      (a.ingredient.macro_value / a.ingredient.base_amount) *
      a.ingredient.currentAmount
    const macroB =
      (b.ingredient.macro_value / b.ingredient.base_amount) *
      b.ingredient.currentAmount
    return macroB - macroA
  })

  const best = candidates[0]
  if (!best) return { plan: dayPlan, hasChanges: false }

  const { recipeIndex, ingredient } = best

  const recipe = selectedRecipes[recipeIndex]
  if (!recipe) return { plan: dayPlan, hasChanges: false }

  const ingredientData = recipe.recipe_ingredients.find(
    (ri) => ri.ingredient_id === ingredient.ingredient_id
  )

  if (!ingredientData) return { plan: dayPlan, hasChanges: false }

  // Oblicz nową ilość z uwzględnieniem aktualnej
  const macroPerBaseAmount = ingredientData[macroField] || 0
  if (macroPerBaseAmount === 0) return { plan: dayPlan, hasChanges: false }

  const amountToReduce =
    (targetReduction / macroPerBaseAmount) * ingredientData.base_amount

  // Max 20% aktualnej ilości
  const maxReduction = ingredient.currentAmount * MAX_INGREDIENT_CHANGE_PERCENT
  const actualAmountReduction = Math.min(amountToReduce, maxReduction)

  const newAmount = Math.max(
    ingredient.base_amount * 0.5,
    ingredient.currentAmount - actualAmountReduction
  )

  const roundedAmount = roundIngredientAmount(newAmount)

  if (roundedAmount >= ingredient.currentAmount) {
    return { plan: dayPlan, hasChanges: false }
  }

  // Zaktualizuj plan
  const optimizedPlan = [...dayPlan]
  const mealToUpdate = optimizedPlan[recipeIndex]

  if (mealToUpdate) {
    const existingOverrides =
      (mealToUpdate.ingredient_overrides as IngredientOverride[] | null) || []
    const newOverride = {
      ingredient_id: ingredient.ingredient_id,
      new_amount: roundedAmount,
      auto_adjusted: true,
    }

    const updatedOverrides = existingOverrides.filter(
      (o) => o.ingredient_id !== ingredient.ingredient_id
    )
    updatedOverrides.push(newOverride)

    mealToUpdate.ingredient_overrides = updatedOverrides
  }

  return { plan: optimizedPlan, hasChanges: true }
}

/**
 * Cached version: Generuje plan posiłków dla pojedynczego dnia używając prefetchowanego cache'u
 *
 * Synchroniczna wersja generateDayPlan() - bez zapytań do DB.
 * Używana przez generateWeeklyPlan() do eliminacji N+1 queries.
 *
 * @param userId - ID użytkownika
 * @param date - Data w formacie YYYY-MM-DD
 * @param userProfile - Profil użytkownika z celami makroskładników i konfiguracją posiłków
 * @param cache - Prefetchowany cache przepisów
 * @returns Lista zaplanowanych posiłków według konfiguracji użytkownika z ingredient_overrides
 * @throws Error jeśli nie udało się znaleźć przepisów
 */
function generateDayPlanCached(
  userId: string,
  date: string,
  userProfile: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
    meal_plan_type: Enums<'meal_plan_type_enum'>
    selected_meals: Enums<'meal_type_enum'>[] | null
  },
  cache: RecipeCacheMetadata
): PlannedMealInsert[] {
  const dayPlan: PlannedMealInsert[] = []
  const selectedRecipes: RecipeWithIngredients[] = []
  const usedRecipeIds = new Set<number>()

  // Pobierz konfigurację posiłków dla użytkownika
  const mealConfig = getMealPlanConfig(
    userProfile.meal_plan_type,
    userProfile.selected_meals
  )

  // 1. Wybierz przepisy dla każdego typu posiłku (synchronicznie, bez DB)
  for (const mealType of mealConfig.mealTypes) {
    const calorieRange = calculateMealCalorieRange(
      userProfile.target_calories,
      mealType,
      mealConfig
    )

    // Użyj cached version zamiast async selectRecipeForMeal
    const result = selectRecipeForMealCached(
      cache,
      mealType,
      calorieRange,
      usedRecipeIds
    )

    if (!result) {
      throw new Error(
        `Nie znaleziono przepisu dla ${mealType} w przedziale ${Math.round(calorieRange.target * (1 - EXTENDED_CALORIE_TOLERANCE))}-${Math.round(calorieRange.target * (1 + EXTENDED_CALORIE_TOLERANCE))} kcal (rozszerzony zakres)`
      )
    }

    const { recipe, ingredientOverrides } = result

    usedRecipeIds.add(recipe.id)
    selectedRecipes.push(recipe)
    dayPlan.push({
      user_id: userId,
      recipe_id: recipe.id,
      meal_date: date,
      meal_type: mealType,
      is_eaten: false,
      ingredient_overrides: ingredientOverrides
        ? JSON.parse(
            JSON.stringify(
              ingredientOverrides.map((o) => ({
                ...o,
                auto_adjusted: true,
              }))
            )
          )
        : null,
    })
  }

  // 2. Optymalizuj plan dnia
  const optimizedPlan = optimizeDayPlan(dayPlan, selectedRecipes, {
    target_calories: userProfile.target_calories,
    target_protein_g: userProfile.target_protein_g,
    target_carbs_g: userProfile.target_carbs_g,
    target_fats_g: userProfile.target_fats_g,
  })

  return optimizedPlan
}

/**
 * Generuje plan posiłków dla pojedynczego dnia z automatyczną optymalizacją
 *
 * @param userId - ID użytkownika
 * @param date - Data w formacie YYYY-MM-DD
 * @param userProfile - Profil użytkownika z celami makroskładników i konfiguracją posiłków
 * @returns Lista zaplanowanych posiłków według konfiguracji użytkownika z ingredient_overrides
 * @throws Error jeśli nie udało się znaleźć przepisów
 */
export async function generateDayPlan(
  userId: string,
  date: string,
  userProfile: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
    meal_plan_type: Enums<'meal_plan_type_enum'>
    selected_meals: Enums<'meal_type_enum'>[] | null
  }
): Promise<PlannedMealInsert[]> {
  const dayPlan: PlannedMealInsert[] = []
  const selectedRecipes: RecipeWithIngredients[] = []
  const usedRecipeIds = new Set<number>()

  // Pobierz konfigurację posiłków dla użytkownika
  const mealConfig = getMealPlanConfig(
    userProfile.meal_plan_type,
    userProfile.selected_meals
  )

  // 1. Wybierz przepisy dla każdego typu posiłku według konfiguracji
  for (const mealType of mealConfig.mealTypes) {
    // Oblicz przedział kaloryczny dla posiłku (z uwzględnieniem konfiguracji)
    const calorieRange = calculateMealCalorieRange(
      userProfile.target_calories,
      mealType,
      mealConfig
    )

    // Wybierz przepis - dla przekąsek mapuj na 'snack' jeśli nie ma dedykowanych przepisów
    const searchMealType = getMealTypeForSearch(mealType)

    const result = await selectRecipeForMeal(
      searchMealType,
      calorieRange,
      usedRecipeIds
    )

    if (!result) {
      throw new Error(
        `Nie znaleziono przepisu dla ${mealType} w przedziale ${Math.round(calorieRange.target * (1 - EXTENDED_CALORIE_TOLERANCE))}-${Math.round(calorieRange.target * (1 + EXTENDED_CALORIE_TOLERANCE))} kcal (rozszerzony zakres)`
      )
    }

    const { recipe, ingredientOverrides } = result

    // Dodaj do planu dnia i listy wybranych przepisów
    usedRecipeIds.add(recipe.id)
    selectedRecipes.push(recipe)
    dayPlan.push({
      user_id: userId,
      recipe_id: recipe.id,
      meal_date: date,
      meal_type: mealType, // Zachowaj oryginalny typ (snack_morning/snack_afternoon)
      is_eaten: false,
      // Użyj nadpisań ze skalowania jeśli istnieją
      ingredient_overrides: ingredientOverrides
        ? JSON.parse(
            JSON.stringify(
              ingredientOverrides.map((o) => ({
                ...o,
                auto_adjusted: true,
              }))
            )
          )
        : null,
    })
  }

  // 2. Optymalizuj plan dnia
  const optimizedPlan = optimizeDayPlan(dayPlan, selectedRecipes, {
    target_calories: userProfile.target_calories,
    target_protein_g: userProfile.target_protein_g,
    target_carbs_g: userProfile.target_carbs_g,
    target_fats_g: userProfile.target_fats_g,
  })

  return optimizedPlan
}

/**
 * Mapuje typ posiłku na typ używany podczas wyszukiwania przepisów
 * Dla przekąsek porannych i popołudniowych szuka przepisów oznaczonych jako 'snack'
 *
 * @param mealType - Typ posiłku
 * @returns Typ posiłku do wyszukiwania w bazie przepisów
 */
function getMealTypeForSearch(
  mealType: Enums<'meal_type_enum'>
): Enums<'meal_type_enum'> {
  if (mealType === 'snack_morning' || mealType === 'snack_afternoon') {
    return 'snack'
  }
  return mealType
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
    dates.push(formatLocalDate(date))
  }

  return dates
}

/**
 * Główna funkcja - generuje 7-dniowy plan posiłków dla użytkownika
 *
 * Proces:
 * 1. Generuje daty dla kolejnych 7 dni (od dzisiaj)
 * 2. Dla każdego dnia generuje posiłki według konfiguracji użytkownika:
 *    - 3+2: 5 posiłków (śniadanie, przekąska poranna, obiad, przekąska popołudniowa, kolacja)
 *    - 3+1: 4 posiłki (śniadanie, obiad, przekąska popołudniowa, kolacja)
 *    - 3: 3 posiłki (śniadanie, obiad, kolacja)
 *    - 2: 2 posiłki (wybrane przez użytkownika)
 * 3. Dobiera przepisy zgodne z przedziałem kalorycznym (target ± 15%)
 * 4. Zapewnia różnorodność (brak powtórzeń w tym samym dniu)
 *
 * @param userProfile - Profil użytkownika z celami żywieniowymi i konfiguracją posiłków
 * @param startDate - Data początkowa (domyślnie dzisiaj)
 * @returns Lista zaplanowanych posiłków gotowych do wstawienia do bazy
 * @throws Error jeśli nie udało się wygenerować planu
 *
 * @example
 * ```typescript
 * const profile = {
 *   id: 'user-uuid',
 *   target_calories: 1800,
 *   target_carbs_g: 68,
 *   target_protein_g: 158,
 *   target_fats_g: 100,
 *   meal_plan_type: '3_main_2_snacks',
 *   selected_meals: null
 * }
 *
 * const plan = await generateWeeklyPlan(profile)
 * // plan.length === 35 (7 dni × 5 posiłków dla '3_main_2_snacks')
 * ```
 */
export async function generateWeeklyPlan(
  userProfile: UserProfile,
  startDate: Date = new Date()
): Promise<PlannedMealInsert[]> {
  try {
    // 1. Prefetch wszystkich przepisów w jednym zapytaniu (eliminacja N+1 queries)
    // Filters out recipes requiring equipment the user doesn't have
    const cache = await prefetchAllRecipes(userProfile.excluded_equipment_ids)

    const weeklyPlan: PlannedMealInsert[] = []

    // Pobierz konfigurację posiłków dla użytkownika
    const mealConfig = getMealPlanConfig(
      userProfile.meal_plan_type,
      userProfile.selected_meals
    )
    const expectedMealsPerDay = mealConfig.mealTypes.length

    // 2. Generuj daty dla 7 dni
    const dates = generateDates(startDate, DAYS_TO_GENERATE)

    // 3. Dla każdego dnia wygeneruj plan posiłków używając cache'u (bez DB queries)
    for (const date of dates) {
      const dayPlan = generateDayPlanCached(
        userProfile.id,
        date,
        {
          target_calories: userProfile.target_calories,
          target_protein_g: userProfile.target_protein_g,
          target_carbs_g: userProfile.target_carbs_g,
          target_fats_g: userProfile.target_fats_g,
          meal_plan_type: userProfile.meal_plan_type,
          selected_meals: userProfile.selected_meals,
        },
        cache
      )

      weeklyPlan.push(...dayPlan)
    }

    // 4. Walidacja - upewnij się, że wygenerowano poprawną liczbę posiłków
    const expectedTotalMeals = DAYS_TO_GENERATE * expectedMealsPerDay
    if (weeklyPlan.length !== expectedTotalMeals) {
      throw new Error(
        `Nieprawidłowa liczba posiłków w planie: ${weeklyPlan.length}, oczekiwano ${expectedTotalMeals}`
      )
    }

    return weeklyPlan
  } catch (error) {
    logErrorLevel(error, {
      source: 'meal-plan-generator.generateWeeklyPlan',
      userId: userProfile.id,
      metadata: { mealPlanType: userProfile.meal_plan_type },
    })
    throw error
  }
}

/**
 * Generuje posiłki dla określonych dat z optymalizacją N+1 queries
 *
 * Używa jednego zapytania do prefetch wszystkich przepisów, a następnie
 * generuje plan dla każdej daty bez dodatkowych zapytań do bazy danych.
 *
 * @param userId - ID użytkownika
 * @param dates - Lista dat w formacie YYYY-MM-DD
 * @param userProfile - Profil użytkownika z celami makroskładników
 * @returns Lista zaplanowanych posiłków dla wszystkich dat
 * @throws Error jeśli nie udało się wygenerować planu
 *
 * @example
 * ```typescript
 * const meals = await generateMealsForDates(
 *   'user-123',
 *   ['2025-01-15', '2025-01-16', '2025-01-17'],
 *   {
 *     target_calories: 1800,
 *     target_protein_g: 135,
 *     target_carbs_g: 45,
 *     target_fats_g: 120,
 *     meal_plan_type: '3_main_2_snacks',
 *     selected_meals: null,
 *     excluded_equipment_ids: []
 *   }
 * )
 * ```
 */
export async function generateMealsForDates(
  userId: string,
  dates: string[],
  userProfile: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
    meal_plan_type: Enums<'meal_plan_type_enum'>
    selected_meals: Enums<'meal_type_enum'>[] | null
    excluded_equipment_ids?: number[] | null
  }
): Promise<PlannedMealInsert[]> {
  if (dates.length === 0) {
    return []
  }

  try {
    // 1. Prefetch wszystkich przepisów w jednym zapytaniu (eliminacja N+1 queries)
    const cache = await prefetchAllRecipes(
      userProfile.excluded_equipment_ids ?? []
    )

    const allMeals: PlannedMealInsert[] = []

    // 2. Dla każdej daty wygeneruj plan używając cache'u (bez DB queries)
    for (const date of dates) {
      const dayPlan = generateDayPlanCached(
        userId,
        date,
        {
          target_calories: userProfile.target_calories,
          target_protein_g: userProfile.target_protein_g,
          target_carbs_g: userProfile.target_carbs_g,
          target_fats_g: userProfile.target_fats_g,
          meal_plan_type: userProfile.meal_plan_type,
          selected_meals: userProfile.selected_meals,
        },
        cache
      )

      allMeals.push(...dayPlan)
    }

    return allMeals
  } catch (error) {
    logErrorLevel(error, {
      source: 'meal-plan-generator.generateMealsForDates',
      userId,
      metadata: {
        datesCount: dates.length,
        mealPlanType: userProfile.meal_plan_type,
      },
    })
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
    logErrorLevel(error, {
      source: 'meal-plan-generator.checkExistingPlan',
      userId,
      metadata: { startDate, endDate, errorCode: error.code },
    })
    throw new Error(`Nie udało się sprawdzić planu: ${error.message}`)
  }

  return count || 0
}

/**
 * Znajduje dni, które nie mają jeszcze kompletnego planu posiłków
 *
 * @param userId - ID użytkownika
 * @param dates - Lista dat do sprawdzenia (YYYY-MM-DD)
 * @param mealPlanType - Typ planu posiłków użytkownika
 * @param selectedMeals - Wybrane posiłki (dla '2_main')
 * @returns Lista dat bez kompletnego planu
 */
export async function findMissingDays(
  userId: string,
  dates: string[],
  mealPlanType: Enums<'meal_plan_type_enum'> = '3_main',
  selectedMeals: Enums<'meal_type_enum'>[] | null = null
): Promise<string[]> {
  const supabase = createAdminClient()

  // Pobierz konfigurację posiłków
  const mealConfig = getMealPlanConfig(mealPlanType, selectedMeals)
  const expectedMealsCount = mealConfig.mealTypes.length

  // Pobierz wszystkie posiłki dla tych dat
  const { data: existingMeals, error } = await supabase
    .from('planned_meals')
    .select('meal_date, meal_type')
    .eq('user_id', userId)
    .in('meal_date', dates)

  if (error) {
    logErrorLevel(error, {
      source: 'meal-plan-generator.findMissingDays',
      userId,
      metadata: { dates, mealPlanType, errorCode: error.code },
    })
    throw new Error(
      `Nie udało się sprawdzić istniejących dni: ${error.message}`
    )
  }

  // Grupuj posiłki według dnia
  const mealsByDate = new Map<string, Set<string>>()
  for (const meal of existingMeals || []) {
    if (!mealsByDate.has(meal.meal_date)) {
      mealsByDate.set(meal.meal_date, new Set())
    }
    mealsByDate.get(meal.meal_date)!.add(meal.meal_type)
  }

  // Znajdź dni, które nie mają wszystkich wymaganych posiłków
  const missingDays: string[] = []
  for (const date of dates) {
    const mealsForDay = mealsByDate.get(date)
    const hasAllMeals = mealsForDay?.size === expectedMealsCount
    if (!hasAllMeals) {
      missingDays.push(date)
    }
  }

  return missingDays
}

/**
 * Usuwa stare plany posiłków (dni przed dzisiejszym)
 *
 * Zachowuje tylko plany na obecny tydzień (od dzisiaj + 6 dni naprzód).
 * Wszystkie starsze plany są usuwane z bazy danych.
 *
 * @param userId - ID użytkownika
 * @returns Liczba usuniętych rekordów
 */
export async function cleanupOldMealPlans(userId: string): Promise<number> {
  const supabase = createAdminClient()

  // Dzisiejsza data (początek dnia)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatLocalDate(today)

  // Usuń wszystkie plany starsze niż dzisiaj
  const { data, error } = await supabase
    .from('planned_meals')
    .delete()
    .eq('user_id', userId)
    .lt('meal_date', todayStr)
    .select('id')

  if (error) {
    logErrorLevel(error, {
      source: 'meal-plan-generator.cleanupOldMealPlans',
      userId,
      metadata: { todayStr, errorCode: error.code },
    })
    throw new Error(`Nie udało się usunąć starych planów: ${error.message}`)
  }

  const deletedCount = data?.length || 0
  return deletedCount
}
