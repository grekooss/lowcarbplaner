'use client'

import { memo, useMemo } from 'react'
import { ShoppingListItem } from './ShoppingListItem'
import {
  sortItemsByPurchasedState,
  getItemKey,
} from '@/types/shopping-list-view.types'
import type { Enums } from '@/types/database.types'
import type { PurchasedItemsState } from '@/types/shopping-list-view.types'

interface CategorySectionProps {
  category: Enums<'ingredient_category_enum'>
  items: { name: string; total_amount: number; unit: string }[]
  purchasedItems: PurchasedItemsState
  onTogglePurchased: (category: string, itemName: string) => void
}

/**
 * CategorySection - Sekcja dla jednej kategorii produktów
 *
 * Sortuje produkty (odznaczone na górze, zaznaczone na dole)
 * i renderuje listę ShoppingListItem.
 */
export const CategorySection = memo(function CategorySection({
  category,
  items,
  purchasedItems,
  onTogglePurchased,
}: CategorySectionProps) {
  const sortedItems = useMemo(() => {
    return sortItemsByPurchasedState(items, purchasedItems, category)
  }, [items, purchasedItems, category])

  return (
    <ul className='divide-y divide-gray-100'>
      {sortedItems.map((item) => (
        <ShoppingListItem
          key={getItemKey(category, item.name)}
          item={item}
          isPurchased={item.isPurchased}
          onToggle={() => onTogglePurchased(category, item.name)}
        />
      ))}
    </ul>
  )
})
