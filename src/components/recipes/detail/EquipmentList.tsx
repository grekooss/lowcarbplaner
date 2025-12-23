/**
 * Equipment List Component
 *
 * Wyświetla listę naczyń/sprzętu kuchennego wymaganego do przepisu.
 * Używa ikon z lucide-react dopasowanych do kategorii sprzętu.
 */

'use client'

import { cn } from '@/lib/utils'
import {
  Flame,
  UtensilsCrossed,
  ChefHat,
  CookingPot,
  Scissors,
  Scale,
  CircleDot,
} from 'lucide-react'
import type { EquipmentDTO } from '@/types/dto.types'
import type { Enums } from '@/types/database.types'

interface EquipmentListProps {
  equipment: EquipmentDTO[]
  compact?: boolean
  className?: string
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
}: EquipmentListProps) {
  if (!equipment || equipment.length === 0) {
    return null
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
        // Widok pełny - lista z detalami
        <ul className='divide-y divide-gray-100'>
          {equipment.map((item) => {
            const Icon = CATEGORY_ICONS[item.category]
            const colorClass = CATEGORY_COLORS[item.category]

            return (
              <li
                key={item.id}
                className='flex items-center gap-3 py-2.5 first:pt-0 last:pb-0'
              >
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                    colorClass
                  )}
                >
                  <Icon className='h-4 w-4' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium text-gray-800'>
                    {item.quantity > 1 ? `${item.quantity}× ` : ''}
                    {item.name}
                  </p>
                  {item.notes && (
                    <p className='truncate text-xs text-gray-500'>
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
