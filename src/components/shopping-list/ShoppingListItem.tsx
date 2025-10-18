'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Enums } from '@/types/database.types'

interface ShoppingListItemProps {
  item: {
    name: string
    total_amount: number
    unit: string
    isPurchased: boolean
  }
  category: Enums<'ingredient_category_enum'>
  isPurchased: boolean
  onToggle: () => void
}

/**
 * ShoppingListItem - Pojedynczy produkt na liście zakupów
 *
 * Wyświetla checkbox, nazwę składnika, ilość i jednostkę.
 * Produkt zaznaczony (zakupiony) jest wizualnie przekreślony.
 *
 * @param item - Dane produktu z flagą isPurchased
 * @param category - Kategoria składnika
 * @param isPurchased - Stan zaznaczenia (czy zakupiony)
 * @param onToggle - Callback wywoływany przy toggle checkbox
 */
export const ShoppingListItem = ({
  item,
  category,
  isPurchased,
  onToggle,
}: ShoppingListItemProps) => {
  const itemId = `${category}__${item.name}`

  return (
    <li className='flex items-start gap-3 py-2'>
      <Checkbox
        id={itemId}
        checked={isPurchased}
        onCheckedChange={onToggle}
        className='mt-1'
      />
      <label
        htmlFor={itemId}
        className={cn(
          'flex-1 cursor-pointer select-none',
          'transition-all duration-200'
        )}
      >
        <div className='flex items-baseline justify-between gap-2'>
          <span
            className={cn(
              'font-medium',
              isPurchased && 'line-through opacity-60'
            )}
          >
            {item.name}
          </span>
          <span
            className={cn(
              'text-muted-foreground text-sm whitespace-nowrap',
              isPurchased && 'opacity-60'
            )}
          >
            {item.total_amount.toFixed(2)} {item.unit}
          </span>
        </div>
      </label>
    </li>
  )
}
