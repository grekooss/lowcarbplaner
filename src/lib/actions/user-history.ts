/**
 * Server Actions for User History API
 *
 * Zapisuje i pobiera historię użytkownika:
 * - profile_created - utworzenie profilu (onboarding)
 * - profile_updated - aktualizacja profilu
 * - meal_eaten - zjedzony posiłek z kaloriami i makro
 */

'use server'

import { createServerClient } from '@/lib/supabase/server'
import { logErrorLevel } from '@/lib/error-logger'
import type { Database, Json } from '@/types/database.types'

/**
 * Type-safe JSON conversion helper
 *
 * Converts a typed object to Supabase's Json type for database storage.
 * Using JSON.parse(JSON.stringify()) ensures:
 * 1. The object is actually JSON-serializable (no functions, circular refs, etc.)
 * 2. The result matches what will be stored in the database
 * 3. Runtime validation that the data can be serialized
 *
 * This is safer than direct `as unknown as Json` because:
 * - It validates at runtime that the object is JSON-serializable
 * - Non-serializable values (functions, circular refs) throw an error
 * - The cast is explicit and documented
 */
function toJsonColumn<T>(obj: T): Json {
  // Runtime validation: JSON.stringify will throw if obj is not serializable
  return JSON.parse(JSON.stringify(obj)) as Json
}

type HistoryEventType = Database['public']['Enums']['history_event_type_enum']

/**
 * Snapshot danych profilu
 */
export interface ProfileSnapshot {
  weight_kg: number
  height_cm: number
  age: number
  gender: 'male' | 'female'
  activity_level: string
  goal: string
  weight_loss_rate_kg_week: number | null
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fats_g: number
}

/**
 * Dane zjedzonego posiłku
 */
export interface MealEatenData {
  planned_meal_id: number
  recipe_id: number
  recipe_name: string
  meal_type:
    | 'breakfast'
    | 'lunch'
    | 'dinner'
    | 'snack'
    | 'snack_morning'
    | 'snack_afternoon'
  meal_date: string
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
  ingredient_overrides?: unknown
}

/**
 * Standardowy typ wyniku Server Action
 */
type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string; code?: string }

/**
 * Zapisuje zdarzenie profile_created do historii
 *
 * Wywoływane po zakończeniu onboardingu
 */
