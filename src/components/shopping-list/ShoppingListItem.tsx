'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShoppingListItemProps {
  item: {
    name: string
    total_amount: number
    unit: string
    isPurchased: boolean
  }
  isPurchased: boolean
  onToggle: () => void
}

/**
 * ShoppingListItem - Pojedynczy produkt na liście zakupów
 *
 * Wyświetla checkbox, nazwę składnika, ilość i jednostkę.
 * Produkt zaznaczony (zakupiony) jest wizualnie przekreślony.
 */
export const ShoppingListItem = ({
  item,
  isPurchased,
  onToggle,
}: ShoppingListItemProps) => {
  // Format amount: remove unnecessary decimals (.00)
  const formatAmount = (amount: number): string => {
    const rounded = Math.round(amount * 100) / 100
    return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2)
  }

  return (
    <li
      className={cn(
        'group flex cursor-pointer items-center gap-4 rounded-lg px-3 py-3 transition-all duration-200',
        isPurchased ? 'bg-primary/5' : 'hover:bg-bg-tertiary/50'
      )}
      onClick={onToggle}
      role='button'
      tabIndex={0}
      aria-pressed={isPurchased}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      {/* Custom Checkbox */}
      <div
        className={cn(
          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
          isPurchased
            ? 'border-primary bg-primary'
            : 'border-border group-hover:border-primary bg-white'
        )}
      >
        {isPurchased && (
          <Check className='h-4 w-4 text-white' strokeWidth={3} />
        )}
      </div>

      {/* Item Name */}
      <span
        className={cn(
          'flex-1 text-base font-medium transition-all duration-200',
          isPurchased ? 'text-text-muted line-through' : 'text-text-main'
        )}
      >
        {item.name}
      </span>

      {/* Amount */}
      <div
        className={cn(
          'flex items-baseline gap-1 whitespace-nowrap transition-all duration-200',
          isPurchased ? 'opacity-50' : ''
        )}
      >
        <span className='text-text-main text-lg font-bold'>
          {formatAmount(item.total_amount)}
        </span>
        <span className='text-text-muted text-sm'>{item.unit}</span>
      </div>
    </li>
  )
}
