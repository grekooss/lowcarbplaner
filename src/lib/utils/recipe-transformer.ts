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
 * Unit conversion data from ingredient_unit_conversions table
 */
export interface RawUnitConversion {
  unit_name: string
  grams_equivalent: number
}

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
    unit: string
    ingredient_unit_conversions?: RawUnitConversion[]
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
 * Result of unit conversion
 */
export interface UnitConversionResult {
  /** Original amount (g/ml) - for calculations */
  amount: number
  /** Original unit (g/ml) - for calculations */
  unit: string
  /** Display amount in friendly unit (e.g., 1 sztuka) */
  display_amount: number
  /** Display unit name (e.g., "sztuka"), null if no conversion */
  display_unit: string | null
}

/**
 * Converts grams to a user-friendly unit if a matching conversion exists.
 *
 * Logic:
 * 1. Always preserves original amount/unit for calculations
 * 2. Adds display_amount/display_unit for user-friendly display
 * 3. Matches whole numbers and half units (within 1% tolerance)
 *
 * @param originalAmount - Amount from recipe_ingredients.base_amount
 * @param originalUnit - Unit from recipe_ingredients.unit
 * @param conversions - Available unit conversions for this ingredient
 * @returns Object with original and display amounts/units
 *
 * @example
 * // 60g egg with conversion { unit_name: 'sztuka', grams_equivalent: 60 }
 * // Returns: { amount: 60, unit: 'g', display_amount: 1, display_unit: 'sztuka' }
 */
export function convertToUserFriendlyUnit(
  originalAmount: number,
  originalUnit: string,
  conversions?: RawUnitConversion[]
): UnitConversionResult {
  // Base result - no conversion
  const result: UnitConversionResult = {
    amount: originalAmount,
    unit: originalUnit,
    display_amount: originalAmount,
    display_unit: null,
  }

  // Only convert from grams/ml
  if (originalUnit !== 'g' && originalUnit !== 'ml') {
    return result
  }

  // No conversions available
  if (!conversions || conversions.length === 0) {
    return result
  }

  // Try to find a matching conversion
  for (const conv of conversions) {
    const unitCount = originalAmount / conv.grams_equivalent
    const roundedCount = Math.round(unitCount)

    // Check if it's a whole number (within 1% tolerance)
    if (roundedCount > 0 && Math.abs(unitCount - roundedCount) < 0.01) {
      return {
        ...result,
        display_amount: roundedCount,
        display_unit: conv.unit_name,
      }
    }

    // Check for half units (0.5) - common for eggs, etc.
    const halfCount = Math.round(unitCount * 2) / 2
    if (halfCount > 0 && Math.abs(unitCount - halfCount) < 0.01) {
      return {
        ...result,
        display_amount: halfCount,
        display_unit: conv.unit_name,
      }
    }
  }

  // No good conversion found
  return result
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
    (ri) => {
      // Convert grams to user-friendly units if possible
      const conversion = convertToUserFriendlyUnit(
        ri.base_amount,
        ri.unit,
        ri.ingredient.ingredient_unit_conversions
      )

      return {
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        amount: conversion.amount,
        unit: conversion.unit,
        display_amount: conversion.display_amount,
        display_unit: conversion.display_unit,
        calories: ri.calories || 0,
        protein_g: ri.protein_g || 0,
        carbs_g: ri.carbs_g || 0,
        fats_g: ri.fats_g || 0,
        category: ri.ingredient.category as IngredientDTO['category'],
        is_scalable: ri.is_scalable,
        step_number: ri.step_number ?? null,
      }
    }
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
      category,
      unit,
      ingredient_unit_conversions (
        unit_name,
        grams_equivalent
      )
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
