/**
 * MacroCard component
 *
 * Displays a single macro nutrient with icon, value and unit
 * Colorful cards matching recipe detail style
 */

import { Card } from '@/components/ui/card'
import { Flame, Beef, Wheat, Droplet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MacroCardProps {
  label: string
  value: number
  unit: string
  variant: 'calories' | 'carbs' | 'protein' | 'fat'
  size?: 'default' | 'compact'
  percentage?: number
}

const variantStyles = {
  calories: {
    bg: 'bg-[color:var(--primary)]',
    border: 'border-[color:var(--primary)]',
    icon: 'text-white',
    textColor: 'text-white',
    labelColor: 'text-white/80',
    noIconBg: true,
    Icon: Flame,
  },
  carbs: {
    bg: 'bg-white',
    border: 'border-white',
    iconBg: 'bg-[color:var(--tertiary)]',
    icon: 'text-white',
    textColor: 'text-slate-900',
    labelColor: 'text-slate-600',
    Icon: Wheat,
  },
  protein: {
    bg: 'bg-white',
    border: 'border-white',
    iconBg: 'bg-blue-400',
    icon: 'text-white',
    textColor: 'text-slate-900',
    labelColor: 'text-slate-600',
    Icon: Beef,
  },
  fat: {
    bg: 'bg-white',
    border: 'border-white',
    iconBg: 'bg-green-400',
    icon: 'text-white',
    textColor: 'text-slate-900',
    labelColor: 'text-slate-600',
    Icon: Droplet,
  },
}

export const MacroCard = ({
  label,
  value,
  unit,
  variant,
  size = 'default',
  percentage,
}: MacroCardProps) => {
  const styles = variantStyles[variant]
  const Icon = styles.Icon
  const noIconBg = 'noIconBg' in styles && styles.noIconBg
  const iconBg = 'iconBg' in styles ? styles.iconBg : ''

  const isCompact = size === 'compact'

  return (
    <Card
      className={cn(
        styles.bg,
        styles.border,
        'flex items-center justify-center gap-2.5 border-2 shadow-none',
        isCompact ? 'p-2' : 'flex-1 p-4'
      )}
    >
      {noIconBg ? (
        <div className='flex flex-col items-center text-center'>
          <div className={`flex items-center justify-center ${styles.icon}`}>
            <Icon className={isCompact ? 'h-5 w-5' : 'h-8 w-8'} />
          </div>
          <p
            className={cn(
              'mt-1 font-bold uppercase',
              styles.labelColor,
              isCompact ? 'text-[10px]' : 'text-xs'
            )}
          >
            {label}
          </p>
          <p className='flex items-baseline gap-0.5'>
            <span
              className={cn(
                'font-bold',
                styles.textColor,
                isCompact ? 'text-base' : 'text-xl'
              )}
            >
              {Math.round(value)}
            </span>
            <span
              className={cn(
                'font-bold',
                styles.labelColor,
                isCompact ? 'text-[10px]' : 'text-xs'
              )}
            >
              {unit}
            </span>
          </p>
        </div>
      ) : (
        <div className='flex flex-col items-center text-center'>
          <div
            className={cn(
              'rounded shadow-none',
              iconBg,
              styles.icon,
              isCompact ? 'p-1' : 'p-1.5'
            )}
          >
            <Icon className={isCompact ? 'h-3 w-3' : 'h-4 w-4'} />
          </div>
          <p
            className={cn(
              'mt-1 font-bold uppercase',
              styles.labelColor,
              isCompact ? 'text-[10px]' : 'text-xs'
            )}
          >
            {label}
          </p>
          <p className='flex items-baseline gap-0.5'>
            <span
              className={cn(
                'font-bold',
                styles.textColor,
                isCompact ? 'text-base' : 'text-xl'
              )}
            >
              {Math.round(value)}
            </span>
            <span
              className={cn(
                'font-bold',
                styles.labelColor,
                isCompact ? 'text-[10px]' : 'text-xs'
              )}
            >
              {unit}
            </span>
          </p>
          {percentage !== undefined && (
            <p
              className={cn(
                'font-semibold',
                styles.labelColor,
                isCompact ? 'text-xs' : 'text-sm'
              )}
            >
              {percentage}%
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
