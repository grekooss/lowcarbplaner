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
 * Format w bazie: Array of steps [{"step": 1, "description": "..."}, ...]
 */
export type RecipeInstructions = {
  step: number
  description: string
}[]

/**
 * Typ dla nadpisań składników (parsowany z JSON w planned_meals.ingredient_overrides)
 *
 * @property auto_adjusted - true jeśli zmiana została wykonana automatycznie przez algorytm optymalizacji,
 *                           false/undefined jeśli zmiana została wykonana ręcznie przez użytkownika
 */
export type IngredientOverrides = {
  ingredient_id: number
  new_amount: number
  auto_adjusted?: boolean
}[]

// ============================================================================
// 1. ONBOARDING API
// ============================================================================

/**
 * Command Model: Dane wejściowe z formularza onboardingu
 * Bazuje na TablesInsert<"profiles"> z wybranymi polami
 * eating_start_time i eating_end_time są wymagane (non-optional)
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
  | 'meal_plan_type'
  | 'macro_ratio'
> & {
  eating_start_time: string
  eating_end_time: string
}

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
 * Command Model: Tworzenie profilu użytkownika (POST /api/profile)
 * Rozszerza OnboardingCommand o disclaimer_accepted_at
 */
export type CreateProfileCommand = OnboardingCommand & {
  disclaimer_accepted_at: string
}

/**
 * DTO: Odpowiedź dla POST /api/profile
 * Zawiera pełny profil użytkownika z obliczonymi celami żywieniowymi
 */
export type CreateProfileResponseDTO = {
  id: string
  email: string
  gender: Enums<'gender_enum'>
  age: number
  weight_kg: number
  height_cm: number
  activity_level: Enums<'activity_level_enum'>
  goal: Enums<'goal_enum'>
  weight_loss_rate_kg_week: number | null
  meal_plan_type: Enums<'meal_plan_type_enum'>
  eating_start_time: string
  eating_end_time: string
  selected_meals: Enums<'meal_type_enum'>[] | null
  macro_ratio: Enums<'macro_ratio_enum'>
  disclaimer_accepted_at: string
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
  created_at: string
  updated_at: string
}

/**
 * DTO: Kompletny profil użytkownika (GET /api/profile/me, PATCH /api/profile/me)
 * Bazuje na Tables<"profiles"> bez pól systemowych
 */
export type ProfileDTO = Omit<
  Tables<'profiles'>,
  'id' | 'created_at' | 'updated_at'
>

/**
 * Command Model: Aktualizacja profilu użytkownika (PATCH /api/profile/me)
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
  | 'meal_plan_type'
  | 'eating_start_time'
  | 'eating_end_time'
  | 'macro_ratio'
>

/**
 * DTO: Odpowiedź dla POST /api/profile/me/generate-plan
 */
export type GeneratePlanResponseDTO = {
  status: 'success' | 'error'
  message: string
  generated_days: number
}

// ============================================================================
// 3. MEAL PLAN API
// ============================================================================

/**
 * DTO: Pojedyncze naczynie/sprzęt kuchenny
 * Bazuje na Tables<'equipment'> + Tables<'recipe_equipment'>
 */
export type EquipmentDTO = {
  id: number
  name: string
  name_plural: string | null
  category: Enums<'equipment_category_enum'>
  icon_name: string | null
  quantity: number
  notes: string | null
}

/**
 * DTO: Pojedynczy składnik z ilością w przepisie
 * Bazuje na Tables<'recipe_ingredients', { schema: 'public' }> + join z Tables<'ingredients', { schema: 'public' }>
 *
 * Jednostki:
 * - amount/unit: oryginalna wartość w gramach/ml (używana do obliczeń i modyfikacji ±)
 * - display_amount/display_unit: przyjazna jednostka np. "1 sztuka" (używana do wyświetlania)
 *
 * Węglowodany:
 * - carbs_g: węglowodany całkowite (Total Carbs)
 * - fiber_g: błonnik
 * - polyols_g: poliole (alkohole cukrowe: erytrytol, ksylitol, maltitol, sorbitol)
 * - net_carbs_g: węglowodany netto (carbs_g - fiber_g - polyols_g) - kluczowe dla diety keto/low-carb
 */
export type IngredientDTO = {
  id: number
  name: string
  /** Ilość w oryginalnej jednostce (g/ml) - używana do obliczeń */
  amount: number
  /** Oryginalna jednostka (g/ml) - używana do obliczeń */
  unit: string
  /** Ilość w przyjaznej jednostce (np. 1 sztuka) - do wyświetlania */
  display_amount: number
  /** Przyjazna jednostka (np. sztuka) - do wyświetlania, null jeśli brak konwersji */
  display_unit: string | null
  calories: number
  protein_g: number
  /** Węglowodany całkowite (Total Carbs) */
  carbs_g: number
  /** Błonnik pokarmowy */
  fiber_g: number
  /** Poliole (alkohole cukrowe: erytrytol, ksylitol, maltitol, sorbitol) */
  polyols_g: number
  /** Węglowodany netto (Net Carbs = carbs_g - fiber_g - polyols_g) - kluczowe dla keto */
  net_carbs_g: number
  fats_g: number
  /** Tłuszcze nasycone */
  saturated_fat_g: number
  category: Enums<'ingredient_category_enum'>
  is_scalable: boolean
  step_number: number | null
}

