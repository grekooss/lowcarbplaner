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
  RecipeComponentDTO,
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
  /** Błonnik pokarmowy */
  fiber_g: number | null
  /** Poliole (alkohole cukrowe) - opcjonalne dla kompatybilności wstecznej */
  polyols_g?: number | null
  fats_g: number | null
  /** Tłuszcze nasycone - opcjonalne dla kompatybilności wstecznej */
  saturated_fat_g?: number | null
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
 * Raw recipe instruction from Supabase join (recipe_instructions table)
 */
export interface RawRecipeInstruction {
  step_number: number
  description: string
}

/**
 * Raw recipe component from Supabase join (recipe_components table)
 * Represents a recipe used as an ingredient in another recipe
 */
export interface RawRecipeComponent {
  required_amount: number
  unit: string
  component_recipe: {
    id: number
    slug: string
    name: string
    total_calories: number | null
    total_protein_g: number | null
    total_carbs_g: number | null
    total_fats_g: number | null
  }
}

/**
 * Raw recipe type from Supabase query
 */
export interface RawRecipe {
  id: number
  /** SEO-friendly URL slug */
  slug: string
  name: string
  /** Instructions from recipe_instructions table (Meal Prep v2.0) */
  recipe_instructions?: RawRecipeInstruction[]
  meal_types: unknown
  tags: string[] | null
  image_url: string | null
  difficulty_level: unknown
  average_rating?: number | null
  reviews_count?: number
  prep_time_min?: number | null
  cook_time_min?: number | null

  // ==========================================================================
  // Servings / Porcje
  // ==========================================================================
  /** Liczba porcji z przepisu bazowego (np. chleb = 10 kromek) */
  base_servings: number
  /** Jednostka porcji w języku polskim */
  serving_unit: string | null
  /** Czy przepis nadaje się do batch cooking */
  is_batch_friendly: boolean
  /** Sugerowana ilość porcji do przygotowania na raz */
  suggested_batch_size?: number | null
  /** Minimalna liczba porcji do przygotowania */
  min_servings: number

  // ==========================================================================
  // Wartości odżywcze (dla CAŁEGO przepisu)
  // ==========================================================================
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  /** Błonnik całkowity */
  total_fiber_g: number | null
  /** Poliole całkowite (alkohole cukrowe) - opcjonalne dla kompatybilności wstecznej */
  total_polyols_g?: number | null
  /** Węglowodany netto (total_carbs_g - total_fiber_g - total_polyols_g) */
  total_net_carbs_g: number | null
  total_fats_g: number | null
  /** Całkowite tłuszcze nasycone - opcjonalne dla kompatybilności wstecznej */
  total_saturated_fat_g?: number | null
  recipe_ingredients?: RawRecipeIngredient[]
  recipe_equipment?: RawRecipeEquipment[]
  /** Recipe components (sub-recipes used as ingredients) */
  recipe_components?: RawRecipeComponent[]
}

/**
 * Normalizes recipe_instructions array from database to RecipeInstructions format
 *
 * Handles the recipe_instructions table format (Meal Prep v2.0):
 * - Array of objects: [{ step_number: 1, description: "..." }]
 *
 * Returns instructions sorted by step_number.
 *
 * @param instructions - Raw instructions array from recipe_instructions table
 * @returns Normalized array of instruction steps sorted by step number
 */
