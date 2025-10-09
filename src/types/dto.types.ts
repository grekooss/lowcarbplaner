/**
 * DTO (Data Transfer Object) and Command Model Types
 *
 * Ten plik zawiera wszystkie typy DTO i Command Models używane w API.
 * Wszystkie typy bazują na modelach bazy danych z `database.types.ts`.
 */

import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from './database.types'

// ============================================================================
// Common Types
// ============================================================================

/**
 * Typ dla instrukcji przepisu (parsowany z JSON)
 */
export type RecipeInstructions = {
  step: number
  description: string
}[]

/**
 * Typ dla nadpisań składników (parsowany z JSON w planned_meals.ingredient_overrides)
 */
export type IngredientOverrides = {
  ingredient_id: number
  new_amount: number
}[]

// ============================================================================
// 1. ONBOARDING API
// ============================================================================

/**
 * Command Model: Dane wejściowe z formularza onboardingu
 * Bazuje na TablesInsert<"profiles"> z wybranymi polami
 */
export type OnboardingCommand = Pick<
  TablesInsert<'profiles'>,
  | 'gender'
  | 'age'
  | 'weight_kg'
  | 'height_cm'
  | 'activity_level'
  | 'goal'
  | 'weight_loss_rate_kg_week'
>

/**
 * DTO: Obliczone cele kaloryczne i makroskładniki
 * Zwracane po zakończeniu onboardingu
 */
export type OnboardingResultDTO = Pick<
  Tables<'profiles'>,
  'target_calories' | 'target_protein_g' | 'target_carbs_g' | 'target_fats_g'
>

// ============================================================================
// 2. PROFILE API
// ============================================================================

/**
 * DTO: Kompletny profil użytkownika
 * Bazuje na Tables<"profiles"> bez pól systemowych
 */
export type ProfileDTO = Omit<
  Tables<'profiles'>,
  'id' | 'created_at' | 'updated_at'
>

/**
 * Command Model: Aktualizacja profilu użytkownika
 * Bazuje na TablesUpdate<"profiles"> z wybranymi polami
 */
export type UpdateProfileCommand = Pick<
  TablesUpdate<'profiles'>,
  | 'gender'
  | 'age'
  | 'weight_kg'
  | 'height_cm'
  | 'activity_level'
  | 'goal'
  | 'weight_loss_rate_kg_week'
>

// ============================================================================
// 3. MEAL PLAN API
// ============================================================================

/**
 * DTO: Pojedynczy składnik z ilością w przepisie
 * Bazuje na Tables<"recipe_ingredients"> + join z Tables<"ingredients">
 */
export type IngredientDTO = {
  id: number
  name: string
  amount: number
  unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
  category: Enums<'ingredient_category_enum'>
  is_scalable: boolean
}

/**
 * DTO: Pojedynczy przepis z zagnieżdżonymi składnikami
 * Bazuje na Tables<"recipes"> + recipe_ingredients + ingredients
 */
export type RecipeDTO = {
  id: number
  name: string
  instructions: RecipeInstructions
  meal_types: Enums<'meal_type_enum'>[]
  tags: string[] | null
  image_url: string | null
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
  ingredients: IngredientDTO[]
}

/**
 * DTO: Pojedynczy zaplanowany posiłek z przepisem
 * Bazuje na Tables<"planned_meals"> + join z RecipeDTO
 */
export type PlannedMealDTO = {
  id: number
  meal_date: string
  meal_type: Enums<'meal_type_enum'>
  is_eaten: boolean
  ingredient_overrides: IngredientOverrides | null
  recipe: RecipeDTO
  created_at: string
}

/**
 * DTO: Plan posiłków (lista zaplanowanych posiłków)
 */
export type MealPlanDTO = {
  meals: PlannedMealDTO[]
}

/**
 * Command Model: Generowanie nowego planu posiłków
 */
