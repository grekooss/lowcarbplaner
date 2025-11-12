'use client'

import { useMemo } from 'react'
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
 *
 * @param category - Kategoria składników
 * @param items - Lista produktów w kategorii
 * @param purchasedItems - Stan zaznaczonych produktów
 * @param onTogglePurchased - Callback wywoływany przy toggle checkbox
 */
export const CategorySection = ({
  category,
  items,
  purchasedItems,
  onTogglePurchased,
}: CategorySectionProps) => {
  const sortedItems = useMemo(() => {
    return sortItemsByPurchasedState(items, purchasedItems, category)
  }, [items, purchasedItems, category])

  return (
    <ul className='space-y-1 pt-2'>
      {sortedItems.map((item) => (
        <ShoppingListItem
          key={getItemKey(category, item.name)}
          item={item}
          category={category}
          isPurchased={item.isPurchased}
          onToggle={() => onTogglePurchased(category, item.name)}
        />
      ))}
    </ul>
  )
}