export async function recordProfileCreated(
  profileSnapshot: ProfileSnapshot
): Promise<ActionResult<{ id: number }>> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Użytkownik nie jest zalogowany', code: 'UNAUTHORIZED' }
    }

    const { data, error } = await supabase
      .from('user_history')
      .insert({
        user_id: user.id,
        event_type: 'profile_created' as HistoryEventType,
        profile_snapshot: toJsonColumn(profileSnapshot),
      })
      .select('id')
      .single()

    if (error) {
      logErrorLevel(error, {
        source: 'user-history.recordProfileCreated',
        userId: user.id,
        metadata: { errorCode: error.code },
      })
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    return { data: { id: data.id } }
  } catch (err) {
    logErrorLevel(err, { source: 'user-history.recordProfileCreated' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}

/**
 * Zapisuje zdarzenie profile_updated do historii
 *
 * Wywoływane po aktualizacji profilu użytkownika
 */
export async function recordProfileUpdated(
  profileSnapshot: ProfileSnapshot
): Promise<ActionResult<{ id: number }>> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Użytkownik nie jest zalogowany', code: 'UNAUTHORIZED' }
    }

    const { data, error } = await supabase
      .from('user_history')
      .insert({
        user_id: user.id,
        event_type: 'profile_updated' as HistoryEventType,
        profile_snapshot: toJsonColumn(profileSnapshot),
      })
      .select('id')
      .single()

    if (error) {
      logErrorLevel(error, {
        source: 'user-history.recordProfileUpdated',
        userId: user.id,
        metadata: { errorCode: error.code },
      })
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    return { data: { id: data.id } }
  } catch (err) {
    logErrorLevel(err, { source: 'user-history.recordProfileUpdated' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}

/**
 * Zapisuje zdarzenie meal_eaten do historii
 *
 * Wywoływane gdy użytkownik oznaczy posiłek jako zjedzony
 */
export async function recordMealEaten(
  mealData: MealEatenData
): Promise<ActionResult<{ id: number }>> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Użytkownik nie jest zalogowany', code: 'UNAUTHORIZED' }
    }

    const { data, error } = await supabase
      .from('user_history')
      .insert({
        user_id: user.id,
        event_type: 'meal_eaten' as HistoryEventType,
        event_date: mealData.meal_date,
        meal_data: toJsonColumn(mealData),
      })
      .select('id')
      .single()

    if (error) {
      logErrorLevel(error, {
        source: 'user-history.recordMealEaten',
        userId: user.id,
        metadata: { mealData, errorCode: error.code },
      })
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    return { data: { id: data.id } }
  } catch (err) {
    logErrorLevel(err, { source: 'user-history.recordMealEaten' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}

/**
 * Usuwa zdarzenie meal_eaten z historii
 *
 * Wywoływane gdy użytkownik odkliknie posiłek (is_eaten = false)
 */
export async function removeMealEaten(
  plannedMealId: number
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Użytkownik nie jest zalogowany', code: 'UNAUTHORIZED' }
    }

    // Usuń rekord historii dla tego planned_meal_id
    const { error } = await supabase
      .from('user_history')
      .delete()
      .eq('user_id', user.id)
      .eq('event_type', 'meal_eaten')
      .filter('meal_data->>planned_meal_id', 'eq', plannedMealId.toString())

    if (error) {
      logErrorLevel(error, {
        source: 'user-history.removeMealEaten',
        userId: user.id,
        metadata: { plannedMealId, errorCode: error.code },
      })
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    return { data: { deleted: true } }
  } catch (err) {
    logErrorLevel(err, { source: 'user-history.removeMealEaten' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}

/**
 * Pobiera historię użytkownika dla danego zakresu dat
 */
export async function getUserHistory(params: {
  start_date?: string
  end_date?: string
  event_type?: HistoryEventType
  limit?: number
}): Promise<
  ActionResult<
    {
      id: number
      event_type: HistoryEventType
      event_date: string
      created_at: string
      profile_snapshot: ProfileSnapshot | null
      meal_data: MealEatenData | null
    }[]
  >
> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Użytkownik nie jest zalogowany', code: 'UNAUTHORIZED' }
    }

    let query = supabase
      .from('user_history')
      .select(
        'id, event_type, event_date, created_at, profile_snapshot, meal_data'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (params.start_date) {
      query = query.gte('event_date', params.start_date)
    }

    if (params.end_date) {
      query = query.lte('event_date', params.end_date)
    }

    if (params.event_type) {
      query = query.eq('event_type', params.event_type)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    const { data, error } = await query

    if (error) {
      logErrorLevel(error, {
        source: 'user-history.getUserHistory',
        userId: user.id,
        metadata: { params, errorCode: error.code },
      })
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    return {
      data: (data || []).map((row) => ({
        id: row.id,
        event_type: row.event_type,
        event_date: row.event_date,
        created_at: row.created_at,
        profile_snapshot: row.profile_snapshot as ProfileSnapshot | null,
        meal_data: row.meal_data as MealEatenData | null,
      })),
    }
  } catch (err) {
    logErrorLevel(err, { source: 'user-history.getUserHistory' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}

/**
 * Pobiera podsumowanie dzienne zjedzonych posiłków
 *
 * Sumuje kalorie i makro dla danej daty
 */
export async function getDailySummary(date: string): Promise<
  ActionResult<{
    date: string
    meals_count: number
    total_calories: number
    total_protein_g: number
    total_carbs_g: number
    total_fats_g: number
    meals: MealEatenData[]
  }>
> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Użytkownik nie jest zalogowany', code: 'UNAUTHORIZED' }
    }

    const { data, error } = await supabase
      .from('user_history')
      .select('meal_data')
      .eq('user_id', user.id)
      .eq('event_type', 'meal_eaten')
      .eq('event_date', date)

    if (error) {
      logErrorLevel(error, {
        source: 'user-history.getDailySummary',
        userId: user.id,
        metadata: { date, errorCode: error.code },
      })
      return {
        error: `Błąd bazy danych: ${error.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    const meals = (data || [])
      .map((row) => row.meal_data as MealEatenData | null)
      .filter((meal): meal is MealEatenData => meal !== null)

    const summary = {
      date,
      meals_count: meals.length,
      total_calories: meals.reduce((sum, m) => sum + (m.calories || 0), 0),
      total_protein_g: meals.reduce((sum, m) => sum + (m.protein_g || 0), 0),
      total_carbs_g: meals.reduce((sum, m) => sum + (m.carbs_g || 0), 0),
      total_fats_g: meals.reduce((sum, m) => sum + (m.fats_g || 0), 0),
      meals,
    }

    return { data: summary }
  } catch (err) {
    logErrorLevel(err, { source: 'user-history.getDailySummary' })
    return { error: 'Wewnętrzny błąd serwera', code: 'INTERNAL_ERROR' }
  }
}
