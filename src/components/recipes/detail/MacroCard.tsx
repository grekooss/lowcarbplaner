/**
 * Komponent karty makroskładnika
 *
 * Wyświetla pojedynczy makroskładnik w kolorowej karcie z ikoną.
 */

'use client'

import { Card } from '@/components/ui/card'
import { Flame, Wheat, Beef, Droplet } from 'lucide-react'

interface MacroCardProps {
  label: string
  value: number | null
  unit: string
  variant: 'calories' | 'carbs' | 'protein' | 'fat'
}

const variantStyles = {
  calories: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    text: 'text-green-900',
    Icon: Flame,
  },
  carbs: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    text: 'text-yellow-900',
    Icon: Wheat,
  },
  protein: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    text: 'text-orange-900',
    Icon: Beef,
  },
  fat: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'text-gray-600',
    text: 'text-gray-900',
    Icon: Droplet,
  },
}

/**
 * Komponent pojedynczej karty makroskładnika
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
export function MacroCard({ label, value, unit, variant }: MacroCardProps) {
  const styles = variantStyles[variant]
  const Icon = styles.Icon

  return (
    <Card
      className={`${styles.bg} ${styles.border} border-2 p-4 transition-all hover:shadow-md`}
    >
      <div className='flex items-center gap-3'>
        <div className={`rounded-full bg-white p-2 ${styles.icon}`}>
          <Icon className='h-6 w-6' />
        </div>
        <div>
          <p className={`text-sm font-medium ${styles.text}`}>{label}</p>
          <p className={`text-2xl font-bold ${styles.text}`}>
            {value !== null && value !== undefined
              ? `${Math.round(value)} ${unit}`
              : '—'}
          </p>
        </div>
      </div>
    </Card>
  )
}
