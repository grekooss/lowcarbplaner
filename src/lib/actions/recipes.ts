/**
 * Server Actions for Recipes API
 *
 * Implementuje logikę biznesową dla operacji na przepisach:
 * - GET /recipes (paginacja + filtrowanie)
 * - GET /recipes/{id} (szczegóły przepisu)
 *
 * @see .ai/10 API-PLAN.md
 */

'use server'

import { createAdminClient } from '@/lib/supabase/server'
import type {
  RecipeDTO,
  IngredientDTO,
  RecipeInstructions,
} from '@/types/dto.types'
import {
  recipeQueryParamsSchema,
  type RecipeQueryParamsInput,
} from '@/lib/validation/recipes'

/**
 * Typ odpowiedzi dla listy przepisów (zgodny z planem API)
 */
type RecipesResponse = {
  count: number
  next: string | null
  previous: string | null
  results: RecipeDTO[]
}

/**
 * Standardowy typ wyniku Server Action (Discriminated Union)
 */
type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string }

/**
 * Transformuje raw recipe row z Supabase do RecipeDTO
 *
 * @param recipe - Raw row z tabeli content.recipes + joins
 * @returns RecipeDTO - Typowany obiekt zgodny z DTO
 */
function normalizeInstructions(raw: unknown): RecipeInstructions {
  const parseSteps = (input: unknown): RecipeInstructions['steps'] => {
    if (!Array.isArray(input)) {
      return []
    }

    return input
      .map((item, index) => {
        if (typeof item === 'string') {
          const description = item.trim()
          if (!description) return null
          return { step: index + 1, description }
        }

        if (item && typeof item === 'object') {
          const stepObj = item as Record<string, unknown>
          const rawDescription =
            typeof stepObj.description === 'string'
              ? stepObj.description
              : typeof stepObj.text === 'string'
                ? stepObj.text
                : ''
          const description = rawDescription.trim()
          if (!description) return null

          const stepNumber =
            typeof stepObj.step === 'number' && Number.isFinite(stepObj.step)
              ? stepObj.step
              : index + 1

          return {
            step: stepNumber,
            description,
          }
        }

        return null
      })
      .filter(
        (value): value is RecipeInstructions['steps'][number] => value !== null
      )
  }

  const handleObject = (value: Record<string, unknown>): RecipeInstructions => {
    const preferredSteps = Array.isArray(value.steps)
      ? value.steps
      : Array.isArray(value.step_list)
        ? value.step_list
        : []

    let steps = parseSteps(preferredSteps)

    if (steps.length === 0) {
      const numericKeys = Object.keys(value)
        .filter((key) => Number.isInteger(Number(key)))
        .map((key) => value[key])

      steps = parseSteps(numericKeys)
    }

    const prepRaw = value.prep_time_minutes
    const cookRaw = value.cook_time_minutes

    const normalizeTime = (input: unknown): number | undefined => {
      if (typeof input === 'number' && Number.isFinite(input)) {
        return input
      }
      if (typeof input === 'string') {
        const parsed = Number.parseInt(input, 10)
        return Number.isFinite(parsed) ? parsed : undefined
      }
      return undefined
    }

    return {
      steps,
      prep_time_minutes: normalizeTime(prepRaw),
      cook_time_minutes: normalizeTime(cookRaw),
    }
  }

  if (raw === null || raw === undefined) {
    return { steps: [] }
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return normalizeInstructions(parsed)
    } catch {
      return { steps: [] }
    }
  }

  if (Array.isArray(raw)) {
    return { steps: parseSteps(raw) }
  }

  if (typeof raw === 'object') {
    return handleObject(raw as Record<string, unknown>)
  }

  return { steps: [] }
}

function transformRecipeToDTO(recipe: {
  id: number
  name: string
  instructions: unknown
  meal_types: unknown
  tags: string[] | null
  image_url: string | null
  difficulty_level: unknown
  average_rating: number | null
  reviews_count: number
  health_score: number | null
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
  recipe_ingredients?: {
    base_amount: number
    unit: string
    is_scalable: boolean
    calories: number | null
    protein_g: number | null
    carbs_g: number | null
    fats_g: number | null
    ingredient: {
      id: number
      name: string
      category: unknown
    }
  }[]
}): RecipeDTO {
  // Agregacja składników z recipe_ingredients + ingredients
  const ingredients: IngredientDTO[] = (recipe.recipe_ingredients || []).map(
    (ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      amount: ri.base_amount,
      unit: ri.unit,
      calories: ri.calories || 0,
      protein_g: ri.protein_g || 0,
      carbs_g: ri.carbs_g || 0,
      fats_g: ri.fats_g || 0,
      category: ri.ingredient.category as IngredientDTO['category'],
      is_scalable: ri.is_scalable,
    })
  )

  return {
    id: recipe.id,
    name: recipe.name,
    instructions: normalizeInstructions(recipe.instructions),
    meal_types: recipe.meal_types as RecipeDTO['meal_types'],
    tags: recipe.tags,
    image_url: recipe.image_url,
    difficulty_level: recipe.difficulty_level as RecipeDTO['difficulty_level'],
    average_rating: recipe.average_rating,
    reviews_count: recipe.reviews_count,
    health_score: recipe.health_score,
    total_calories: recipe.total_calories,
    total_protein_g: recipe.total_protein_g,
    total_carbs_g: recipe.total_carbs_g,
    total_fats_g: recipe.total_fats_g,
    ingredients,
  }
}

