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
import type {
  CreateProfileCommand,
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
} from '@/lib/validation/profile'
import type { Tables } from '@/types/database.types'

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

    const command: CreateProfileCommand = validated.data

    // 3. Sprawdzenie czy profil już istnieje
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('Błąd podczas sprawdzania istnienia profilu:', checkError)
      return {
        error: `Błąd bazy danych: ${checkError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    if (existingProfile) {
      return {
        error: 'Profil użytkownika już istnieje',
        code: 'PROFILE_ALREADY_EXISTS',
      }
    }

    // 4. Obliczenie celów żywieniowych (BMR, TDEE, makro)
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

    // 5. Przygotowanie danych do zapisu
    const profileData: Tables<'profiles'> = {
      id: user.id,
      email: user.email!,
      gender: command.gender,
      age: command.age,
      weight_kg: command.weight_kg,
      height_cm: command.height_cm,
      activity_level: command.activity_level,
      goal: command.goal,
      weight_loss_rate_kg_week: command.weight_loss_rate_kg_week ?? null,
      disclaimer_accepted_at: command.disclaimer_accepted_at,
      target_calories: nutritionTargets.target_calories,
      target_carbs_g: nutritionTargets.target_carbs_g,
      target_protein_g: nutritionTargets.target_protein_g,
      target_fats_g: nutritionTargets.target_fats_g,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 6. Zapis profilu do bazy danych
    const { data: createdProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (insertError) {
      console.error('Błąd podczas tworzenia profilu:', insertError)
      return {
        error: `Błąd bazy danych: ${insertError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 7. Transformacja do DTO
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
      disclaimer_accepted_at: createdProfile.disclaimer_accepted_at,
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
      disclaimer_accepted_at: profile.disclaimer_accepted_at,
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
    const mergedData = {
      gender: command.gender ?? currentProfile.gender,
      age: command.age ?? currentProfile.age,
      weight_kg: command.weight_kg ?? currentProfile.weight_kg,
      height_cm: command.height_cm ?? currentProfile.height_cm,
      activity_level: command.activity_level ?? currentProfile.activity_level,
      goal: command.goal ?? currentProfile.goal,
      weight_loss_rate_kg_week:
        command.weight_loss_rate_kg_week ??
        currentProfile.weight_loss_rate_kg_week,
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

    // 8. Transformacja do DTO
    const profileDTO: ProfileDTO = {
      email: updatedProfile.email,
      gender: updatedProfile.gender,
      age: updatedProfile.age,
      weight_kg: updatedProfile.weight_kg,
      height_cm: updatedProfile.height_cm,
      activity_level: updatedProfile.activity_level,
      goal: updatedProfile.goal,
      weight_loss_rate_kg_week: updatedProfile.weight_loss_rate_kg_week,
      disclaimer_accepted_at: updatedProfile.disclaimer_accepted_at,
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

    // 2. Pobranie profilu użytkownika
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(
        'id, target_calories, target_carbs_g, target_protein_g, target_fats_g'
      )
      .eq('id', user.id)
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

    // 3. Sprawdzenie czy plan już istnieje (7 dni od dzisiaj)
    const { generateWeeklyPlan, checkExistingPlan } = await import(
      '@/services/meal-plan-generator'
    )

    const today = new Date()
    const startDate = today.toISOString().split('T')[0]
    const endDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const existingMealsCount = await checkExistingPlan(
      user.id,
      startDate,
      endDate
    )

    // Jeśli istnieje kompletny plan (21 posiłków = 7 dni × 3 posiłki), zwróć konflikt
    if (existingMealsCount >= 21) {
      return {
        error: 'Plan posiłków na następne 7 dni już istnieje i jest kompletny',
        code: 'MEAL_PLAN_EXISTS',
      }
    }

    // 4. Generowanie planu posiłków (7 dni × 3 posiłki = 21 wpisów)
    let plannedMeals
    try {
      plannedMeals = await generateWeeklyPlan(profile, today)
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

    // 5. Batch insert do planned_meals
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

    // 6. Zwrot statusu sukcesu
    return {
      data: {
        status: 'success',
        message: 'Plan posiłków na 7 dni został pomyślnie wygenerowany',
        generated_days: 7,
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
