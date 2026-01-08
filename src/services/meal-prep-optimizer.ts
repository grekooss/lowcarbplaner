/**
 * Meal Prep Optimizer Service v2.0
 *
 * Główne funkcjonalności:
 * - Tworzenie i zarządzanie sesjami gotowania
 * - Generowanie zoptymalizowanej osi czasu
 * - Rozwiązywanie zależności przepisów (rekurencja)
 * - Grupowanie Mise en Place
 * - Wykrywanie i rozwiązywanie konfliktów zasobów
 * - Skalowanie czasów dla batch cooking
 * - Zarządzanie wirtualną spiżarnią
 */

import { createAdminClient } from '@/lib/supabase/server'
import type {
  CookingSessionDTO,
  CookingSessionStatus,
  CookingTimelineDTO,
  TimelineStepDTO,
  MisePlaceGroupDTO,
  ResourceConflictDTO,
  RecipeInstructionDTO,
  RecipeDependencyNodeDTO,
  FlattenedIngredientDTO,
  PrepActionCategoryDTO,
  EquipmentDTO,
  PlannedMealDTO,
  InstructionActionType,
  UserInventoryItemDTO,
  AddToInventoryCommand,
} from '@/types/dto.types'

// ============================================================
// NOTE: Ten serwis wymaga uruchomienia migracji przed pełnym użyciem.
// Tabele recipe_components, recipe_instructions, cooking_sessions itp.
// muszą istnieć w bazie danych.
// ============================================================

// ============================================================
// Types
// ============================================================

type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

interface CreateSessionInput {
  user_id: string
  planned_meal_ids: number[]
  planned_date: string
  planned_start_time?: string
  skill_level?: SkillLevel
}

interface CreateSessionResult {
  session: CookingSessionDTO
  timeline: CookingTimelineDTO
}

interface TimelineOptions {
  skillLevel: SkillLevel
  portions: number
  basePortions: number
}

interface ScaledTime {
  active_minutes: number
  passive_minutes: number
  total_minutes: number
}

interface PlannedMealWithRecipe {
  id: number
  recipe_id: number
  meal_date: string
  meal_type: string
  recipes: {
    id: number
    name: string
    recipe_instructions: RecipeInstructionDTO[]
    recipe_equipment: {
      equipment_id: number
      quantity: number
      notes: string | null
      equipment: {
        id: number
        name: string
        name_plural: string | null
        category: string
        icon_name: string | null
        max_slots: number
        max_temperature_celsius: number | null
        flavor_conflict_category: string
      }
    }[]
  }
}

// ============================================================
// Constants
// ============================================================

const SKILL_MULTIPLIERS: Record<SkillLevel, number> = {
  beginner: 1.5,
  intermediate: 1.0,
  advanced: 0.8,
}

const ACTION_TYPE_ORDER: Record<InstructionActionType, number> = {
  prep: 1,
  active: 2,
  passive: 3,
  checkpoint: 4,
  assembly: 5,
}

// ============================================================
// Time Scaling
// ============================================================

/**
 * Skaluje czas kroku w zależności od typu skalowania i liczby porcji
 */
export function scaleStepTime(
  step: RecipeInstructionDTO,
  portions: number,
  basePortions: number = 1
): ScaledTime {
  const portionRatio = portions / basePortions

  let activeMinutes: number
  let passiveMinutes: number

  switch (step.time_scaling_type) {
    case 'constant':
      // Czas stały (pieczenie, gotowanie)
      activeMinutes = step.active_minutes
      passiveMinutes = step.passive_minutes
      break

    case 'logarithmic':
      // Czas rośnie logarytmicznie
      const logFactor = 1 + Math.log2(portionRatio) * step.time_scaling_factor
      activeMinutes = Math.round(step.active_minutes * logFactor)
      passiveMinutes = step.passive_minutes // passive zazwyczaj stały
      break

    case 'linear':
    default:
      // Czas rośnie liniowo (krojenie)
      activeMinutes = Math.round(step.active_minutes * portionRatio)
      passiveMinutes = step.passive_minutes // passive zazwyczaj stały
      break
  }

  return {
    active_minutes: activeMinutes,
    passive_minutes: passiveMinutes,
    total_minutes: activeMinutes + passiveMinutes,
  }
}

