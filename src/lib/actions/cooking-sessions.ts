'use server'

/**
 * Server Actions dla Cooking Sessions (Meal Prep v2.0)
 *
 * Zarządza sesjami gotowania, krokami i postępem.
 *
 * NOTE: Wymaga uruchomienia migracji 20260106120000_add_meal_prep_v2_tables.sql
 * przed użyciem tych akcji.
 */

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type {
  CookingSessionDTO,
  CookingSessionStatus,
  CreateCookingSessionCommand,
  UserInventoryItemDTO,
  AddToInventoryCommand,
} from '@/types/dto.types'
import {
  createCookingSession,
  getCookingSession,
  updateSessionStatus,
  completeStep,
  addTimeAdjustment,
  getMealsForBatchCooking,
  addToInventory,
  consumeFromInventory,
  getAvailableInventory,
} from '@/services/meal-prep-optimizer'

export type ActionResult<T> = { data: T } | { error: string }

// ============================================================================
// Session Management
// ============================================================================

/**
 * Tworzy nową sesję gotowania
 */
export async function createSessionAction(
  input: CreateCookingSessionCommand
): Promise<ActionResult<{ sessionId: string }>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany, aby utworzyć sesję gotowania' }
    }

    const result = await createCookingSession({
      ...input,
      user_id: user.id,
    })

    if (!result.session?.id) {
      return { error: 'Nie udało się utworzyć sesji' }
    }

    revalidatePath('/cooking')
    return { data: { sessionId: result.session.id } }
  } catch (error) {
    console.error('Error creating cooking session:', error)
    return { error: 'Wystąpił błąd podczas tworzenia sesji gotowania' }
  }
}

/**
 * Pobiera sesję gotowania
 */
export async function getSessionAction(
  sessionId: string
): Promise<ActionResult<CookingSessionDTO>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const session = await getCookingSession(sessionId, user.id)

    if (!session) {
      return { error: 'Sesja nie została znaleziona' }
    }

    return { data: session }
  } catch (error) {
    console.error('Error getting cooking session:', error)
    return { error: 'Wystąpił błąd podczas pobierania sesji' }
  }
}

/**
 * Pobiera wszystkie sesje użytkownika
 */
export async function getUserSessionsAction(): Promise<
  ActionResult<CookingSessionDTO[]>
> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('cooking_sessions')
      .select(
        `
        id,
        status,
        planned_date,
        actual_start_at,
        actual_end_at,
        estimated_total_minutes,
        current_step_index,
        notes,
        created_at,
        session_meals (
          id,
          planned_meal_id,
          portions_to_cook,
          planned_meals:planned_meal_id (
            id,
            recipe_id,
            recipes:recipe_id (
              id,
              name,
              image_url
            )
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('planned_date', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching sessions:', error)
      return { error: 'Nie udało się pobrać sesji' }
    }

    // Transformuj do DTO
    const sessions: CookingSessionDTO[] = (data || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session: any) => ({
        id: session.id,
        user_id: user.id,
        status: session.status,
        planned_date: session.planned_date,
        planned_start_time: null,
        estimated_total_minutes: session.estimated_total_minutes || null,
        actual_start_at: session.actual_start_at || null,
        actual_end_at: session.actual_end_at || null,
        current_step_index: session.current_step_index || 0,
        notes: session.notes,
        last_sync_at: session.created_at,
        active_device_id: null,
        created_at: session.created_at,
        updated_at: session.created_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        meals: (session.session_meals || []).map((sm: any) => ({
          id: sm.id,
          session_id: session.id,
          planned_meal_id: sm.planned_meal_id,
          is_source_meal: true,
          portions_to_cook: sm.portions_to_cook || 1,
          cooking_order: null,
          // Pola pomocnicze dla UI (przez planned_meals -> recipes)
          recipe_id: sm.planned_meals?.recipe_id,
          portions: sm.portions_to_cook,
          recipe_name: sm.planned_meals?.recipes?.name || 'Nieznany przepis',
          recipe_image_url: sm.planned_meals?.recipes?.image_url,
        })),
        step_progress: [],
        adjustments: [],
      })
    )

    return { data: sessions }
  } catch (error) {
    console.error('Error getting user sessions:', error)
    return { error: 'Wystąpił błąd podczas pobierania sesji' }
  }
}

/**
 * Rozpoczyna sesję gotowania
 */
export async function startSessionAction(
  sessionId: string
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const success = await updateSessionStatus(
      sessionId,
      user.id,
      'in_progress',
      0
    )

    if (!success) {
      return { error: 'Nie udało się rozpocząć sesji' }
    }

    revalidatePath('/cooking')
    revalidatePath(`/cooking/${sessionId}`)
    return { data: true }
  } catch (error) {
    console.error('Error starting session:', error)
    return { error: 'Wystąpił błąd podczas rozpoczynania sesji' }
  }
}

/**
 * Wstrzymuje sesję gotowania
 */
export async function pauseSessionAction(
  sessionId: string
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const success = await updateSessionStatus(sessionId, user.id, 'paused')

    if (!success) {
      return { error: 'Nie udało się wstrzymać sesji' }
    }

    revalidatePath('/cooking')
    revalidatePath(`/cooking/${sessionId}`)
    return { data: true }
  } catch (error) {
    console.error('Error pausing session:', error)
    return { error: 'Wystąpił błąd podczas wstrzymywania sesji' }
  }
}

/**
 * Wznawia sesję gotowania
 */
export async function resumeSessionAction(
  sessionId: string
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const success = await updateSessionStatus(sessionId, user.id, 'in_progress')

    if (!success) {
      return { error: 'Nie udało się wznowić sesji' }
    }

    revalidatePath('/cooking')
    revalidatePath(`/cooking/${sessionId}`)
    return { data: true }
  } catch (error) {
    console.error('Error resuming session:', error)
    return { error: 'Wystąpił błąd podczas wznawiania sesji' }
  }
}

/**
 * Kończy sesję gotowania
 */
export async function completeSessionAction(
  sessionId: string
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const success = await updateSessionStatus(sessionId, user.id, 'completed')

    if (!success) {
      return { error: 'Nie udało się zakończyć sesji' }
    }

    revalidatePath('/cooking')
    revalidatePath(`/cooking/${sessionId}`)
    return { data: true }
  } catch (error) {
    console.error('Error completing session:', error)
    return { error: 'Wystąpił błąd podczas kończenia sesji' }
  }
}

/**
 * Anuluje sesję gotowania
 */
export async function cancelSessionAction(
  sessionId: string
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const success = await updateSessionStatus(
      sessionId,
      user.id,
      'cancelled' as CookingSessionStatus
    )

    if (!success) {
      return { error: 'Nie udało się anulować sesji' }
    }

    revalidatePath('/cooking')
    return { data: true }
  } catch (error) {
    console.error('Error cancelling session:', error)
    return { error: 'Wystąpił błąd podczas anulowania sesji' }
  }
}

// ============================================================================
// Step Progress
// ============================================================================

/**
 * Oznacza krok jako ukończony
 */
export async function completeStepAction(
  sessionId: string,
  recipeId: number,
  stepNumber: number
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    // Weryfikuj, że sesja należy do użytkownika
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session } = await (supabase as any)
      .from('cooking_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single()

    if (!session || session.user_id !== user.id) {
      return { error: 'Brak dostępu do tej sesji' }
    }

    const success = await completeStep(sessionId, recipeId, stepNumber)

    if (!success) {
      return { error: 'Nie udało się oznaczyć kroku jako ukończony' }
    }

    revalidatePath(`/cooking/${sessionId}`)
    return { data: true }
  } catch (error) {
    console.error('Error completing step:', error)
    return { error: 'Wystąpił błąd podczas oznaczania kroku' }
  }
}

/**
 * Dodaje korektę czasu do kroku
 */
export async function addTimeAdjustmentAction(
  sessionId: string,
  stepId: number | null,
  adjustmentType: 'time_add' | 'time_subtract' | 'skip' | 'repeat',
  adjustmentValue?: number,
  reason?: string
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const success = await addTimeAdjustment(
      sessionId,
      stepId,
      adjustmentType,
      adjustmentValue,
      reason
    )

    if (!success) {
      return { error: 'Nie udało się dodać korekty czasu' }
    }

    revalidatePath(`/cooking/${sessionId}`)
    return { data: true }
  } catch (error) {
    console.error('Error adding time adjustment:', error)
    return { error: 'Wystąpił błąd podczas dodawania korekty' }
  }
}

// ============================================================================
// Batch Cooking Planning
// ============================================================================

/**
 * DTO dla posiłków do batch cooking
 */
export interface BatchCookingMealDTO {
  planned_meal_id: number
  recipe_id: number
  recipe_name: string
  recipe_image_url: string | null
}

/**
 * Pobiera posiłki do batch cooking na dany dzień
 */
export async function getMealsForBatchCookingAction(
  date: string
): Promise<ActionResult<BatchCookingMealDTO[]>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    console.log('[getMealsForBatchCookingAction] Searching meals for:', {
      userId: user.id,
      date,
    })

    const meals = await getMealsForBatchCooking(user.id, date)

    console.log('[getMealsForBatchCookingAction] Found meals:', meals.length)

    // Zwróć wszystkie posiłki z ich ID i danymi przepisu
    const result: BatchCookingMealDTO[] = meals
      .filter(
        (
          meal
        ): meal is typeof meal & { recipe: NonNullable<typeof meal.recipe> } =>
          meal.recipe?.id !== undefined
      )
      .map((meal) => ({
        planned_meal_id: meal.id,
        recipe_id: meal.recipe.id,
        recipe_name: meal.recipe.name,
        recipe_image_url: meal.recipe.image_url || null,
      }))

    return { data: result }
  } catch (error) {
    console.error('Error getting meals for batch cooking:', error)
    return { error: 'Wystąpił błąd podczas pobierania posiłków' }
  }
}

// ============================================================================
// Inventory Management
// ============================================================================

/**
 * Dodaje przedmioty do wirtualnej spiżarni
 */
export async function addToInventoryAction(
  items: AddToInventoryCommand[]
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    await addToInventory(user.id, items)

    revalidatePath('/pantry')
    return { data: true }
  } catch (error) {
    console.error('Error adding to inventory:', error)
    return { error: 'Wystąpił błąd podczas dodawania do spiżarni' }
  }
}

/**
 * Oznacza przedmiot jako zużyty
 */
export async function consumeFromInventoryAction(
  itemId: number
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    await consumeFromInventory(user.id, itemId)

    revalidatePath('/pantry')
    return { data: true }
  } catch (error) {
    console.error('Error consuming from inventory:', error)
    return { error: 'Wystąpił błąd podczas zużywania przedmiotu' }
  }
}

/**
 * Pobiera dostępne przedmioty w spiżarni
 */
export async function getInventoryAction(): Promise<
  ActionResult<UserInventoryItemDTO[]>
> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const items = await getAvailableInventory(user.id)

    return { data: items }
  } catch (error) {
    console.error('Error getting inventory:', error)
    return { error: 'Wystąpił błąd podczas pobierania spiżarni' }
  }
}

// ============================================================================
// Prep Action Categories (Admin)
// ============================================================================

/**
 * Pobiera kategorie czynności przygotowawczych
 */
export async function getPrepCategoriesAction(): Promise<
  ActionResult<Array<{ id: number; name: string; display_order: number }>>
> {
  try {
    const supabase = await createServerClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('prep_action_categories')
      .select('id, name, display_order')
      .order('display_order')

    if (error) {
      console.error('Error fetching prep categories:', error)
      return { error: 'Nie udało się pobrać kategorii' }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Error getting prep categories:', error)
    return { error: 'Wystąpił błąd podczas pobierania kategorii' }
  }
}