/**
 * DTO: Pojedynczy przepis z zagnieżdżonymi składnikami
 * Bazuje na Tables<'recipes', { schema: 'public' }> + recipe_ingredients + ingredients
 *
 * Węglowodany:
 * - total_carbs_g: węglowodany całkowite (Total Carbs)
 * - total_fiber_g: błonnik całkowity
 * - total_polyols_g: poliole całkowite (alkohole cukrowe)
 * - total_net_carbs_g: węglowodany netto (total_carbs_g - total_fiber_g - total_polyols_g) - kluczowe dla keto
 */
export type RecipeDTO = {
  id: number
  /** SEO-friendly URL slug (e.g., "salatka-grecka-z-feta") */
  slug: string
  name: string
  instructions: RecipeInstructions
  meal_types: Enums<'meal_type_enum'>[]
  tags: string[] | null
  image_url: string | null
  difficulty_level: Enums<'difficulty_level_enum'>
  average_rating: number | null
  reviews_count: number
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  total_calories: number | null
  total_protein_g: number | null
  /** Węglowodany całkowite (Total Carbs) */
  total_carbs_g: number | null
  /** Błonnik całkowity */
  total_fiber_g: number | null
  /** Poliole całkowite (alkohole cukrowe: erytrytol, ksylitol, maltitol, sorbitol) */
  total_polyols_g: number | null
  /** Węglowodany netto (Net Carbs = total_carbs_g - total_fiber_g - total_polyols_g) - kluczowe dla keto */
  total_net_carbs_g: number | null
  total_fats_g: number | null
  /** Całkowite tłuszcze nasycone */
  total_saturated_fat_g: number | null
  ingredients: IngredientDTO[]
  equipment: EquipmentDTO[]
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
  /** Węglowodany całkowite (Total Carbs) */
  carbs_g: number
  /** Błonnik pokarmowy */
  fiber_g: number
  /** Poliole (alkohole cukrowe) */
  polyols_g: number
  /** Węglowodany netto (Net Carbs = carbs_g - fiber_g - polyols_g) */
  net_carbs_g: number
  fats_g: number
  /** Tłuszcze nasycone */
  saturated_fat_g: number
}

/**
 * DTO: Dzienny postęp użytkownika
 * Agregacja z planned_meals + profiles
 */
export type DailyProgressDTO = {
  date: string // ISO date string (YYYY-MM-DD)
  consumed_calories: number
  consumed_protein_g: number
  /** Spożyte węglowodany całkowite (Total Carbs) */
  consumed_carbs_g: number
  /** Spożyty błonnik */
  consumed_fiber_g: number
  /** Spożyte poliole (alkohole cukrowe) */
  consumed_polyols_g: number
  /** Spożyte węglowodany netto (Net Carbs = carbs - fiber - polyols) */
  consumed_net_carbs_g: number
  consumed_fats_g: number
  /** Spożyte tłuszcze nasycone */
  consumed_saturated_fat_g: number
  target_calories: number
  target_protein_g: number
  /** Dzienny cel węglowodanów całkowitych */
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
 * DTO: Odpowiedź API dla listy zakupów (zgodna ze specyfikacją API)
 * Format: tablica kategorii ze składnikami
 */
export type ShoppingListResponseDTO = {
  category: Enums<'ingredient_category_enum'>
  items: {
    name: string
    total_amount: number
    unit: string
  }[]
}[]

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
// 9. REPLACEMENT RECIPES API
// ============================================================================

/**
 * DTO: Zamiennik przepisu dla GET /planned-meals/{id}/replacements
 * Zawiera przepis z obliczoną różnicą kaloryczną względem oryginału
 */
export type ReplacementRecipeDTO = {
  id: number
  /** SEO-friendly URL slug */
  slug: string
  name: string
  image_url: string | null
  meal_types: Enums<'meal_type_enum'>[]
  difficulty_level: Enums<'difficulty_level_enum'>
  total_calories: number | null
  total_protein_g: number | null
  /** Węglowodany całkowite (Total Carbs) */
  total_carbs_g: number | null
  /** Błonnik całkowity */
  total_fiber_g: number | null
  /** Poliole całkowite (alkohole cukrowe) */
  total_polyols_g: number | null
  /** Węglowodany netto (Net Carbs = carbs - fiber - polyols) */
  total_net_carbs_g: number | null
  total_fats_g: number | null
  /** Całkowite tłuszcze nasycone */
  total_saturated_fat_g: number | null
  calorie_diff: number // Różnica kaloryczna względem oryginalnego przepisu
}

// ============================================================================
// 10. FEEDBACK API
// ============================================================================

/**
 * Command Model: Tworzenie nowego feedbacku (POST /api/feedback)
 */
export type CreateFeedbackCommand = {
  content: string
  metadata?: Record<string, unknown>
}

/**
 * DTO: Odpowiedź dla POST /api/feedback
 * Zawiera pełne dane zapisanego feedbacku
 */
export type FeedbackResponseDTO = {
  id: number
  user_id: string
  content: string
  metadata: Record<string, unknown> | null
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
