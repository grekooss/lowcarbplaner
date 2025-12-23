/**
 * ViewModel Types dla widoku Przeglądarki Przepisów
 *
 * Ten plik zawiera typy specyficzne dla widoku `/recipes` i `/recipes/[id]`.
 * Typy DTO (RecipeDTO, IngredientDTO) importujemy z `dto.types.ts`.
 */

import type { RecipeDTO, IngredientDTO } from './dto.types'
import type { Enums } from './database.types'

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Odpowiedź z API dla listy przepisów (zgodna z planem API GET /recipes)
 */
export type RecipesResponse = {
  count: number
  next: string | null
  previous: string | null
  results: RecipeDTO[]
}

// ============================================================================
// Filter and State Types
// ============================================================================

/**
 * Stan filtrów w komponencie RecipesBrowserClient
 */
export type RecipeFiltersState = {
  meal_types: string[]
  limit: number
  offset: number
}

/**
 * Stan modala Auth Prompt
 */
export type AuthPromptState = {
  isOpen: boolean
  redirectRecipeId: number | null
}

// ============================================================================
// ViewModel Types
// ============================================================================

/**
 * Składniki pogrupowane według kategorii (ViewModel dla IngredientsList)
 */
export type GroupedIngredients = {
  category: Enums<'ingredient_category_enum'>
  items: IngredientDTO[]
}[]

// ============================================================================
// Constants and Label Mappings
// ============================================================================

/**
 * Mapowanie kategorii składników na polskie nazwy
 */
export const INGREDIENT_CATEGORY_LABELS: Record<
  Enums<'ingredient_category_enum'>,
  string
> = {
  vegetables: 'Warzywa',
  fruits: 'Owoce',
  meat: 'Mięso',
  fish: 'Ryby',
  dairy: 'Nabiał',
  eggs: 'Jajka',
  nuts_seeds: 'Orzechy i nasiona',
  oils_fats: 'Tłuszcze i oleje',
  spices_herbs: 'Przyprawy i zioła',
  flours: 'Mąki',
  beverages: 'Napoje',
  sweeteners: 'Słodziki',
  condiments: 'Dodatki',
  other: 'Inne',
}

/**
 * Mapowanie meal_types na polskie nazwy
 */
export const MEAL_TYPE_LABELS: Record<Enums<'meal_type_enum'>, string> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
  snack: 'Przekąska',
  snack_morning: 'Przekąska poranna',
  snack_afternoon: 'Przekąska popołudniowa',
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Grupuje składniki według kategorii (używane w IngredientsList)
 *
 * @param ingredients - Lista składników do pogrupowania
 * @returns Składniki pogrupowane według kategorii
 */
export function groupIngredientsByCategory(
  ingredients: IngredientDTO[]
): GroupedIngredients {
  const grouped = ingredients.reduce(
    (acc, ingredient) => {
      const category = ingredient.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(ingredient)
      return acc
    },
    {} as Record<string, IngredientDTO[]>
  )

  return Object.entries(grouped).map(([category, items]) => ({
    category: category as Enums<'ingredient_category_enum'>,
    items,
  }))
}

/**
 * Formatuje wartość makroskładnika z obsługą null values
 *
 * @param value - Wartość makroskładnika lub null
 * @param unit - Jednostka (np. 'kcal', 'g')
 * @returns Sformatowany string lub "—" dla null
 */
export function formatMacro(value: number | null, unit: string): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)}${unit}`
}