// ============================================================
// Recipe Dependencies
// ============================================================

/**
 * Rozwiązuje zależności przepisów (rekurencyjne komponenty)
 *
 * NOTE: Wymaga tabeli recipe_components z migracji.
 * Przed uruchomieniem migracji zwraca puste drzewo.
 */
export async function resolveRecipeDependencies(
  recipeIds: number[]
): Promise<RecipeDependencyNodeDTO[]> {
  const supabase = createAdminClient()

  // Pobierz wszystkie komponenty
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: components, error } = await (supabase as any).from(
    'recipe_components'
  ).select(`
      parent_recipe_id,
      component_recipe_id,
      required_amount,
      unit,
      fallback_ingredient_id
    `)

  // Jeśli tabela nie istnieje, zwróć puste drzewo
  if (error || !components) {
    console.warn('recipe_components table not available:', error?.message)
    return recipeIds.map((id) => ({
      recipe_id: id,
      recipe_name: '',
      required_amount: 0,
      unit: '',
      depth: 0,
      children: [],
    }))
  }

  // Pobierz nazwy przepisów
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, name')
    .in('id', recipeIds)

  const recipeNameMap = new Map(recipes?.map((r) => [r.id, r.name]) || [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ComponentRow = any

  // Zbuduj drzewo zależności
  function buildTree(
    recipeId: number,
    depth: number = 0
  ): RecipeDependencyNodeDTO | null {
    const directComponents: ComponentRow[] =
      components?.filter(
        (c: ComponentRow) => c.parent_recipe_id === recipeId
      ) || []

    if (directComponents.length === 0) {
      return {
        recipe_id: recipeId,
        recipe_name: recipeNameMap.get(recipeId) || '',
        required_amount: 0,
        unit: '',
        depth,
        children: [],
      }
    }

    return {
      recipe_id: recipeId,
      recipe_name: recipeNameMap.get(recipeId) || '',
      required_amount: 0,
      unit: '',
      depth,
      children: directComponents.map((c: ComponentRow) => {
        const childTree = buildTree(c.component_recipe_id, depth + 1)
        return {
          recipe_id: c.component_recipe_id,
          recipe_name: recipeNameMap.get(c.component_recipe_id) || '',
          required_amount: c.required_amount,
          unit: c.unit,
          depth: depth + 1,
          children: childTree?.children || [],
        }
      }),
    }
  }

  return recipeIds
    .map((id) => buildTree(id))
    .filter((node): node is RecipeDependencyNodeDTO => node !== null)
}

/**
 * Spłaszcza składniki z zagnieżdżonych przepisów
 *
 * NOTE: Wymaga tabeli recipe_components z migracji.
 */
export async function flattenIngredients(
  recipeId: number,
  portions: number
): Promise<FlattenedIngredientDTO[]> {
  const supabase = createAdminClient()
  const allIngredients: FlattenedIngredientDTO[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type IngredientRow = any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ComponentRow = any

  // Rekurencyjnie zbierz składniki
  async function collectIngredients(
    currentRecipeId: number,
    multiplier: number,
    recipeName: string
  ) {
    // Pobierz składniki przepisu
    const { data: recipeIngredients } = await supabase
      .from('recipe_ingredients')
      .select(
        `
        ingredient_id,
        amount_grams,
        unit,
        ingredients (
          id,
          name
        )
      `
      )
      .eq('recipe_id', currentRecipeId)

    for (const ri of (recipeIngredients || []) as IngredientRow[]) {
      const scaledAmount = (ri.amount_grams || 0) * multiplier * portions
      const ingredientName =
        (ri.ingredients as { id: number; name: string } | null)?.name || ''

      // Sprawdź czy składnik już istnieje (agregacja)
      const existing = allIngredients.find(
        (i) => i.ingredient_id === ri.ingredient_id
      )
      if (existing) {
        existing.amount += scaledAmount
      } else {
        allIngredients.push({
          ingredient_id: ri.ingredient_id,
          name: ingredientName,
          amount: scaledAmount,
          unit: ri.unit || 'g',
          source_recipe_id: currentRecipeId,
          source_recipe_name: recipeName,
        })
      }
    }

    // Pobierz komponenty przepisu (zagnieżdżone przepisy)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: components, error } = await (supabase as any)
      .from('recipe_components')
      .select(
        `
        component_recipe_id,
        required_amount,
        unit,
        component_recipe:recipes!component_recipe_id (
          id,
          name
        )
      `
      )
      .eq('parent_recipe_id', currentRecipeId)

    // Jeśli tabela nie istnieje, pomiń komponenty
    if (error) {
      return
    }

    // Rekurencja dla komponentów
    for (const comp of (components || []) as ComponentRow[]) {
      const componentRecipe = comp.component_recipe as {
        id: number
        name: string
      } | null
      if (componentRecipe) {
        // Zakładamy że required_amount to % bazowego przepisu lub gramy
        const childMultiplier = comp.required_amount / 100
        await collectIngredients(
          comp.component_recipe_id,
          multiplier * childMultiplier,
          componentRecipe.name
        )
      }
    }
  }

  // Pobierz nazwę głównego przepisu
  const { data: recipe } = await supabase
    .from('recipes')
    .select('name')
    .eq('id', recipeId)
    .single()

  await collectIngredients(recipeId, 1, recipe?.name || '')

  return allIngredients
}

// ============================================================
// Mise en Place Grouping
// ============================================================

/**
 * Grupuje kroki przygotowawcze w grupy Mise en Place
 */
export function groupMisePlaceTasks(
  steps: RecipeInstructionDTO[],
  recipeNames: Map<number, string>,
  prepCategories: PrepActionCategoryDTO[]
): MisePlaceGroupDTO[] {
  const groups: Map<number, MisePlaceGroupDTO> = new Map()

  // Filtruj tylko kroki typu 'prep' z kategorią
  const prepSteps = steps.filter(
    (s) => s.action_type === 'prep' && s.prep_action_category_id
  )

  for (const step of prepSteps) {
    const categoryId = step.prep_action_category_id!
    const category = prepCategories.find((c) => c.id === categoryId)

    if (!category) continue

    if (!groups.has(categoryId)) {
      groups.set(categoryId, {
        id: `mise-${categoryId}`,
        category,
        tasks: [],
        total_estimated_minutes: 0,
      })
    }

    const group = groups.get(categoryId)!
    group.tasks.push({
      recipe_id: step.recipe_id,
      recipe_name: recipeNames.get(step.recipe_id) || '',
      step_number: step.step_number,
      description: step.description,
      estimated_minutes: step.active_minutes,
      ingredients: [], // TODO: wyekstrahować składniki z opisu
    })
    group.total_estimated_minutes += step.active_minutes
  }

  return Array.from(groups.values()).sort(
    (a, b) => a.category.sort_order - b.category.sort_order
  )
}

// ============================================================
// Resource Conflict Detection
// ============================================================

/**
 * Wykrywa konflikty zasobów w osi czasu
 */
export function detectResourceConflicts(
  steps: TimelineStepDTO[],
  equipment: Map<number, EquipmentDTO>
): ResourceConflictDTO[] {
  const conflicts: ResourceConflictDTO[] = []

  // Grupuj kroki które nakładają się czasowo
  for (let i = 0; i < steps.length; i++) {
    const stepA = steps[i]
    if (!stepA) continue

    for (let j = i + 1; j < steps.length; j++) {
      const stepB = steps[j]
      if (!stepB) continue

      // Sprawdź czy kroki nakładają się czasowo
      const aEnd = stepA.start_minute + stepA.total_duration
      const bEnd = stepB.start_minute + stepB.total_duration

      const overlaps =
        (stepA.start_minute < bEnd && aEnd > stepB.start_minute) ||
        (stepB.start_minute < aEnd && bEnd > stepA.start_minute)

      if (!overlaps) continue

      // Sprawdź konflikty sprzętu
      for (const eqIdA of stepA.equipment_ids) {
        for (const eqIdB of stepB.equipment_ids) {
          if (eqIdA !== eqIdB) continue

          const eq = equipment.get(eqIdA)
          if (!eq) continue

          // Konflikt slotów - zakładamy domyślny max_slots = 1
          const maxSlots = 1 // domyślna wartość jeśli brak w typie
          const totalSlots =
            stepA.equipment_slot_count + stepB.equipment_slot_count
          if (totalSlots > maxSlots) {
            conflicts.push({
              type: 'equipment_slot',
              equipment_id: eqIdA,
              equipment_name: eq.name,
              conflicting_steps: [
                {
                  step_id: stepA.id,
                  recipe_name: stepA.recipe_name,
                  description: stepA.description,
                },
                {
                  step_id: stepB.id,
                  recipe_name: stepB.recipe_name,
                  description: stepB.description,
                },
              ],
              resolution_suggestion: `Wykonaj "${stepA.description}" przed "${stepB.description}"`,
            })
          }

          // Konflikt temperatury
          if (
            stepA.required_temperature &&
            stepB.required_temperature &&
            Math.abs(stepA.required_temperature - stepB.required_temperature) >
              30
          ) {
            conflicts.push({
              type: 'temperature',
              equipment_id: eqIdA,
              equipment_name: eq.name,
              conflicting_steps: [
                {
                  step_id: stepA.id,
                  recipe_name: stepA.recipe_name,
                  description: stepA.description,
                },
                {
                  step_id: stepB.id,
                  recipe_name: stepB.recipe_name,
                  description: stepB.description,
                },
              ],
              resolution_suggestion: `${eq.name} wymaga różnych temperatur: ${stepA.required_temperature}°C i ${stepB.required_temperature}°C`,
            })
          }
        }
      }
    }
  }

  return conflicts
}

// ============================================================
// Timeline Generation
// ============================================================

/**
 * Generuje zoptymalizowaną oś czasu gotowania
 */
export function generateTimeline(
  meals: PlannedMealWithRecipe[],
  options: TimelineOptions,
  prepCategories: PrepActionCategoryDTO[]
): CookingTimelineDTO {
  const skillMultiplier = SKILL_MULTIPLIERS[options.skillLevel]
  const steps: TimelineStepDTO[] = []
  const recipeNames = new Map<number, string>()
  const equipmentMap = new Map<number, EquipmentDTO>()

  // Zbierz wszystkie instrukcje ze wszystkich przepisów
  const allInstructions: {
    recipe_id: number
    recipe_name: string
    instruction: RecipeInstructionDTO
    equipment: EquipmentDTO[]
  }[] = []

  for (const meal of meals) {
    const recipe = meal.recipes
    if (!recipe?.recipe_instructions) continue

    recipeNames.set(recipe.id, recipe.name)

    // Zbierz sprzęt
    const recipeEquipment: EquipmentDTO[] = (recipe.recipe_equipment || []).map(
      (re) => {
        const eq: EquipmentDTO = {
          id: re.equipment.id,
          name: re.equipment.name,
          name_plural: re.equipment.name_plural,
          category: re.equipment.category as EquipmentDTO['category'],
          icon_name: re.equipment.icon_name,
          quantity: re.quantity,
          notes: re.notes,
        }
        equipmentMap.set(eq.id, eq)
        return eq
      }
    )

    for (const instruction of recipe.recipe_instructions) {
      allInstructions.push({
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        instruction,
        equipment: recipeEquipment.filter((e) =>
          instruction.equipment_ids.includes(e.id)
        ),
      })
    }
  }

  // Sortuj instrukcje: prep -> active -> passive -> checkpoint -> assembly
  allInstructions.sort((a, b) => {
    const orderA = ACTION_TYPE_ORDER[a.instruction.action_type] || 2
    const orderB = ACTION_TYPE_ORDER[b.instruction.action_type] || 2
    if (orderA !== orderB) return orderA - orderB
    return a.instruction.step_number - b.instruction.step_number
  })

  // Generuj kroki osi czasu
  let currentMinute = 0

  for (const item of allInstructions) {
    const { instruction, recipe_id, recipe_name, equipment } = item

    // Oblicz przeskalowany czas
    const scaledTime = scaleStepTime(
      instruction,
      options.portions,
      options.basePortions
    )

    // Zastosuj mnożnik umiejętności tylko do aktywnego czasu
    const activeTime = Math.round(scaledTime.active_minutes * skillMultiplier)
    const passiveTime = scaledTime.passive_minutes

    const step: TimelineStepDTO = {
      id: `${recipe_id}-${instruction.step_number}`,
      recipe_id,
      recipe_name,
      step_number: instruction.step_number,
      description: instruction.description,
      action_type: instruction.action_type,

      // Timing
      start_minute: currentMinute,
      active_duration: instruction.active_minutes,
      passive_duration: instruction.passive_minutes,
      total_duration: instruction.active_minutes + instruction.passive_minutes,

      // Skalowanie
      time_scaling_type: instruction.time_scaling_type,
      scaled_active_duration: activeTime,
      scaled_passive_duration: passiveTime,

      // Równoległość
      parallel_group_id: null,
      can_run_parallel: instruction.is_parallelizable,

      // Sprzęt
      equipment_ids: instruction.equipment_ids || [],
      equipment_names: equipment.map((e) => e.name),
      equipment_slot_count: instruction.equipment_slot_count,
      required_temperature: instruction.required_temperature_celsius,

      // Checkpointy
      checkpoint_type: instruction.checkpoint_type,
      checkpoint_condition: instruction.checkpoint_condition,

      // Status
      status: 'pending',

      // Pozostałe
      sensory_cues: instruction.sensory_cues || {},
      is_critical: instruction.is_critical_timing,
      prep_action_category_id: instruction.prep_action_category_id,
    }

    steps.push(step)

    // Aktualizuj currentMinute
    currentMinute += activeTime
    if (!instruction.is_parallelizable) {
      currentMinute += passiveTime
    }
  }

  // Grupuj Mise en Place
  const allRecipeInstructions = allInstructions.map((i) => i.instruction)
  const misePlaceGroups = groupMisePlaceTasks(
    allRecipeInstructions,
    recipeNames,
    prepCategories
  )

  // Wykryj konflikty zasobów
  const resourceConflicts = detectResourceConflicts(steps, equipmentMap)

  // Oblicz sumy
  const totalActive = steps.reduce(
    (sum, s) => sum + s.scaled_active_duration,
    0
  )
  const totalPassive = steps.reduce(
    (sum, s) => sum + s.scaled_passive_duration,
    0
  )

  // Oblicz wykorzystanie sprzętu
  const equipmentUtilization: Record<number, number> = {}
  for (const step of steps) {
    for (const eqId of step.equipment_ids) {
      equipmentUtilization[eqId] =
        (equipmentUtilization[eqId] || 0) + step.total_duration
    }
  }
  // Przelicz na procenty
  const totalTime = currentMinute || 1
  for (const eqId of Object.keys(equipmentUtilization)) {
    const numId = Number(eqId)
    const currentValue = equipmentUtilization[numId] ?? 0
    equipmentUtilization[numId] = Math.round((currentValue / totalTime) * 100)
  }

  return {
    session_id: '',
    total_estimated_minutes: currentMinute,
    active_minutes: totalActive,
    passive_minutes: totalPassive,
    steps,
    mise_place_groups: misePlaceGroups,
    resource_conflicts: resourceConflicts,
    required_equipment: Array.from(equipmentMap.values()),
    equipment_utilization: equipmentUtilization,
    recipe_components: [],
    component_production_order: [],
  }
}

// ============================================================
// Session Management
// ============================================================

/**
 * Tworzy nową sesję gotowania
 *
 * NOTE: Wymaga tabel z migracji (cooking_sessions, session_meals, prep_action_categories, recipe_instructions)
 */
export async function createCookingSession(
  input: CreateSessionInput
): Promise<CreateSessionResult> {
  const supabase = createAdminClient()
  const skillLevel = input.skill_level || 'intermediate'

  // 1. Pobierz planned_meals z przepisami
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: meals, error: mealsError } = await (supabase as any)
    .from('planned_meals')
    .select(
      `
      id,
      recipe_id,
      meal_date,
      meal_type,
      recipes (
        id,
        name,
        recipe_instructions (
          id,
          step_number,
          description,
          active_minutes,
          passive_minutes,
          time_scaling_type,
          time_scaling_factor,
          action_type,
          is_parallelizable,
          equipment_ids,
          equipment_slot_count,
          required_temperature_celsius,
          prep_action_category_id,
          checkpoint_condition,
          checkpoint_type,
          sensory_cues,
          is_critical_timing
        ),
        recipe_equipment (
          equipment_id,
          quantity,
          notes,
          equipment (
            id,
            name,
            name_plural,
            category,
            icon_name,
            max_slots,
            max_temperature_celsius,
            flavor_conflict_category
          )
        )
      )
    `
    )
    .in('id', input.planned_meal_ids)
    .eq('user_id', input.user_id)

  if (mealsError) {
    throw new Error(`Failed to fetch meals: ${mealsError.message}`)
  }

  if (!meals || meals.length === 0) {
    throw new Error('No meals found')
  }

  // 2. Pobierz kategorie prep
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prepCategories } = await (supabase as any)
    .from('prep_action_categories')
    .select('*')
    .order('sort_order')

  // 3. Generuj oś czasu
  const timeline = generateTimeline(
    meals as PlannedMealWithRecipe[],
    {
      skillLevel,
      portions: 1,
      basePortions: 1,
    },
    (prepCategories || []) as PrepActionCategoryDTO[]
  )

  // 4. Utwórz sesję w bazie
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: session, error: sessionError } = await (supabase as any)
    .from('cooking_sessions')
    .insert({
      user_id: input.user_id,
      planned_date: input.planned_date,
      planned_start_time: input.planned_start_time,
      estimated_total_minutes: timeline.total_estimated_minutes,
      status: 'planned',
    })
    .select()
    .single()

  if (sessionError) {
    throw new Error(`Failed to create session: ${sessionError.message}`)
  }

  // 5. Dodaj posiłki do sesji
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionMeals = (meals as any[]).map((meal: any, index: number) => ({
    session_id: session.id,
    planned_meal_id: meal.id,
    is_source_meal: true,
    portions_to_cook: 1,
    cooking_order: index + 1,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: sessionMealsError } = await (supabase as any)
    .from('session_meals')
    .insert(sessionMeals)

  if (sessionMealsError) {
    throw new Error(
      `Failed to add meals to session: ${sessionMealsError.message}`
    )
  }

  // Uzupełnij session_id w timeline
  timeline.session_id = session.id

  return {
    session: {
      ...session,
      meals: [],
      step_progress: [],
      adjustments: [],
    } as CookingSessionDTO,
    timeline,
  }
}

/**
 * Pobiera sesję gotowania z pełnymi danymi
 *
 * NOTE: Wymaga tabel z migracji
 */
export async function getCookingSession(
  sessionId: string,
  userId: string
): Promise<CookingSessionDTO | null> {
  const supabase = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('cooking_sessions')
    .select(
      `
      *,
      session_meals (
        *,
        planned_meals (
          *,
          recipes (
            id,
            name,
            image_url,
            recipe_instructions (*)
          )
        )
      ),
      session_step_progress (*),
      session_adjustments (*)
    `
    )
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return data as CookingSessionDTO
}

/**
 * Aktualizuje status sesji
 *
 * NOTE: Wymaga tabeli cooking_sessions z migracji
 */
export async function updateSessionStatus(
  sessionId: string,
  userId: string,
  status: CookingSessionStatus,
  currentStepIndex?: number
): Promise<boolean> {
  const supabase = createAdminClient()

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'in_progress') {
    // Pobierz aktualną sesję żeby sprawdzić czy już ma actual_start_at
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentSession } = await (supabase as any)
      .from('cooking_sessions')
      .select('actual_start_at')
      .eq('id', sessionId)
      .single()

    if (!currentSession?.actual_start_at) {
      updateData.actual_start_at = new Date().toISOString()
    }
  }

  if (status === 'completed') {
    updateData.actual_end_at = new Date().toISOString()
  }

  if (currentStepIndex !== undefined) {
    updateData.current_step_index = currentStepIndex
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('cooking_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .eq('user_id', userId)

  return !error
}

/**
 * Oznacza krok jako ukończony
 *
 * NOTE: Wymaga tabeli session_step_progress z migracji
 */
export async function completeStep(
  sessionId: string,
  recipeId: number,
  stepNumber: number
): Promise<boolean> {
  const supabase = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('session_step_progress')
    .upsert(
      {
        session_id: sessionId,
        recipe_id: recipeId,
        step_number: stepNumber,
        is_completed: true,
        completed_at: new Date().toISOString(),
      },
      {
        onConflict: 'session_id,recipe_id,step_number',
      }
    )

  return !error
}

/**
 * Dodaje korektę czasową
 *
 * NOTE: Wymaga tabeli session_adjustments z migracji
 */
export async function addTimeAdjustment(
  sessionId: string,
  stepId: number | null,
  adjustmentType: 'time_add' | 'time_subtract' | 'skip' | 'repeat',
  adjustmentValue?: number,
  reason?: string
): Promise<boolean> {
  const supabase = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('session_adjustments').insert({
    session_id: sessionId,
    step_id: stepId,
    adjustment_type: adjustmentType,
    adjustment_value: adjustmentValue,
    reason,
  })

  return !error
}

// ============================================================
// Inventory Management
// ============================================================

/**
 * Dodaje pozycje do wirtualnej spiżarni
 *
 * NOTE: Wymaga tabeli user_inventory z migracji
 */
export async function addToInventory(
  userId: string,
  items: AddToInventoryCommand[]
): Promise<void> {
  const supabase = createAdminClient()

  const inventoryItems = items.map((item) => ({
    user_id: userId,
    item_type: item.item_type,
    ingredient_id: item.ingredient_id,
    recipe_id: item.recipe_id,
    quantity: item.quantity,
    unit: item.unit,
    storage_location: item.storage_location,
    expires_at: item.expires_at,
    source_session_id: item.source_session_id,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('user_inventory')
    .insert(inventoryItems)

  if (error) {
    throw new Error(`Failed to add to inventory: ${error.message}`)
  }
}

/**
 * Oznacza pozycję jako zużytą
 *
 * NOTE: Wymaga tabeli user_inventory z migracji
 */
export async function consumeFromInventory(
  userId: string,
  itemId: number
): Promise<void> {
  const supabase = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('user_inventory')
    .update({
      is_consumed: true,
      consumed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to consume inventory item: ${error.message}`)
  }
}

/**
 * Pobiera dostępne zapasy użytkownika
 *
 * NOTE: Wymaga tabeli user_inventory z migracji
 */
export async function getAvailableInventory(
  userId: string
): Promise<UserInventoryItemDTO[]> {
  const supabase = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('user_inventory')
    .select(
      `
      *,
      ingredients (*),
      recipes (id, name, image_url)
    `
    )
    .eq('user_id', userId)
    .eq('is_consumed', false)
    .order('expires_at', { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(`Failed to get inventory: ${error.message}`)
  }

  return (data || []) as UserInventoryItemDTO[]
}

/**
 * Pobiera posiłki na dany dzień do batch cooking
 */
export async function getMealsForBatchCooking(
  userId: string,
  date: string
): Promise<PlannedMealDTO[]> {
  const supabase = createAdminClient()

  console.log('[getMealsForBatchCooking] Query params:', { userId, date })

  const { data, error } = await supabase
    .from('planned_meals')
    .select(
      `
      *,
      recipes (
        id,
        name,
        slug,
        image_url,
        prep_time_min,
        cook_time_min,
        difficulty_level,
        recipe_equipment (
          equipment_id,
          quantity,
          notes,
          equipment (id, name, category)
        )
      )
    `
    )
    .eq('user_id', userId)
    .eq('meal_date', date)
    .order('meal_type')

  console.log('[getMealsForBatchCooking] Result:', {
    found: data?.length || 0,
    error: error?.message,
    firstMeal: data?.[0]
      ? { id: data[0].id, meal_date: data[0].meal_date }
      : null,
  })

  if (error) {
    throw new Error(`Failed to fetch meals: ${error.message}`)
  }

  return (data || []) as unknown as PlannedMealDTO[]
}
