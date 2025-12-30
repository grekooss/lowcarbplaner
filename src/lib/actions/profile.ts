/**
 * Server Actions for Profile API
 *
 * Implementuje logikę biznesową dla operacji na profilach użytkowników:
 * - POST /api/profile (tworzenie profilu po onboardingu)
 * - GET /api/profile/me (pobieranie profilu zalogowanego użytkownika)
 * - PATCH /api/profile/me (aktualizacja profilu)
 *
 * @see .ai/10d01 api-profile-implementation-plan.md
 */

'use server'

import { createServerClient } from '@/lib/supabase/server'
import { calculateNutritionTargets } from '@/services/nutrition-calculator'
import { formatLocalDate } from '@/lib/utils/date-formatting'
import type {
  CreateProfileResponseDTO,
  ProfileDTO,
  UpdateProfileCommand,
  GeneratePlanResponseDTO,
} from '@/types/dto.types'
import {
  createProfileSchema,
  updateProfileSchema,
  type CreateProfileInput,
  type UpdateProfileInput,
  type CreateProfileValidated,
} from '@/lib/validation/profile'
import {
  recordProfileCreated,
  recordProfileUpdated,
  type ProfileSnapshot,
} from '@/lib/actions/user-history'
import { calculateSelectedMealsFromTimeWindow } from '@/types/onboarding-view.types'

/**
 * Standardowy typ wyniku Server Action (Discriminated Union)
 */
type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string; code?: string; details?: unknown }

/**
 * POST /api/profile - Tworzy profil użytkownika po zakończeniu onboardingu
 *
 * Proces:
 * 1. Weryfikacja autentykacji
 * 2. Walidacja danych wejściowych (Zod)
 * 3. Sprawdzenie czy profil już istnieje
 * 4. Obliczenie celów żywieniowych (BMR, TDEE, makro)
 * 5. Walidacja minimum kalorycznego (1400K/1600M)
 * 6. Zapis profilu do bazy danych
 *
 * @param input - Dane z formularza onboardingu
 * @returns Pełny profil użytkownika z obliczonymi celami lub błąd
 *
 * @example
 * ```typescript
 * const result = await createProfile({
 *   gender: 'female',
 *   age: 30,
 *   weight_kg: 70,
 *   height_cm: 165,
 *   activity_level: 'moderate',
 *   goal: 'weight_loss',
 *   weight_loss_rate_kg_week: 0.5,
 *   disclaimer_accepted_at: '2023-10-27T10:00:00Z'
 * })
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.target_calories) // 1800
 * }
 * ```
 */
