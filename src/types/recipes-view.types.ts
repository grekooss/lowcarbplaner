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
 * Uwaga: snack_morning i snack_afternoon wyświetlane są jako "Przekąska" dla uproszczenia UI
 */
export const MEAL_TYPE_LABELS: Record<Enums<'meal_type_enum'>, string> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
  snack: 'Przekąska',
  snack_morning: 'Przekąska',
  snack_afternoon: 'Przekąska',
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

/**
 * Formatuje ilość składnika do wyświetlenia
 *
 * Jeśli składnik ma konwersję jednostki, pokazuje przyjazny format:
 * "1 sztuka (60g)" - przyjazna jednostka + oryginalna w nawiasie
 *
 * Jeśli nie ma konwersji, pokazuje tylko oryginalną wartość:
 * "60g"
 *
 * @param ingredient - Składnik z danymi o jednostkach
 * @param currentAmount - Opcjonalna aktualna ilość (np. po modyfikacji +/-)
 * @returns Sformatowany string do wyświetlenia
 *
 * @example
 * // Z konwersją: "1 sztuka (60g)"
 * // Bez konwersji: "60g"
 * // Z modyfikacją: "1 sztuka (72g)" - gdy currentAmount=72
 */
export function formatIngredientAmount(
  ingredient: IngredientDTO,
  currentAmount?: number
): string {
  const amount = currentAmount ?? ingredient.amount

  // Format amount: remove unnecessary decimals (.00)
  const formatNumber = (num: number): string => {
    const rounded = Math.round(num * 100) / 100
    return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2)
  }

  if (ingredient.display_unit) {
    // Oblicz display_amount proporcjonalnie jeśli currentAmount jest podane
    let displayAmount = ingredient.display_amount
    if (currentAmount !== undefined && ingredient.amount > 0) {
      displayAmount =
        (currentAmount / ingredient.amount) * ingredient.display_amount
    }

    return `${formatNumber(displayAmount)} ${ingredient.display_unit} (${formatNumber(amount)}${ingredient.unit})`
  }

  return `${formatNumber(amount)} ${ingredient.unit}`
}
