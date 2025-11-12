'use client'

import { useState, useEffect } from 'react'
import { ShoppingListAccordion } from './ShoppingListAccordion'
import { EmptyState } from './EmptyState'
import { cleanupPurchasedState } from '@/types/shopping-list-view.types'
import type { ShoppingListResponseDTO } from '@/types/dto.types'
import type { PurchasedItemsState } from '@/types/shopping-list-view.types'

interface ShoppingListClientProps {
  initialShoppingList: ShoppingListResponseDTO
}

const STORAGE_KEY = 'shopping-list-purchased'

/**
 * ShoppingListClient - Główny wrapper po stronie klienta
 *
 * Zarządza stanem zaznaczonych produktów (purchased state) z persistence
 * w localStorage. Integruje się z wszystkimi komponentami dzieci.
 *
 * @param initialShoppingList - Początkowe dane z Server Component
 */
export const ShoppingListClient = ({
  initialShoppingList,
}: ShoppingListClientProps) => {
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItemsState>({})

  // Load purchased state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Cleanup: usuń produkty, które nie są już na aktualnej liście
        const cleaned = cleanupPurchasedState(parsed, initialShoppingList)
        setPurchasedItems(cleaned)
      }
    } catch (error) {
      console.error('Failed to load purchased items from localStorage:', error)
      // Fallback: pusta mapa (wszystko odznaczone)
      setPurchasedItems({})
    }
  }, [initialShoppingList])

  // Save purchased state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(purchasedItems))
    } catch (error) {
      console.error('Failed to save purchased items to localStorage:', error)
      // Optional: Show toast notification w przyszłości
    }
  }, [purchasedItems])

  const handleTogglePurchased = (category: string, itemName: string) => {
    const key = `${category}__${itemName}`
    setPurchasedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (initialShoppingList.length === 0) {
    return <EmptyState />
  }

  return (
    <ShoppingListAccordion
      shoppingList={initialShoppingList}
      purchasedItems={purchasedItems}
      onTogglePurchased={handleTogglePurchased}
    />
  )
}
