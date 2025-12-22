/**
 * Zustand Store: useCheckedIngredientsStore
 *
 * Zarządza stanem zaznaczonych składników (checkboxów) w przepisach.
 * Stan jest współdzielony między Dashboard a Meal Plan.
 *
 * Struktura: Map<mealId, Set<ingredientId>>
 * - Każdy posiłek ma własny zestaw zaznaczonych składników
 * - Stan persystuje po zamknięciu modala i przy przełączaniu między przepisami
 */

import { create } from 'zustand'

interface CheckedIngredientsState {
  // Map<mealId, Set<ingredientId>>
  checkedIngredientsMap: Map<number, Set<number>>

  // Akcje
  getCheckedIngredients: (mealId: number) => Set<number>
  toggleIngredientChecked: (mealId: number, ingredientId: number) => void
  clearMealChecked: (mealId: number) => void
  clearAllChecked: () => void
}

/**
 * Store dla zaznaczonych składników
 *
 * @example
 * ```tsx
 * const { getCheckedIngredients, toggleIngredientChecked } = useCheckedIngredientsStore()
 *
 * const checkedIngredients = getCheckedIngredients(mealId)
 * const handleToggle = (ingredientId: number) => toggleIngredientChecked(mealId, ingredientId)
 * ```
 */
export const useCheckedIngredientsStore = create<CheckedIngredientsState>()(
  (set, get) => ({
    checkedIngredientsMap: new Map(),

    getCheckedIngredients: (mealId: number) => {
      return get().checkedIngredientsMap.get(mealId) ?? new Set<number>()
    },

    toggleIngredientChecked: (mealId: number, ingredientId: number) => {
      set((state) => {
        const newMap = new Map(
          Array.from(state.checkedIngredientsMap.entries())
        )
        const existingSet = newMap.get(mealId)
        const newSet = existingSet ? new Set(existingSet) : new Set<number>()

        if (newSet.has(ingredientId)) {
          newSet.delete(ingredientId)
        } else {
          newSet.add(ingredientId)
        }

        newMap.set(mealId, newSet)
        return { checkedIngredientsMap: newMap }
      })
    },

    clearMealChecked: (mealId: number) => {
      set((state) => {
        const newMap = new Map(
          Array.from(state.checkedIngredientsMap.entries())
        )
        newMap.delete(mealId)
        return { checkedIngredientsMap: newMap }
      })
    },

    clearAllChecked: () => {
      set({ checkedIngredientsMap: new Map() })
    },
  })
)
