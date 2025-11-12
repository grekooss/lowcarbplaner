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

  // Format amount: remove unnecessary decimals (.00)
  const formatAmount = (amount: number): string => {
    const rounded = Math.round(amount * 100) / 100
    return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2)
  }

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
              'text-foreground whitespace-nowrap',
              isPurchased && 'opacity-60'
            )}
          >
            <span className='text-lg font-semibold'>
              {formatAmount(item.total_amount)}
            </span>{' '}
            <span className='text-sm'>{item.unit}</span>
          </span>
        </div>
      </label>
    </li>
  )
}
