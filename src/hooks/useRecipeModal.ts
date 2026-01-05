/**
 * Hook managing recipe preview modal state with checked ingredients integration.
 * Extracted from DashboardClient for reusability.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useCheckedIngredientsStore } from '@/lib/zustand/stores/useCheckedIngredientsStore'
import type { PlannedMealDTO } from '@/types/dto.types'

interface RecipeModalState {
  isOpen: boolean
  meal: PlannedMealDTO | null
}

interface UseRecipeModalReturn {
  /** Current modal state */
  modalState: RecipeModalState
  /** Open modal with specific meal */
  openModal: (meal: PlannedMealDTO) => void
  /** Handle modal open/close state change */
  handleOpenChange: (open: boolean) => void
  /** Set of checked ingredient IDs for current meal */
  checkedIngredients: Set<number>
  /** Toggle ingredient checked state */
  toggleIngredientChecked: (ingredientId: number) => void
}

/**
 * Manages recipe modal state and checked ingredients for a meal.
 * Syncs modal meal data when meals list updates.
 *
 * @param meals - Current meals array to sync modal data from
 * @returns Modal state and handlers
 */
export function useRecipeModal(
  meals: PlannedMealDTO[] | undefined
): UseRecipeModalReturn {
  const [modalState, setModalState] = useState<RecipeModalState>({
    isOpen: false,
    meal: null,
  })

  // Global checked ingredients state from Zustand store
  const checkedIngredientsMap = useCheckedIngredientsStore(
    (state) => state.checkedIngredientsMap
  )
  const toggleChecked = useCheckedIngredientsStore(
    (state) => state.toggleIngredientChecked
  )

  // Get checked ingredients for current meal
  const checkedIngredients = useMemo(() => {
    const mealId = modalState.meal?.id
    if (!mealId) return new Set<number>()
    return checkedIngredientsMap.get(mealId) ?? new Set<number>()
  }, [checkedIngredientsMap, modalState.meal?.id])

  // Toggle handler with current meal ID
  const toggleIngredientChecked = useCallback(
    (ingredientId: number) => {
      const mealId = modalState.meal?.id
      if (!mealId) return
      toggleChecked(mealId, ingredientId)
    },
    [modalState.meal?.id, toggleChecked]
  )

  const openModal = useCallback((meal: PlannedMealDTO) => {
    setModalState({
      isOpen: true,
      meal,
    })
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setModalState((prev) => ({
      isOpen: open,
      meal: open ? prev.meal : null,
    }))
  }, [])

  // Update modal meal when meals data refetches (e.g., after save)
  // Używamy modalState.meal?.id jako zależności zamiast całego obiektu meal
  // aby uniknąć niespójności gdy zmieni się referencja obiektu ale nie jego id
  const currentMealId = modalState.meal?.id
  useEffect(() => {
    if (modalState.isOpen && currentMealId && meals) {
      const updatedMeal = meals.find((m) => m.id === currentMealId)
      if (updatedMeal) {
        setModalState((prev) => ({
          ...prev,
          meal: updatedMeal,
        }))
      }
    }
  }, [meals, modalState.isOpen, currentMealId])

  return {
    modalState,
    openModal,
    handleOpenChange,
    checkedIngredients,
    toggleIngredientChecked,
  }
}