/**
 * GET /recipes - Pobiera listę przepisów z paginacją i filtrowaniem
 *
 * @param params - Parametry zapytania (limit, offset, tags, meal_types)
 * @returns Lista przepisów z metadanymi paginacji
 *
 * @example
 * ```typescript
 * const result = await getRecipes({ limit: 10, offset: 0, meal_types: 'breakfast,lunch' })
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.results) // RecipeDTO[]
 * }
 * ```
 */
export async function getRecipes(
  params: RecipeQueryParamsInput
): Promise<ActionResult<RecipesResponse>> {
  try {
    // 1. Walidacja parametrów wejściowych
    const validated = recipeQueryParamsSchema.safeParse(params)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe parametry zapytania: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
      }
    }

    const { limit, offset, tags, meal_types } = validated.data

    // 2. Utworzenie Supabase Admin client (content schema to publiczne dane)
    const supabase = createAdminClient()

    // 3. Budowanie zapytania z paginacją
    let query = supabase
      .from('recipes')
      .select(
        `
        id,
        name,
        instructions,
        meal_types,
        tags,
        image_url,
        difficulty_level,
        average_rating,
        reviews_count,
        health_score,
        total_calories,
        total_protein_g,
        total_carbs_g,
        total_fats_g,
        recipe_ingredients (
          base_amount,
          unit,
          is_scalable,
          calories,
          protein_g,
          carbs_g,
          fats_g,
          ingredient:ingredients (
            id,
            name,
            category
          )
        )
      `,
        { count: 'exact' }
      )
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // 4. Filtrowanie po meal_types (array overlap)
    if (meal_types && meal_types.length > 0) {
      query = query.overlaps('meal_types', meal_types)
    }

    // 5. Filtrowanie po tags (array overlap)
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    // 6. Wykonanie zapytania
    const { data, error, count } = await query

    if (error) {
      console.error('Błąd Supabase w getRecipes:', error)
      return { error: `Błąd bazy danych: ${error.message}` }
    }

    // 7. Transformacja do DTO
    const results = (data || []).map(transformRecipeToDTO)

    // 8. Generowanie linków next/previous (zgodnie z planem API)
    const totalCount = count ?? 0
    const hasNext = offset + limit < totalCount
    const hasPrevious = offset > 0

    const baseUrl = '/recipes' // Lub dynamicznie z request.url
    const next = hasNext
      ? `${baseUrl}?limit=${limit}&offset=${offset + limit}${tags ? `&tags=${tags.join(',')}` : ''}${meal_types ? `&meal_types=${meal_types.join(',')}` : ''}`
      : null

    const previous = hasPrevious
      ? `${baseUrl}?limit=${limit}&offset=${Math.max(0, offset - limit)}${tags ? `&tags=${tags.join(',')}` : ''}${meal_types ? `&meal_types=${meal_types.join(',')}` : ''}`
      : null

    // 9. Zwrócenie wyniku
    return {
      data: {
        count: totalCount,
        next,
        previous,
        results,
      },
    }
  } catch (err) {
    console.error('Nieoczekiwany błąd w getRecipes:', err)
    return {
      error: 'Wewnętrzny błąd serwera',
    }
  }
}

/**
 * GET /recipes/{id} - Pobiera szczegółowe informacje o pojedynczym przepisie
 *
 * @param recipeId - ID przepisu
 * @returns RecipeDTO z pełnymi szczegółami (składniki, instrukcje)
 *
 * @example
 * ```typescript
 * const result = await getRecipeById(101)
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.name) // "Jajecznica z boczkiem"
 * }
 * ```
 */
export async function getRecipeById(
  recipeId: number
): Promise<ActionResult<RecipeDTO>> {
  try {
    // 1. Walidacja ID
    if (!recipeId || recipeId <= 0) {
      return { error: 'Nieprawidłowe ID przepisu' }
    }

    // 2. Utworzenie Supabase Admin client (content schema to publiczne dane)
    const supabase = createAdminClient()

    // 3. Zapytanie z pełnymi szczegółami
    const { data, error } = await supabase
      .from('recipes')
      .select(
        `
        id,
        name,
        instructions,
        meal_types,
        tags,
        image_url,
        difficulty_level,
        average_rating,
        reviews_count,
        health_score,
        total_calories,
        total_protein_g,
        total_carbs_g,
        total_fats_g,
        recipe_ingredients (
          base_amount,
          unit,
          is_scalable,
          calories,
          protein_g,
          carbs_g,
          fats_g,
          step_number,
          ingredient:ingredients (
            id,
            name,
            category
          )
        )
      `
      )
      .eq('id', recipeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Przepis nie został znaleziony' }
      }
      console.error('Błąd Supabase w getRecipeById:', error)
      return { error: `Błąd bazy danych: ${error.message}` }
    }

    // 4. Transformacja do DTO
    const recipe = transformRecipeToDTO(data)

    return { data: recipe }
  } catch (err) {
    console.error('Nieoczekiwany błąd w getRecipeById:', err)
    return { error: 'Wewnętrzny błąd serwera' }
  }
}