export type GenerateMealPlanCommand = {
  start_date: string // ISO date string (YYYY-MM-DD)
  preferences?: {
    excluded_ingredients?: number[] // IDs składników do wykluczenia
    preferred_meal_types?: Enums<'meal_type_enum'>[] // Preferowane typy posiłków
  }
}

// ============================================================================
// 4. DAILY PROGRESS API
// ============================================================================

/**
 * DTO: Podsumowanie pojedynczego posiłku w widoku dziennym
 * Bazuje na Tables<"planned_meals"> z obliczonymi wartościami odżywczymi
 */
export type MealSummaryDTO = {
  id: number
  meal_type: Enums<'meal_type_enum'>
  is_eaten: boolean
  recipe_name: string
  recipe_id: number
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
}

/**
 * DTO: Dzienny postęp użytkownika
 * Agregacja z planned_meals + profiles
 */
export type DailyProgressDTO = {
  date: string // ISO date string (YYYY-MM-DD)
  consumed_calories: number
  consumed_protein_g: number
  consumed_carbs_g: number
  consumed_fats_g: number
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fats_g: number
  meals: MealSummaryDTO[]
}

// ============================================================================
// 5. MARK MEAL AS EATEN API
// ============================================================================

/**
 * Command Model: Oznaczenie posiłku jako zjedzony/niezjedzony
 */
export type MarkMealEatenCommand = {
  is_eaten: boolean
}

/**
 * DTO: Status posiłku po aktualizacji
 */
export type MealStatusDTO = Pick<Tables<'planned_meals'>, 'id' | 'is_eaten'> & {
  updated_at?: string
}

// ============================================================================
// 6. SHOPPING LIST API
// ============================================================================

/**
 * DTO: Pojedynczy element listy zakupów
 * Agregacja z recipe_ingredients + ingredients
 */
export type ShoppingItemDTO = {
  ingredient_id: number
  ingredient_name: string
  total_amount: number
  unit: string
  category: Enums<'ingredient_category_enum'>
  is_purchased: boolean // Stan kliencki (przechowywany w localStorage/Zustand)
}

/**
 * DTO: Kompletna lista zakupów
 */
export type ShoppingListDTO = {
  items: ShoppingItemDTO[]
  categories: Enums<'ingredient_category_enum'>[] // Unikalne kategorie
}

// ============================================================================
// 7. MODIFY INGREDIENT AMOUNT API
// ============================================================================

/**
 * Command Model: Modyfikacja ilości składnika w posiłku
 */
export type ModifyIngredientCommand = {
  new_amount: number // Nowa ilość składnika (w gramach lub sztukach)
}

/**
 * DTO: Zaktualizowany posiłek po modyfikacji składnika
 * Bazuje na Tables<"planned_meals"> z zaktualizowanymi ingredient_overrides
 */
export type ModifiedMealDTO = {
  id: number
  ingredient_overrides: IngredientOverrides
  updated_recipe: RecipeDTO // Przepis z przeliczonymi wartościami odżywczymi
}

// ============================================================================
// 8. SWAP MEAL API
// ============================================================================

/**
 * Command Model: Wymiana posiłku na inny z tej samej kategorii
 */
export type SwapMealCommand = {
  meal_type: Enums<'meal_type_enum'> // Typ posiłku (breakfast, lunch, dinner)
}

/**
 * DTO: Nowy posiłek po wymianie
 * Bazuje na Tables<"planned_meals"> + RecipeDTO
 */
export type SwappedMealDTO = {
  id: number
  meal_date: string
  meal_type: Enums<'meal_type_enum'>
  recipe: RecipeDTO
  created_at: string
}

// ============================================================================
// Error Response Types
// ============================================================================

/**
 * Standardowy format odpowiedzi błędu API
 */
export type ApiErrorResponse = {
  error: {
    message: string
    code?: string
    details?: unknown
  }
}

/**
 * Standardowy format odpowiedzi sukcesu API
 */
export type ApiSuccessResponse<T> = {
  data: T
  message?: string
}
