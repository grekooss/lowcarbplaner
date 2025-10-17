/**
 * Komponent karty makrosk�'adnika
 *
 * Wy�>wietla pojedynczy makrosk�'adnik w kolorowej karcie z ikon�.
 */

'use client'

import { Card } from '@/components/ui/card'
import { Flame, Wheat, Beef, Droplet } from 'lucide-react'

interface MacroCardProps {
  label: string
  value: number | null
  unit: string
  variant: 'calories' | 'carbs' | 'protein' | 'fat'
  size?: 'default' | 'compact'
}

const variantStyles = {
  calories: {
    bg: 'bg-[color:var(--quaternary)]',
    border: 'border-[color:var(--quaternary)]',
    icon: 'text-black',
    Icon: Flame,
  },
  carbs: {
    bg: 'bg-[color:var(--tertiary)]',
    border: 'border-[color:var(--tertiary)]',
    icon: 'text-black',
    Icon: Wheat,
  },
  protein: {
    bg: 'bg-[color:var(--secondary)]',
    border: 'border-[color:var(--secondary)]',
    icon: 'text-black',
    Icon: Beef,
  },
  fat: {
    bg: 'bg-[color:var(--primary)]',
    border: 'border-[color:var(--primary)]',
    icon: 'text-black',
    Icon: Droplet,
  },
}

/**
 * Komponent pojedynczej karty makrosk�'adnika
 *
 * @example
 * ```tsx
 * <MacroCard
 *   label="Calories"
 *   value={450}
 *   unit="kcal"
 *   variant="calories"
 * />
 * ```
 */
export function MacroCard({
  label,
  value,
  unit,
  variant,
  size = 'default',
}: MacroCardProps) {
  const styles = variantStyles[variant]
  const Icon = styles.Icon

  const isCompact = size === 'compact'

  return (
    <Card
      className={`${styles.bg} ${styles.border} flex items-center ${isCompact ? 'gap-2 p-2' : 'gap-2.5 p-2.5'} border-2 ${isCompact ? 'min-w-[112px] flex-none' : 'flex-1'} shadow-none transition-all hover:shadow-none`}
    >
      <div
        className={`rounded-md bg-white shadow-none ${isCompact ? 'p-2' : 'p-2.5'} ${styles.icon}`}
      >
        <Icon className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
      </div>
      <div className='flex flex-col'>
        <p
          className={`${isCompact ? 'text-[0.65rem]' : 'text-xs'} font-medium text-slate-600`}
        >
          {label}
        </p>
        <p className='flex items-baseline gap-1'>
          <span
            className={`${isCompact ? 'text-lg' : 'text-xl'} font-bold text-slate-900`}
          >
            {value !== null && value !== undefined ? Math.round(value) : '�?"'}
          </span>
          <span
            className={`${isCompact ? 'text-[0.65rem]' : 'text-xs'} text-slate-600`}
          >
            {unit}
          </span>
        </p>
      </div>
    </Card>
  )
}