export async function createProfile(
  input: CreateProfileInput
): Promise<ActionResult<CreateProfileResponseDTO>> {
  try {
    // 1. Weryfikacja autentykacji
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        error: 'Użytkownik nie jest zalogowany',
        code: 'UNAUTHORIZED',
      }
    }

    // 2. Walidacja danych wejściowych
    const validated = createProfileSchema.safeParse(input)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe dane wejściowe: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
        code: 'VALIDATION_ERROR',
        details: validated.error.format(),
      }
    }

    const command: CreateProfileValidated = validated.data

    // 3. Obliczenie celów żywieniowych (BMR, TDEE, makro)
    let nutritionTargets
    try {
      nutritionTargets = calculateNutritionTargets({
        gender: command.gender,
        age: command.age,
        weight_kg: command.weight_kg,
        height_cm: command.height_cm,
        activity_level: command.activity_level,
        goal: command.goal,
        weight_loss_rate_kg_week: command.weight_loss_rate_kg_week,
        macro_ratio: command.macro_ratio,
      })
    } catch (calcError) {
      // Błąd z kalkulatora (np. kalorie poniżej minimum)
      return {
        error:
          calcError instanceof Error
            ? calcError.message
            : 'Błąd obliczania celów żywieniowych',
        code: 'CALORIES_BELOW_MINIMUM',
        details: {
          gender: command.gender,
        },
      }
    }

    // 5. Oblicz selected_meals na podstawie okna czasowego (dla 2_main)
    const selectedMeals =
      command.meal_plan_type === '2_main'
        ? calculateSelectedMealsFromTimeWindow(
            command.eating_start_time,
            command.eating_end_time
          )
        : null

    // 6. Przygotowanie danych do zapisu (bez created_at - zachowaj oryginalny)
    const profileData = {
      id: user.id,
      email: user.email!,
      gender: command.gender,
      age: command.age,
      weight_kg: command.weight_kg,
      height_cm: command.height_cm,
      activity_level: command.activity_level,
      goal: command.goal,
      weight_loss_rate_kg_week: command.weight_loss_rate_kg_week ?? null,
      meal_plan_type: command.meal_plan_type,
      eating_start_time: command.eating_start_time,
      eating_end_time: command.eating_end_time,
      selected_meals: selectedMeals,
      macro_ratio: command.macro_ratio,
      disclaimer_accepted_at: command.disclaimer_accepted_at,
      target_calories: nutritionTargets.target_calories,
      target_carbs_g: nutritionTargets.target_carbs_g,
      target_protein_g: nutritionTargets.target_protein_g,
      target_fats_g: nutritionTargets.target_fats_g,
      updated_at: new Date().toISOString(),
    }

    // 6. Zapis profilu do bazy danych (upsert - update lub insert)
    const { data: createdProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Błąd podczas zapisywania profilu:', upsertError)
      return {
        error: `Błąd bazy danych: ${upsertError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 7. Zapisz zdarzenie profile_created do historii
    // Walidacja wymaganych pól przed zapisem do historii
    if (
      !createdProfile.gender ||
      !createdProfile.age ||
      !createdProfile.weight_kg ||
      !createdProfile.height_cm ||
      !createdProfile.activity_level ||
      !createdProfile.goal ||
      !createdProfile.target_calories ||
      !createdProfile.target_protein_g ||
      !createdProfile.target_carbs_g ||
      !createdProfile.target_fats_g
    ) {
      console.warn('Brakujące dane profilu - pominięto zapis do historii')
    } else {
      const profileSnapshot: ProfileSnapshot = {
        weight_kg: createdProfile.weight_kg,
        height_cm: createdProfile.height_cm,
        age: createdProfile.age,
        gender: createdProfile.gender,
        activity_level: createdProfile.activity_level,
        goal: createdProfile.goal,
        weight_loss_rate_kg_week: createdProfile.weight_loss_rate_kg_week,
        target_calories: createdProfile.target_calories,
        target_protein_g: createdProfile.target_protein_g,
        target_carbs_g: createdProfile.target_carbs_g,
        target_fats_g: createdProfile.target_fats_g,
      }

      // Zapisz do historii (nie blokujemy na błędzie - historia jest poboczna)
      recordProfileCreated(profileSnapshot).catch((err) => {
        console.warn('Błąd zapisu historii profile_created:', err)
      })
    }

    // 9. Transformacja do DTO - walidacja wymaganych pól
    if (
      !createdProfile.gender ||
      createdProfile.age === null ||
      createdProfile.weight_kg === null ||
      createdProfile.height_cm === null ||
      !createdProfile.activity_level ||
      !createdProfile.goal ||
      !createdProfile.meal_plan_type ||
      !createdProfile.eating_start_time ||
      !createdProfile.eating_end_time ||
      !createdProfile.macro_ratio ||
      createdProfile.target_calories === null ||
      createdProfile.target_carbs_g === null ||
      createdProfile.target_protein_g === null ||
      createdProfile.target_fats_g === null
    ) {
      return {
        error: 'Niekompletne dane profilu po zapisie',
        code: 'DATA_INTEGRITY_ERROR',
      }
    }

    const response: CreateProfileResponseDTO = {
      id: createdProfile.id,
      email: createdProfile.email,
      gender: createdProfile.gender,
      age: createdProfile.age,
      weight_kg: createdProfile.weight_kg,
      height_cm: createdProfile.height_cm,
      activity_level: createdProfile.activity_level,
      goal: createdProfile.goal,
      weight_loss_rate_kg_week: createdProfile.weight_loss_rate_kg_week,
      meal_plan_type: createdProfile.meal_plan_type,
      eating_start_time: createdProfile.eating_start_time,
      eating_end_time: createdProfile.eating_end_time,
      selected_meals: createdProfile.selected_meals,
      macro_ratio: createdProfile.macro_ratio,
      disclaimer_accepted_at:
        createdProfile.disclaimer_accepted_at || new Date().toISOString(),
      target_calories: createdProfile.target_calories,
      target_carbs_g: createdProfile.target_carbs_g,
      target_protein_g: createdProfile.target_protein_g,
      target_fats_g: createdProfile.target_fats_g,
      created_at: createdProfile.created_at,
      updated_at: createdProfile.updated_at,
    }

    return { data: response }
  } catch (err) {
    console.error('Nieoczekiwany błąd w createProfile:', err)
    return {
      error: 'Wewnętrzny błąd serwera',
      code: 'INTERNAL_ERROR',
    }
  }
}

/**
 * GET /api/profile/me - Pobiera profil zalogowanego użytkownika
 *
 * Proces:
 * 1. Weryfikacja autentykacji
 * 2. Pobranie profilu z bazy danych
 * 3. Transformacja do DTO (bez id, created_at, updated_at)
 *
 * @returns Profil użytkownika (ProfileDTO) lub błąd
 *
 * @example
 * ```typescript
 * const result = await getMyProfile()
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.email) // "user@example.com"
 * }
 * ```
 */
export async function getMyProfile(): Promise<ActionResult<ProfileDTO>> {
  try {
    // 1. Weryfikacja autentykacji
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        error: 'Użytkownik nie jest zalogowany',
        code: 'UNAUTHORIZED',
      }
    }

    // 2. Pobranie profilu z bazy danych
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return {
          error: 'Profil nie został znaleziony',
          code: 'PROFILE_NOT_FOUND',
        }
      }
      console.error('Błąd podczas pobierania profilu:', fetchError)
      return {
        error: `Błąd bazy danych: ${fetchError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 3. Transformacja do DTO (bez id, created_at, updated_at)
    const profileDTO: ProfileDTO = {
      email: profile.email,
      gender: profile.gender,
      age: profile.age,
      weight_kg: profile.weight_kg,
      height_cm: profile.height_cm,
      activity_level: profile.activity_level,
      goal: profile.goal,
      weight_loss_rate_kg_week: profile.weight_loss_rate_kg_week,
      meal_plan_type: profile.meal_plan_type,
      eating_start_time: profile.eating_start_time,
      eating_end_time: profile.eating_end_time,
      selected_meals: profile.selected_meals,
      macro_ratio: profile.macro_ratio,
      disclaimer_accepted_at:
        profile.disclaimer_accepted_at || new Date().toISOString(),
      target_calories: profile.target_calories,
      target_carbs_g: profile.target_carbs_g,
      target_protein_g: profile.target_protein_g,
      target_fats_g: profile.target_fats_g,
    }

    return { data: profileDTO }
  } catch (err) {
    console.error('Nieoczekiwany błąd w getMyProfile:', err)
    return {
      error: 'Wewnętrzny błąd serwera',
      code: 'INTERNAL_ERROR',
    }
  }
}

