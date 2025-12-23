/**
 * Recipe Transformation Utilities
 *
 * Shared functions for transforming Supabase raw recipe rows to DTOs.
 * Used by both recipes.ts and planned-meals.ts Server Actions.
 */

import type {
  RecipeDTO,
  IngredientDTO,
  EquipmentDTO,
  RecipeInstructions,
} from '@/types/dto.types'
import { getRecipeImageUrl } from './supabase-storage'

/**
 * Raw recipe ingredient type from Supabase join
 */
export interface RawRecipeIngredient {
  base_amount: number
  unit: string
  is_scalable: boolean
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fats_g: number | null
  step_number: number | null
  ingredient: {
    id: number
    name: string
    category: unknown
  }
}

/**
 * Raw recipe equipment type from Supabase join
 */
export interface RawRecipeEquipment {
  quantity: number
  notes: string | null
  equipment: {
    id: number
    name: string
    name_plural: string | null
    category: unknown
    icon_name: string | null
  }
}

/**
 * Raw recipe type from Supabase query
 */
export interface RawRecipe {
  id: number
  name: string
  instructions: unknown
  meal_types: unknown
  tags: string[] | null
  image_url: string | null
  difficulty_level: unknown
  average_rating?: number | null
  reviews_count?: number
  prep_time_min?: number | null
  cook_time_min?: number | null
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
  recipe_ingredients?: RawRecipeIngredient[]
  recipe_equipment?: RawRecipeEquipment[]
}

/**
 * Normalizes raw instructions data to RecipeInstructions array
 *
 * Handles various input formats:
 * - Array of strings: ["Step 1", "Step 2"]
 * - Array of objects: [{ step: 1, description: "..." }]
 * - Object with steps array: { steps: [...] }
 * - JSON string containing any of the above
 *
 * @param raw - Raw instructions data from database
 * @returns Normalized array of instruction steps
 */
export function normalizeInstructions(raw: unknown): RecipeInstructions {
  const parseSteps = (input: unknown): RecipeInstructions => {
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
        (value): value is { step: number; description: string } =>
          value !== null
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

    return steps
  }

  if (raw === null || raw === undefined) {
    return []
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return normalizeInstructions(parsed)
    } catch {
      return []
    }
  }

  if (Array.isArray(raw)) {
    return parseSteps(raw)
  }

  if (typeof raw === 'object') {
    return handleObject(raw as Record<string, unknown>)
  }

  return []
}

/**
 * Options for transformRecipeToDTO
 */
export interface TransformOptions {
  /**
   * Whether to process image URL through getRecipeImageUrl utility.
   * Set to true for recipes.ts (full URL generation),
   * false for planned-meals.ts (raw URL passthrough).
   * @default false
   */
  processImageUrl?: boolean
}

/**
 * Transforms raw recipe row from Supabase to RecipeDTO
 *
 * @param recipe - Raw row from recipes table with joins
 * @param options - Transformation options
 * @returns RecipeDTO - Typed object matching the DTO interface
 *
 * @example
 * ```typescript
 * // In recipes.ts (process image URLs)
 * const dto = transformRecipeToDTO(recipe, { processImageUrl: true })
 *
 * // In planned-meals.ts (pass through raw URLs)
 * const dto = transformRecipeToDTO(recipe)
 * ```
 */
export function transformRecipeToDTO(
  recipe: RawRecipe,
  options: TransformOptions = {}
): RecipeDTO {
  const { processImageUrl = false } = options

  // Aggregate ingredients from recipe_ingredients + ingredients
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
      step_number: ri.step_number ?? null,
    })
  )

  // Aggregate equipment from recipe_equipment + equipment
  const equipment: EquipmentDTO[] = (recipe.recipe_equipment || []).map(
    (re) => ({
      id: re.equipment.id,
      name: re.equipment.name,
      name_plural: re.equipment.name_plural,
      category: re.equipment.category as EquipmentDTO['category'],
      icon_name: re.equipment.icon_name,
      quantity: re.quantity,
      notes: re.notes,
    })
  )

  // Process image URL if requested (for recipes.ts)
  const imageUrl = processImageUrl
    ? getRecipeImageUrl(recipe.image_url)
    : recipe.image_url

  return {
    id: recipe.id,
    name: recipe.name,
    instructions: normalizeInstructions(recipe.instructions),
    meal_types: recipe.meal_types as RecipeDTO['meal_types'],
    tags: recipe.tags,
    image_url: imageUrl,
    difficulty_level: recipe.difficulty_level as RecipeDTO['difficulty_level'],
    average_rating: recipe.average_rating ?? null,
    reviews_count: recipe.reviews_count ?? 0,
    prep_time_minutes: recipe.prep_time_min ?? null,
    cook_time_minutes: recipe.cook_time_min ?? null,
    total_calories: recipe.total_calories,
    total_protein_g: recipe.total_protein_g,
    total_carbs_g: recipe.total_carbs_g,
    total_fats_g: recipe.total_fats_g,
    ingredients,
    equipment,
  }
}

/**
 * Supabase SELECT string for full recipe with ingredients.
 * Use this constant to ensure consistency across queries.
 */
export const RECIPE_SELECT_FULL = `
  id,
  name,
  instructions,
  meal_types,
  tags,
  image_url,
  difficulty_level,
  prep_time_min,
  cook_time_min,
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
  ),
  recipe_equipment (
    quantity,
    notes,
    equipment (
      id,
      name,
      name_plural,
      category,
      icon_name
    )
  )
`

/**
 * Supabase SELECT string for planned meal with recipe.
 * Includes all fields needed for PlannedMealDTO transformation.
 */
export const PLANNED_MEAL_SELECT_FULL = `
  id,
  meal_date,
  meal_type,
  is_eaten,
  ingredient_overrides,
  created_at,
  recipe:recipes (
    ${RECIPE_SELECT_FULL.trim()}
  )
`
