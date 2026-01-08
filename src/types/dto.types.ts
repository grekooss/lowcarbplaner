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
 * DTO: Składnik-przepis (gdy przepis używa innego przepisu jako składnika)
 * np. "Tosty keto z awokado" używa "Chleb keto" jako składnika
 */
export type RecipeComponentDTO = {
  /** ID przepisu-komponentu */
  recipe_id: number
  /** SEO-friendly slug przepisu-komponentu */
  recipe_slug: string
  /** Nazwa przepisu-komponentu */
  recipe_name: string
  /** Wymagana ilość */
  required_amount: number
  /** Jednostka (g, ml) */
  unit: string
  /** Kalorie dla tej ilości */
  calories: number | null
  /** Białko dla tej ilości */
  protein_g: number | null
  /** Węglowodany dla tej ilości */
  carbs_g: number | null
  /** Tłuszcze dla tej ilości */
  fats_g: number | null
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

  // ==========================================================================
  // Servings / Porcje
  // ==========================================================================
  /** Liczba porcji z przepisu bazowego (np. chleb = 10 kromek, curry = 2 porcje) */
  base_servings: number
  /** Jednostka porcji w języku polskim (porcja, kromka, sztuka, udko) */
  serving_unit: string
  /** Czy przepis nadaje się do batch cooking (przygotowania większej ilości) */
  is_batch_friendly: boolean
  /** Sugerowana ilość porcji do przygotowania na raz */
  suggested_batch_size: number | null
  /** Minimalna liczba porcji do przygotowania (np. chleb = 10, bo cały bochenek) */
  min_servings: number

  // ==========================================================================
  // Wartości odżywcze (dla CAŁEGO przepisu, nie na porcję!)
  // ==========================================================================
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

  // ==========================================================================
  // Wartości odżywcze NA PORCJĘ (obliczone: total / base_servings)
  // ==========================================================================
  /** Kalorie na 1 porcję */
  calories_per_serving: number | null
  /** Białko na 1 porcję */
  protein_per_serving: number | null
  /** Węglowodany na 1 porcję */
  carbs_per_serving: number | null
  /** Węglowodany netto na 1 porcję */
  net_carbs_per_serving: number | null
  /** Tłuszcze na 1 porcję */
  fats_per_serving: number | null

  ingredients: IngredientDTO[]
  equipment: EquipmentDTO[]
  /** Przepisy-składniki (gdy przepis używa innych przepisów jako składników) */
  components: RecipeComponentDTO[]
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

// ============================================================================
// 11. MEAL PREP v2.0 API
// ============================================================================

/**
 * Typ skalowania czasu kroku
 */
export type TimeScalingType = 'linear' | 'constant' | 'logarithmic'

/**
 * Typ akcji instrukcji przepisu
 */
export type InstructionActionType =
  | 'active'
  | 'passive'
  | 'prep'
  | 'assembly'
  | 'checkpoint'

/**
 * Typ checkpointu bezpieczeństwa
 */
export type CheckpointType =
  | 'temperature'
  | 'visual'
  | 'texture'
  | 'safety'
  | 'equipment_ready'

/**
 * Kategoria konfliktów smakowych
 */
export type FlavorConflictCategory =
  | 'neutral'
  | 'fish'
  | 'garlic_onion'
  | 'spicy'
  | 'sweet'
  | 'smoke'

/**
 * Status sesji gotowania
 */
export type CookingSessionStatus =
  | 'planned'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'cancelled'

/**
 * Lokalizacja przechowywania w wirtualnej spiżarni
 */
export type StorageLocation = 'fridge' | 'freezer' | 'pantry' | 'counter'

/**
 * Wskazówki sensoryczne dla kroku przepisu
 */
export interface SensoryCues {
  visual?: string
  sound?: string
  smell?: string
  texture?: string
}

/**
 * DTO: Kategoria akcji przygotowawczej (Mise en Place)
 */
export interface PrepActionCategoryDTO {
  id: number
  name: string
  name_plural: string | null
  description: string | null
  icon_name: string | null
  sort_order: number
}

/**
 * DTO: Instrukcja przepisu (z tabeli recipe_instructions)
 */
export interface RecipeInstructionDTO {
  id: number
  recipe_id: number
  step_number: number
  description: string

  // Timing
  active_minutes: number
  passive_minutes: number
  time_scaling_type: TimeScalingType
  time_scaling_factor: number

  // Akcja
  action_type: InstructionActionType
  is_parallelizable: boolean

  // Sprzęt
  equipment_ids: number[]
  equipment_slot_count: number
  required_temperature_celsius: number | null

  // Mise en Place
  prep_action_category_id: number | null
  prep_action_category?: PrepActionCategoryDTO

  // Checkpointy
  checkpoint_condition: string | null
  checkpoint_type: CheckpointType | null

  // Wskazówki
  sensory_cues: SensoryCues
  is_critical_timing: boolean
}

/**
 * DTO: Sesja gotowania
 */
export interface CookingSessionDTO {
  id: string
  user_id: string
  planned_date: string
  planned_start_time: string | null
  estimated_total_minutes: number | null
  actual_start_at: string | null
  actual_end_at: string | null
  status: CookingSessionStatus
  current_step_index: number
  notes: string | null
  last_sync_at: string
  active_device_id: string | null
  created_at: string
  updated_at: string

  // Relacje
  meals?: SessionMealDTO[]
  step_progress?: SessionStepProgressDTO[]
  adjustments?: SessionAdjustmentDTO[]
}

/**
 * DTO: Posiłek w sesji gotowania
 */
export interface SessionMealDTO {
  id: number
  session_id: string
  planned_meal_id: number
  is_source_meal: boolean
  portions_to_cook: number
  cooking_order: number | null

  // Relacja
  planned_meal?: PlannedMealDTO

  // Pola pomocnicze dla UI (uzupełniane przez Server Action)
  recipe_id?: number
  portions?: number
  recipe_name?: string
  recipe_image_url?: string | null
}

/**
 * DTO: Postęp kroku w sesji
 */
export interface SessionStepProgressDTO {
  id: number
  session_id: string
  recipe_id: number
  step_number: number
  is_completed: boolean
  started_at: string | null
  completed_at: string | null
  timer_started_at: string | null
  timer_duration_seconds: number | null
  timer_paused_at: string | null
  timer_remaining_seconds: number | null
  user_notes: string | null
}

/**
 * DTO: Korekta czasowa w sesji
 */
export interface SessionAdjustmentDTO {
  id: number
  session_id: string
  step_id: number | null
  adjustment_type: 'time_add' | 'time_subtract' | 'skip' | 'repeat'
  adjustment_value: number | null
  reason: string | null
  created_at: string
}

/**
 * DTO: Pozycja w wirtualnej spiżarni
 */
export interface UserInventoryItemDTO {
  id: number
  user_id: string
  item_type: 'ingredient' | 'component' | 'meal'
  ingredient_id: number | null
  recipe_id: number | null
  quantity: number
  unit: string
  storage_location: StorageLocation
  expires_at: string | null
  source_session_id: string | null
  is_consumed: boolean
  consumed_at: string | null
  created_at: string
  updated_at: string

  // Relacje (opcjonalne)
  ingredient?: IngredientDTO
  recipe?: RecipeDTO
}

/**
 * DTO: Krok na wygenerowanej osi czasu
 */
export interface TimelineStepDTO {
  id: string
  recipe_id: number
  recipe_name: string
  step_number: number
  description: string
  action_type: InstructionActionType

  // Timing
  start_minute: number
  active_duration: number
  passive_duration: number
  total_duration: number

  // Skalowanie
  time_scaling_type: TimeScalingType
  scaled_active_duration: number
  scaled_passive_duration: number

  // Równoległość
  parallel_group_id: string | null
  can_run_parallel: boolean

  // Sprzęt
  equipment_ids: number[]
  equipment_names: string[]
  equipment_slot_count: number
  required_temperature: number | null

  // Checkpointy
  checkpoint_type: CheckpointType | null
  checkpoint_condition: string | null

  // Status
  status: 'pending' | 'active' | 'waiting' | 'completed' | 'skipped'

  // Pozostałe
  sensory_cues: SensoryCues
  is_critical: boolean
  prep_action_category_id: number | null
}

/**
 * DTO: Grupa Mise en Place
 */
export interface MisePlaceGroupDTO {
  id: string
  category: PrepActionCategoryDTO
  tasks: {
    recipe_id: number
    recipe_name: string
    step_number: number
    description: string
    estimated_minutes: number
    ingredients: string[]
  }[]
  total_estimated_minutes: number
}

/**
 * DTO: Konflikt zasobów
 */
export interface ResourceConflictDTO {
  type: 'equipment_slot' | 'temperature' | 'flavor'
  equipment_id: number
  equipment_name: string
  conflicting_steps: {
    step_id: string
    recipe_name: string
    description: string
  }[]
  resolution_suggestion: string
}

/**
 * DTO: Wygenerowana oś czasu sesji gotowania
 */
export interface CookingTimelineDTO {
  session_id: string
  total_estimated_minutes: number
  active_minutes: number
  passive_minutes: number

  // Kroki
  steps: TimelineStepDTO[]

  // Mise en Place
  mise_place_groups: MisePlaceGroupDTO[]

  // Konflikty
  resource_conflicts: ResourceConflictDTO[]

  // Sprzęt
  required_equipment: EquipmentDTO[]
  equipment_utilization: Record<number, number> // equipment_id -> % wykorzystania

  // Komponenty przepisów
  recipe_components: RecipeComponentDTO[]
  component_production_order: number[] // recipe_ids w kolejności produkcji
}

/**
 * Command Model: Tworzenie sesji gotowania
 */
export interface CreateCookingSessionCommand {
  planned_meal_ids: number[]
  planned_date: string
  planned_start_time?: string
  skill_level?: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * DTO: Rezultat tworzenia sesji gotowania
 */
export interface CreateCookingSessionResultDTO {
  session: CookingSessionDTO
  timeline: CookingTimelineDTO
}

/**
 * Command Model: Korekta czasowa w sesji
 */
export interface AddTimeAdjustmentCommand {
  step_id?: number
  adjustment_type: 'time_add' | 'time_subtract' | 'skip' | 'repeat'
  adjustment_value?: number
  reason?: string
}

/**
 * Command Model: Dodawanie do wirtualnej spiżarni
 */
export interface AddToInventoryCommand {
  item_type: 'ingredient' | 'component' | 'meal'
  ingredient_id?: number
  recipe_id?: number
  quantity: number
  unit: string
  storage_location: StorageLocation
  expires_at?: string
  source_session_id?: string
}

/**
 * DTO: Spłaszczony składnik z zagnieżdżonych przepisów
 */
export interface FlattenedIngredientDTO {
  ingredient_id: number
  name: string
  amount: number
  unit: string
  source_recipe_id: number
  source_recipe_name: string
}

/**
 * DTO: Węzeł drzewa zależności przepisów
 */
export interface RecipeDependencyNodeDTO {
  recipe_id: number
  recipe_name: string
  required_amount: number
  unit: string
  depth: number
  children: RecipeDependencyNodeDTO[]
}