/**
 * PATCH /api/profile/me - Aktualizuje profil zalogowanego użytkownika
 *
 * Proces:
 * 1. Weryfikacja autentykacji
 * 2. Walidacja danych wejściowych (partial - wszystkie pola opcjonalne)
 * 3. Pobranie aktualnego profilu
 * 4. Merge danych (aktualne + nowe)
 * 5. Przeliczenie celów żywieniowych (jeśli zmieniły się parametry)
 * 6. Walidacja minimum kalorycznego
 * 7. Aktualizacja profilu w bazie danych
 *
 * @param input - Dane do aktualizacji (partial)
 * @returns Zaktualizowany profil (ProfileDTO) lub błąd
 *
 * @example
 * ```typescript
 * const result = await updateMyProfile({
 *   weight_kg: 69,
 *   activity_level: 'high'
 * })
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.target_calories) // Przeliczone kalorie
 * }
 * ```
 */
export async function updateMyProfile(
  input: UpdateProfileInput
): Promise<ActionResult<ProfileDTO>> {
  try {
    // 1. Weryfikacja autentykacji
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        error: 'Użytkownik nie jest zalogowany',
        code: 'UNAUTHORIZED',
      }
    }

    // 2. Walidacja danych wejściowych (partial)
    const validated = updateProfileSchema.safeParse(input)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe dane wejściowe: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
        code: 'VALIDATION_ERROR',
        details: validated.error.format(),
      }
    }

    const command: UpdateProfileCommand = validated.data

    // 3. Pobranie aktualnego profilu
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return {
          error: 'Profil nie został znaleziony',
          code: 'PROFILE_NOT_FOUND',
        }
      }
      console.error('Błąd podczas pobierania profilu:', fetchError)
      return {
        error: `Błąd bazy danych: ${fetchError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 4. Merge danych (aktualne + nowe)
    const mergedMealPlanType =
      command.meal_plan_type ?? currentProfile.meal_plan_type
    const mergedEatingStartTime =
      command.eating_start_time ?? currentProfile.eating_start_time
    const mergedEatingEndTime =
      command.eating_end_time ?? currentProfile.eating_end_time

    // Oblicz selected_meals na podstawie okna czasowego (dla 2_main)
    const selectedMeals =
      mergedMealPlanType === '2_main'
        ? calculateSelectedMealsFromTimeWindow(
            mergedEatingStartTime,
            mergedEatingEndTime
          )
        : null

    // Walidacja wymaganych pól przed merge
    const mergedGender = command.gender ?? currentProfile.gender
    const mergedAge = command.age ?? currentProfile.age
    const mergedWeightKg = command.weight_kg ?? currentProfile.weight_kg
    const mergedHeightCm = command.height_cm ?? currentProfile.height_cm
    const mergedActivityLevel =
      command.activity_level ?? currentProfile.activity_level
    const mergedGoal = command.goal ?? currentProfile.goal
    const mergedMacroRatio = command.macro_ratio ?? currentProfile.macro_ratio

    if (
      !mergedGender ||
      mergedAge === null ||
      mergedWeightKg === null ||
      mergedHeightCm === null ||
      !mergedActivityLevel ||
      !mergedGoal ||
      !mergedMacroRatio
    ) {
      return {
        error: 'Niekompletne dane profilu - brakujące wymagane pola',
        code: 'DATA_INTEGRITY_ERROR',
      }
    }

    const mergedData = {
      gender: mergedGender,
      age: mergedAge,
      weight_kg: mergedWeightKg,
      height_cm: mergedHeightCm,
      activity_level: mergedActivityLevel,
      goal: mergedGoal,
      weight_loss_rate_kg_week:
        command.weight_loss_rate_kg_week ??
        currentProfile.weight_loss_rate_kg_week,
      meal_plan_type: mergedMealPlanType,
      eating_start_time: mergedEatingStartTime,
      eating_end_time: mergedEatingEndTime,
      selected_meals: selectedMeals,
      macro_ratio: mergedMacroRatio,
    }

    // 5. Przeliczenie celów żywieniowych
    let nutritionTargets
    try {
      nutritionTargets = calculateNutritionTargets(mergedData)
    } catch (calcError) {
      return {
        error:
          calcError instanceof Error
            ? calcError.message
            : 'Błąd obliczania celów żywieniowych',
        code: 'CALORIES_BELOW_MINIMUM',
        details: {
          gender: mergedData.gender,
        },
      }
    }

    // 6. Przygotowanie danych do aktualizacji
    const updateData = {
      ...mergedData,
      target_calories: nutritionTargets.target_calories,
      target_carbs_g: nutritionTargets.target_carbs_g,
      target_protein_g: nutritionTargets.target_protein_g,
      target_fats_g: nutritionTargets.target_fats_g,
      updated_at: new Date().toISOString(),
    }

    // 7. Aktualizacja profilu w bazie danych
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Błąd podczas aktualizacji profilu:', updateError)
      return {
        error: `Błąd bazy danych: ${updateError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 8. Zapisz zdarzenie profile_updated do historii
    // Walidacja wymaganych pól przed zapisem do historii
    if (
      !updatedProfile.gender ||
      updatedProfile.age === null ||
      updatedProfile.weight_kg === null ||
      updatedProfile.height_cm === null ||
      !updatedProfile.activity_level ||
      !updatedProfile.goal ||
      updatedProfile.target_calories === null ||
      updatedProfile.target_protein_g === null ||
      updatedProfile.target_carbs_g === null ||
      updatedProfile.target_fats_g === null
    ) {
      console.warn('Brakujące dane profilu - pominięto zapis do historii')
    } else {
      const profileSnapshotUpdate: ProfileSnapshot = {
        weight_kg: updatedProfile.weight_kg,
        height_cm: updatedProfile.height_cm,
        age: updatedProfile.age,
        gender: updatedProfile.gender,
        activity_level: updatedProfile.activity_level,
        goal: updatedProfile.goal,
        weight_loss_rate_kg_week: updatedProfile.weight_loss_rate_kg_week,
        target_calories: updatedProfile.target_calories,
        target_protein_g: updatedProfile.target_protein_g,
        target_carbs_g: updatedProfile.target_carbs_g,
        target_fats_g: updatedProfile.target_fats_g,
      }

      // Zapisz do historii (nie blokujemy na błędzie - historia jest poboczna)
      recordProfileUpdated(profileSnapshotUpdate).catch((err) => {
        console.warn('Błąd zapisu historii profile_updated:', err)
      })
    }

    // 9. Usunięcie zaplanowanych posiłków (regeneracja planu)
    // Sprawdź czy dzisiaj są posiłki oznaczone jako zjedzone - jeśli tak, zachowaj dzisiejszy dzień
    const today = formatLocalDate(new Date())

    const { data: todayEatenMeals } = await supabase
      .from('planned_meals')
      .select('id')
      .eq('user_id', user.id)
      .eq('meal_date', today)
      .eq('is_eaten', true)
      .limit(1)

    const hasTodayEatenMeals = todayEatenMeals && todayEatenMeals.length > 0

    if (hasTodayEatenMeals) {
      // Jeśli użytkownik zjadł jakiś posiłek dzisiaj, usuń tylko posiłki od jutra
      const { error: deleteMealsError } = await supabase
        .from('planned_meals')
        .delete()
        .eq('user_id', user.id)
        .gt('meal_date', today)

      if (deleteMealsError) {
        console.warn(
          'Błąd podczas usuwania przyszłych posiłków (nie krytyczny):',
          deleteMealsError
        )
      }
    } else {
      // Jeśli żaden posiłek dzisiaj nie jest zjedzony, usuń wszystkie posiłki
      const { error: deleteMealsError } = await supabase
        .from('planned_meals')
        .delete()
        .eq('user_id', user.id)

      if (deleteMealsError) {
        console.warn(
          'Błąd podczas usuwania starych posiłków (nie krytyczny):',
          deleteMealsError
        )
      }
    }

    // 10. Transformacja do DTO
    const profileDTO: ProfileDTO = {
      email: updatedProfile.email,
      gender: updatedProfile.gender,
      age: updatedProfile.age,
      weight_kg: updatedProfile.weight_kg,
      height_cm: updatedProfile.height_cm,
      activity_level: updatedProfile.activity_level,
      goal: updatedProfile.goal,
      weight_loss_rate_kg_week: updatedProfile.weight_loss_rate_kg_week,
      meal_plan_type: updatedProfile.meal_plan_type,
      eating_start_time: updatedProfile.eating_start_time,
      eating_end_time: updatedProfile.eating_end_time,
      selected_meals: updatedProfile.selected_meals,
      macro_ratio: updatedProfile.macro_ratio,
      disclaimer_accepted_at:
        updatedProfile.disclaimer_accepted_at || new Date().toISOString(),
      target_calories: updatedProfile.target_calories,
      target_carbs_g: updatedProfile.target_carbs_g,
      target_protein_g: updatedProfile.target_protein_g,
      target_fats_g: updatedProfile.target_fats_g,
    }

    return { data: profileDTO }
  } catch (err) {
    console.error('Nieoczekiwany błąd w updateMyProfile:', err)
    return {
      error: 'Wewnętrzny błąd serwera',
      code: 'INTERNAL_ERROR',
    }
  }
}

