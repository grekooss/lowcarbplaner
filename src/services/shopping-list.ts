/**
 * Service Layer dla Shopping List API
 *
 * Implementuje logikę biznesową dla generowania listy zakupów:
 * - Pobieranie zaplanowanych posiłków w zakresie dat
 * - Agregacja składników z wielu posiłków
 * - Sumowanie ilości tego samego składnika
 * - Grupowanie według kategorii
 *
 * @see .ai/10c01 api-shopping-list-implementation-plan.md
 */

import { createServerClient } from '@/lib/supabase/server'
import type { ShoppingListResponseDTO } from '@/types/dto.types'
import type { Enums } from '@/types/database.types'

/**
 * Typ pomocniczy dla agregacji składników
 */
type IngredientAggregate = {
  id: number
  name: string
  category: string
  amount: number
  unit: string
}

/**
 * Generuje zagregowaną listę zakupów dla użytkownika w podanym zakresie dat
 *
 * Lista bazuje na oryginalnych przepisach (bez ingredient_overrides).
 * Składniki są agregowane według ingredient_id + unit, następnie grupowane
 * według kategorii i sortowane alfabetycznie.
 *
 * @param userId - ID użytkownika (z Supabase Auth)
 * @param startDate - Data początkowa (YYYY-MM-DD)
 * @param endDate - Data końcowa (YYYY-MM-DD)
 * @returns Lista kategorii ze składnikami i zsumowanymi ilościami
 *
 * @example
 * ```typescript
 * const list = await generateShoppingList('user-123', '2025-01-15', '2025-01-21')
 * // [
 * //   {
 * //     category: 'meat',
 * //     items: [{ name: 'Pierś z kurczaka', total_amount: 350, unit: 'g' }]
 * //   }
 * // ]
 * ```
 */
export async function generateShoppingList(
  userId: string,
  startDate: string,
  endDate: string
): Promise<ShoppingListResponseDTO> {
  const supabase = await createServerClient()

  // 1. Pobierz wszystkie zaplanowane posiłki z przepisami i składnikami
  const { data: meals, error } = await supabase
    .from('planned_meals')
    .select(
      `
      recipe_id,
      recipes!inner (
        id,
        recipe_ingredients!inner (
          ingredient_id,
          base_amount,
          unit,
          ingredients!inner (
            id,
            name,
            category,
            unit
          )
        )
      )
    `
    )
    .eq('user_id', userId)
    .gte('meal_date', startDate)
    .lte('meal_date', endDate)
    .not('recipe_id', 'is', null)

  if (error) {
    console.error('Error fetching planned meals for shopping list:', error)
    throw new Error('Failed to fetch planned meals')
  }

  // 2. Jeśli brak posiłków, zwróć pustą tablicę
  if (!meals || meals.length === 0) {
    return []
  }

  // 3. Flatten wszystkich składników z wszystkich posiłków
  const allIngredients: IngredientAggregate[] = meals.flatMap((meal) => {
    // Sprawdzenie czy recipes istnieje i ma recipe_ingredients
    if (!meal.recipes || !meal.recipes.recipe_ingredients) {
      return []
    }

    return meal.recipes.recipe_ingredients.map((ri) => ({
      id: ri.ingredients.id,
      name: ri.ingredients.name,
      category: ri.ingredients.category,
      amount: ri.base_amount,
      unit: ri.unit,
    }))
  })

  // 4. Agregacja według ingredient_id + unit (Map dla wydajności)
  const aggregatedMap = new Map<string, IngredientAggregate>()

  allIngredients.forEach((ingredient) => {
    const key = `${ingredient.id}_${ingredient.unit}`

    if (aggregatedMap.has(key)) {
      const existing = aggregatedMap.get(key)!
      existing.amount += ingredient.amount
    } else {
      aggregatedMap.set(key, { ...ingredient })
    }
  })

  // 5. Grupowanie według kategorii
  const categoryMap = new Map<
    string,
    Array<{
      name: string
      total_amount: number
      unit: string
    }>
  >()

  Array.from(aggregatedMap.values()).forEach((ingredient) => {
    if (!categoryMap.has(ingredient.category)) {
      categoryMap.set(ingredient.category, [])
    }

    categoryMap.get(ingredient.category)!.push({
      name: ingredient.name,
      total_amount: Math.round(ingredient.amount * 100) / 100, // Zaokrąglenie do 2 miejsc
      unit: ingredient.unit,
    })
  })

  // 6. Sortowanie i formatowanie do DTO
  const result: ShoppingListResponseDTO = Array.from(categoryMap.entries())
    .sort(([catA], [catB]) => catA.localeCompare(catB, 'pl')) // Sortowanie kategorii alfabetycznie
    .map(([category, items]) => ({
      category: category as Enums<'ingredient_category_enum'>, // TypeScript cast do enum
      items: items.sort((a, b) => a.name.localeCompare(b.name, 'pl')), // Sortowanie składników alfabetycznie
    }))

  return result
}
