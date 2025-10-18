/**
 * Shopping List View Types and Helper Functions
 *
 * Ten plik zawiera typy i funkcje pomocnicze dla widoku Lista Zakupów.
 */

import type { ShoppingListResponseDTO } from './dto.types'

/**
 * Stan zaznaczonych produktów (purchased state)
 * Key: unikalne ID produktu (category + name)
 * Value: boolean (czy zakupiony)
 */
export type PurchasedItemsState = Record<string, boolean>

/**
 * Item rozszerzony o stan purchased (używany po sortowaniu)
 */
export interface ShoppingListItemViewModel {
  name: string
  total_amount: number
  unit: string
  isPurchased: boolean
}

/**
 * Helper function: generuje unikalny klucz dla produktu
 * @param category - Kategoria składnika (np. "meat", "dairy")
 * @param name - Nazwa składnika
 * @returns Unikalny klucz w formacie "category__name"
 */
export function getItemKey(category: string, name: string): string {
  return `${category}__${name}`
}

/**
 * Helper function: sortuje produkty według stanu purchased
 * Odznaczone (false) na górze, zaznaczone (true) na dole
 * @param items - Lista produktów do posortowania
 * @param purchasedState - Stan zaznaczonych produktów
 * @param category - Kategoria produktów
 * @returns Posortowana lista produktów z flagą isPurchased
 */
export function sortItemsByPurchasedState(
  items: { name: string; total_amount: number; unit: string }[],
  purchasedState: PurchasedItemsState,
  category: string
): ShoppingListItemViewModel[] {
  return items
    .map((item) => ({
      ...item,
      isPurchased: purchasedState[getItemKey(category, item.name)] || false,
    }))
    .sort((a, b) => {
      // Odznaczone (false) przed zaznaczonymi (true)
      if (a.isPurchased === b.isPurchased) {
        // Secondary sort: alfabetycznie po nazwie
        return a.name.localeCompare(b.name, 'pl')
      }
      return a.isPurchased ? 1 : -1
    })
}

/**
 * Helper function: czyści stary stan purchased (produkty, które nie są już na liście)
 * Zwraca oczyszczony state
 * @param currentState - Aktualny stan zaznaczonych produktów
 * @param currentList - Aktualna lista zakupów z API
 * @returns Oczyszczony stan (tylko produkty z aktualnej listy)
 */
export function cleanupPurchasedState(
  currentState: PurchasedItemsState,
  currentList: ShoppingListResponseDTO
): PurchasedItemsState {
  const validKeys = new Set<string>()

  // Zbierz wszystkie aktualne klucze
  currentList.forEach((categoryData) => {
    categoryData.items.forEach((item) => {
      validKeys.add(getItemKey(categoryData.category, item.name))
    })
  })

  // Filtruj tylko aktualne klucze
  const cleanedState: PurchasedItemsState = {}
  Object.entries(currentState).forEach(([key, value]) => {
    if (validKeys.has(key)) {
      cleanedState[key] = value
    }
  })

  return cleanedState
}
