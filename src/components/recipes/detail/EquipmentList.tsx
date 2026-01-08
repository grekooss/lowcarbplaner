/**
 * Equipment List Component
 *
 * Wyświetla listę naczyń/sprzętu kuchennego wymaganego do przepisu.
 * W pełnym widoku używa checkboxów do zaznaczania (jak składniki).
 * W widoku kompaktowym używa kolorowych tagów z ikonami.
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Flame,
  UtensilsCrossed,
  ChefHat,
  CookingPot,
  Scissors,
  Scale,
  CircleDot,
  Check,
} from 'lucide-react'
import type { EquipmentDTO } from '@/types/dto.types'
import type { Enums } from '@/types/database.types'

interface EquipmentListProps {
  equipment: EquipmentDTO[]
  compact?: boolean
  className?: string
  /** Zewnętrzny stan zaznaczonych elementów */
  checkedEquipment?: Set<number>
  /** Callback do zmiany stanu zaznaczenia */
  onToggleChecked?: (equipmentId: number) => void
}

/**
 * Mapowanie kategorii sprzętu na ikony
 */
const CATEGORY_ICONS: Record<
  Enums<'equipment_category_enum'>,
  React.ElementType
> = {
  heating: Flame,
  mixing: ChefHat,
  cookware: CookingPot,
  bakeware: UtensilsCrossed,
  cutting: Scissors,
  measuring: Scale,
  other: CircleDot,
}

/**
 * Mapowanie kategorii sprzętu na kolory
 */
const CATEGORY_COLORS: Record<Enums<'equipment_category_enum'>, string> = {
  heating: 'bg-orange-100 text-orange-600',
  mixing: 'bg-purple-100 text-purple-600',
  cookware: 'bg-blue-100 text-blue-600',
  bakeware: 'bg-amber-100 text-amber-600',
  cutting: 'bg-red-100 text-red-600',
  measuring: 'bg-green-100 text-green-600',
  other: 'bg-gray-100 text-gray-600',
}

/**
 * Mapowanie kategorii sprzętu na polskie nazwy
 */
export const EQUIPMENT_CATEGORY_LABELS: Record<
  Enums<'equipment_category_enum'>,
  string
> = {
  heating: 'Urządzenia grzewcze',
  mixing: 'Mieszanie',
  cookware: 'Naczynia',
  bakeware: 'Formy do pieczenia',
  cutting: 'Krojenie',
  measuring: 'Pomiary',
  other: 'Inne',
}

/**
 * Komponent wyświetlający listę sprzętu kuchennego
 */
export function EquipmentList({
  equipment,
  compact = false,
  className,
  checkedEquipment,
  onToggleChecked,
}: EquipmentListProps) {
  // Lokalny stan zaznaczenia (używany gdy nie przekazano zewnętrznego)
  const [localChecked, setLocalChecked] = useState<Set<number>>(new Set())

  if (!equipment || equipment.length === 0) {
    return null
  }

  const isChecked = (id: number) => {
    if (checkedEquipment) {
      return checkedEquipment.has(id)
    }
    return localChecked.has(id)
  }

  const toggleChecked = (id: number) => {
    if (onToggleChecked) {
      onToggleChecked(id)
      return
    }
    // Lokalny stan
    setLocalChecked((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div className={cn('space-y-2', className)}>
      {compact ? (
        // Widok kompaktowy - jedna linia z tagami
        <div className='flex flex-wrap gap-1.5'>
          {equipment.map((item) => {
            const Icon = CATEGORY_ICONS[item.category]
            const colorClass = CATEGORY_COLORS[item.category]

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
                  colorClass
                )}
                title={item.notes || undefined}
              >
                <Icon className='h-3 w-3' />
                <span>
                  {item.quantity > 1 ? `${item.quantity}× ` : ''}
                  {item.name}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        // Widok pełny - lista z checkboxami (jak składniki)
        <ul className='space-y-2'>
          {equipment.map((item) => {
            const checked = isChecked(item.id)

            return (
              <li
                key={item.id}
                className='group flex cursor-pointer items-center gap-4 rounded-lg border border-white bg-white/70 px-3 py-3 shadow-sm transition-all duration-200 hover:bg-white/90'
                onClick={() => toggleChecked(item.id)}
                role='button'
                tabIndex={0}
                aria-pressed={checked}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleChecked(item.id)
                  }
                }}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 shadow-md transition-all duration-200',
                    checked
                      ? 'border-red-500 bg-red-500'
                      : 'border-white bg-white group-hover:border-red-600'
                  )}
                >
                  {checked && (
                    <Check className='h-4 w-4 text-white' strokeWidth={3} />
                  )}
                </div>

                {/* Nazwa i notatki */}
                <div className='min-w-0 flex-1'>
                  <p className='text-base font-medium text-gray-800'>
                    {item.quantity > 1 ? `${item.quantity}× ` : ''}
                    {item.name}
                  </p>
                  {item.notes && (
                    <p className='truncate text-sm text-gray-500'>
                      {item.notes}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