export function normalizeInstructions(
  instructions: RawRecipeInstruction[] | undefined | null
): RecipeInstructions {
  if (!instructions || !Array.isArray(instructions)) {
    return []
  }

  return instructions
    .filter(
      (item) =>
        item && typeof item.description === 'string' && item.description.trim()
    )
    .map((item) => ({
      step: item.step_number,
      description: item.description.trim(),
    }))
    .sort((a, b) => a.step - b.step)
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

      const carbsG = ri.carbs_g || 0
      const fiberG = ri.fiber_g || 0
      const polyolsG = ri.polyols_g || 0
      // Net Carbs = Total Carbs - Fiber - Polyols (zawsze >= 0)
      const netCarbsG = Math.max(0, carbsG - fiberG - polyolsG)

      return {
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        amount: conversion.amount,
        unit: conversion.unit,
        display_amount: conversion.display_amount,
        display_unit: conversion.display_unit,
        calories: ri.calories || 0,
        protein_g: ri.protein_g || 0,
        carbs_g: carbsG,
        fiber_g: fiberG,
        polyols_g: polyolsG,
        net_carbs_g: netCarbsG,
        fats_g: ri.fats_g || 0,
        saturated_fat_g: ri.saturated_fat_g || 0,
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

  // Transform recipe components (sub-recipes used as ingredients)
  const components: RecipeComponentDTO[] = (recipe.recipe_components || []).map(
    (rc) => {
      // Oblicz makroskładniki proporcjonalnie do wymaganej ilości
      // Przepisy mają wartości per porcja bazowa, więc skalujemy
      // Zakładamy że required_amount jest w gramach i przepis ma wartości per 100g lub per porcja
      const comp = rc.component_recipe
      return {
        recipe_id: comp.id,
        recipe_slug: comp.slug,
        recipe_name: comp.name,
        required_amount: rc.required_amount,
        unit: rc.unit,
        // Wartości makro są dla całego przepisu, nie skalujemy tutaj
        // bo to zależy od kontekstu użycia (ilość porcji)
        calories: comp.total_calories,
        protein_g: comp.total_protein_g,
        carbs_g: comp.total_carbs_g,
        fats_g: comp.total_fats_g,
      }
    }
  )

  // Process image URL if requested (for recipes.ts)
  const imageUrl = processImageUrl
    ? getRecipeImageUrl(recipe.image_url)
    : recipe.image_url

  // Oblicz net carbs z total carbs, fiber i polyols
  const totalCarbsG = recipe.total_carbs_g ?? 0
  const totalFiberG = recipe.total_fiber_g ?? 0
  const totalPolyolsG = recipe.total_polyols_g ?? 0
  // Użyj wartości z bazy jeśli dostępna, inaczej oblicz
  const totalNetCarbsG =
    recipe.total_net_carbs_g ??
    Math.max(0, totalCarbsG - totalFiberG - totalPolyolsG)

  // Servings - użyj wartości domyślnych jeśli brak w bazie
  const baseServings = recipe.base_servings ?? 1
  const servingUnit = recipe.serving_unit ?? 'porcja'
  const minServings = recipe.min_servings ?? 1

  // Oblicz wartości na porcję
  const caloriesPerServing =
    recipe.total_calories !== null
      ? Math.round(recipe.total_calories / baseServings)
      : null
  const proteinPerServing =
    recipe.total_protein_g !== null
      ? Math.round((recipe.total_protein_g / baseServings) * 10) / 10
      : null
  const carbsPerServing =
    recipe.total_carbs_g !== null
      ? Math.round((recipe.total_carbs_g / baseServings) * 10) / 10
      : null
  const netCarbsPerServing =
    totalNetCarbsG !== null
      ? Math.round((totalNetCarbsG / baseServings) * 10) / 10
      : null
  const fatsPerServing =
    recipe.total_fats_g !== null
      ? Math.round((recipe.total_fats_g / baseServings) * 10) / 10
      : null

  return {
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    instructions: normalizeInstructions(recipe.recipe_instructions),
    meal_types: recipe.meal_types as RecipeDTO['meal_types'],
    tags: recipe.tags,
    image_url: imageUrl,
    difficulty_level: recipe.difficulty_level as RecipeDTO['difficulty_level'],
    average_rating: recipe.average_rating ?? null,
    reviews_count: recipe.reviews_count ?? 0,
    prep_time_minutes: recipe.prep_time_min ?? null,
    cook_time_minutes: recipe.cook_time_min ?? null,

    // Servings / Porcje
    base_servings: baseServings,
    serving_unit: servingUnit,
    is_batch_friendly: recipe.is_batch_friendly ?? false,
    suggested_batch_size: recipe.suggested_batch_size ?? null,
    min_servings: minServings,

    // Wartości odżywcze (dla całego przepisu)
    total_calories: recipe.total_calories,
    total_protein_g: recipe.total_protein_g,
    total_carbs_g: recipe.total_carbs_g,
    total_fiber_g: recipe.total_fiber_g,
    total_polyols_g: recipe.total_polyols_g ?? null,
    total_net_carbs_g: totalNetCarbsG,
    total_fats_g: recipe.total_fats_g,
    total_saturated_fat_g: recipe.total_saturated_fat_g ?? null,

    // Wartości odżywcze na porcję
    calories_per_serving: caloriesPerServing,
    protein_per_serving: proteinPerServing,
    carbs_per_serving: carbsPerServing,
    net_carbs_per_serving: netCarbsPerServing,
    fats_per_serving: fatsPerServing,

    ingredients,
    equipment,
    components,
  }
}

/**
 * Supabase SELECT string for full recipe with ingredients.
 * Use this constant to ensure consistency across queries.
 * NOTE: Uses recipe_instructions table (Meal Prep v2.0) instead of deprecated instructions JSONB column.
 */
export const RECIPE_SELECT_FULL = `
  id,
  slug,
  name,
  meal_types,
  tags,
  image_url,
  difficulty_level,
  prep_time_min,
  cook_time_min,
  base_servings,
  serving_unit,
  is_batch_friendly,
  suggested_batch_size,
  min_servings,
  total_calories,
  total_protein_g,
  total_carbs_g,
  total_fiber_g,
  total_polyols_g,
  total_net_carbs_g,
  total_fats_g,
  total_saturated_fat_g,
  recipe_instructions (
    step_number,
    description
  ),
  recipe_ingredients (
    base_amount,
    unit,
    is_scalable,
    calories,
    protein_g,
    carbs_g,
    fiber_g,
    polyols_g,
    fats_g,
    saturated_fat_g,
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
  ),
  recipe_components!recipe_components_parent_recipe_id_fkey (
    required_amount,
    unit,
    component_recipe:recipes!recipe_components_component_recipe_id_fkey (
      id,
      slug,
      name,
      total_calories,
      total_protein_g,
      total_carbs_g,
      total_fats_g
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