/**
 * POST /api/profile/me/generate-plan - Generuje 7-dniowy plan posiłków dla użytkownika
 *
 * Proces:
 * 1. Weryfikacja autentykacji
 * 2. Pobranie profilu użytkownika
 * 3. Sprawdzenie czy plan już istnieje (7 dni)
 * 4. Wywołanie MealPlanGenerator (generowanie 21 posiłków)
 * 5. Batch insert do planned_meals
 * 6. Zwrot statusu operacji
 *
 * @returns Status generowania planu lub błąd
 *
 * @example
 * ```typescript
 * const result = await generateMealPlan()
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.generated_days) // 7
 * }
 * ```
 */
export async function generateMealPlan(): Promise<
  ActionResult<GeneratePlanResponseDTO>
> {
  try {
    // 1. Weryfikacja autentykacji
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        error: 'Użytkownik nie jest zalogowany',
        code: 'UNAUTHORIZED',
      }
    }

    const userId = user.id

    // 2. Pobranie profilu użytkownika
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        'id, target_calories, target_carbs_g, target_protein_g, target_fats_g, meal_plan_type, selected_meals'
      )
      .eq('id', userId)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return {
          error: 'Profil nie został znaleziony',
          code: 'PROFILE_NOT_FOUND',
        }
      }
      console.error('Błąd podczas pobierania profilu:', profileError)
      return {
        error: `Błąd bazy danych: ${profileError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 3. Sprawdzenie które dni wymagają wygenerowania planu
    // 3a. Wyczyść stare plany posiłków (dni przed dzisiejszym)
    const { cleanupOldMealPlans } =
      await import('@/services/meal-plan-generator')
    try {
      await cleanupOldMealPlans(userId)
    } catch (cleanupError) {
      console.warn(
        'Błąd czyszczenia starych planów (nie krytyczny):',
        cleanupError
      )
    }

    const { findMissingDays } = await import('@/services/meal-plan-generator')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayString = formatLocalDate(today)

    // Sprawdź czy dzisiaj są posiłki oznaczone jako zjedzone
    // Jeśli tak, generujemy plan od jutra (zachowujemy dzisiejszy dzień)
    const { data: todayEatenMeals } = await supabase
      .from('planned_meals')
      .select('id')
      .eq('user_id', userId)
      .eq('meal_date', todayString)
      .eq('is_eaten', true)
      .limit(1)

    const hasTodayEatenMeals = todayEatenMeals && todayEatenMeals.length > 0

    // Wygeneruj listę dat dla następnych 7 dni
    // Jeśli dzisiaj są zjedzone posiłki, zaczynamy od jutra (i=1), w przeciwnym razie od dzisiaj (i=0)
    const startOffset = hasTodayEatenMeals ? 1 : 0
    const dates: string[] = []
    for (let i = startOffset; i < 7 + startOffset; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(formatLocalDate(date))
    }

    // 4. Walidacja wymaganych pól profilu przed generowaniem planu
    if (
      profile.target_calories === null ||
      profile.target_protein_g === null ||
      profile.target_carbs_g === null ||
      profile.target_fats_g === null
    ) {
      return {
        error: 'Niekompletne dane profilu - brakujące cele żywieniowe',
        code: 'PROFILE_INCOMPLETE',
      }
    }

    // 5. Znajdź dni bez kompletnego planu
    let missingDays: string[]
    let plannedMeals

    try {
      missingDays = await findMissingDays(
        userId,
        dates,
        profile.meal_plan_type,
        profile.selected_meals
      )

      // Jeśli wszystkie dni mają kompletny plan, zwróć konflikt
      if (missingDays.length === 0) {
        return {
          error:
            'Plan posiłków na następne 7 dni już istnieje i jest kompletny',
          code: 'MEAL_PLAN_EXISTS',
        }
      }

      // Generuj plan tylko dla brakujących dni
      const { generateDayPlan } = await import('@/services/meal-plan-generator')
      plannedMeals = []

      for (const date of missingDays) {
        const dayPlan = await generateDayPlan(userId, date, {
          target_calories: profile.target_calories,
          target_protein_g: profile.target_protein_g,
          target_carbs_g: profile.target_carbs_g,
          target_fats_g: profile.target_fats_g,
          meal_plan_type: profile.meal_plan_type,
          selected_meals: profile.selected_meals,
        })
        plannedMeals.push(...dayPlan)
      }
    } catch (generatorError) {
      console.error('Błąd generatora planu:', generatorError)
      return {
        error:
          generatorError instanceof Error
            ? generatorError.message
            : 'Błąd generatora planu posiłków',
        code: 'MEAL_GENERATOR_ERROR',
      }
    }

    // 5. Usuń istniejące (niekompletne) posiłki dla dni, które będziemy regenerować
    // Jest to konieczne gdy użytkownik zmienił meal_plan_type - mogą istnieć posiłki
    // z poprzedniej konfiguracji, które powodują konflikt unique constraint
    if (missingDays.length > 0) {
      const { error: deleteIncompleteError } = await supabase
        .from('planned_meals')
        .delete()
        .eq('user_id', userId)
        .in('meal_date', missingDays)

      if (deleteIncompleteError) {
        console.warn(
          'Błąd podczas usuwania niekompletnych posiłków (nie krytyczny):',
          deleteIncompleteError
        )
      }
    }

    // 6. Batch insert do planned_meals
    const { error: insertError } = await supabase
      .from('planned_meals')
      .insert(plannedMeals)

    if (insertError) {
      console.error('Błąd podczas zapisu planu posiłków:', insertError)
      return {
        error: `Błąd bazy danych: ${insertError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 7. Zwrot statusu sukcesu
    const generatedDays = missingDays.length
    return {
      data: {
        status: 'success',
        message: `Plan posiłków na ${generatedDays} ${generatedDays === 1 ? 'dzień' : 'dni'} został pomyślnie wygenerowany`,
        generated_days: generatedDays,
      },
    }
  } catch (err) {
    console.error('Nieoczekiwany błąd w generateMealPlan:', err)
    return {
      error: 'Wewnętrzny błąd serwera',
      code: 'INTERNAL_ERROR',
    }
  }
}
