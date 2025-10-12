/**
 * Hook do zarządzania filtrami i paginacją w widoku przeglądarki przepisów
 *
 * Zarządza stanem filtrów (meal_types, limit, offset) i dostarcza metody
 * do ich aktualizacji. Używany w RecipesBrowserClient.
 */

'use client'

import { useState, useCallback } from 'react'
import type { RecipeFiltersState } from '@/types/recipes-view.types'

interface UseRecipesFilterOptions {
  initialFilters?: Partial<RecipeFiltersState>
}

interface UseRecipesFilterReturn {
  filters: RecipeFiltersState
  updateMealTypes: (mealTypes: string[]) => void
  resetFilters: () => void
  loadMore: () => void
}

const DEFAULT_FILTERS: RecipeFiltersState = {
  meal_types: [],
  limit: 20,
  offset: 0,
}

/**
 * Custom hook do zarządzania filtrami przepisów
 *
 * @param options - Opcje inicjalizacyjne z initial filters
 * @returns Obiekt z aktualnym stanem filtrów i metodami do ich zarządzania
 *
 * @example
 * ```tsx
 * const { filters, updateMealTypes, resetFilters, loadMore } = useRecipesFilter({
 *   initialFilters: { meal_types: ['breakfast'] }
 * })
 *
 * // Aktualizacja meal_types
 * updateMealTypes(['breakfast', 'lunch'])
 *
 * // Reset filtrów
 * resetFilters()
 *
 * // Załaduj więcej (infinite scroll)
 * loadMore()
 * ```
 */
export function useRecipesFilter(
  options?: UseRecipesFilterOptions
): UseRecipesFilterReturn {
  const [filters, setFilters] = useState<RecipeFiltersState>({
    ...DEFAULT_FILTERS,
    ...options?.initialFilters,
  })

  /**
   * Aktualizuje meal_types i resetuje offset do 0
   * (nowe filtry = nowe zapytanie od początku)
   */
  const updateMealTypes = useCallback((mealTypes: string[]) => {
    setFilters((prev) => ({
      ...prev,
      meal_types: mealTypes,
      offset: 0, // Reset offset przy zmianie filtrów
    }))
  }, [])

  /**
   * Resetuje wszystkie filtry do wartości domyślnych
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  /**
   * Zwiększa offset o limit (dla infinite scroll / load more)
   */
  const loadMore = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }))
  }, [])

  return {
    filters,
    updateMealTypes,
    resetFilters,
    loadMore,
  }
}
