/**
 * MacroCard component
 *
 * Displays a single macro nutrient with icon, value and unit
 * Colorful cards matching recipe detail style
 */

import { Card } from '@/components/ui/card'
import { Flame, Beef, Wheat, Droplet } from 'lucide-react'

interface MacroCardProps {
  label: string
  value: number
  unit: string
  variant: 'calories' | 'carbs' | 'protein' | 'fat'
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

export const MacroCard = ({ label, value, unit, variant }: MacroCardProps) => {
  const styles = variantStyles[variant]
  const Icon = styles.Icon
  const noIconBg = 'noIconBg' in styles && styles.noIconBg
  const iconBg = 'iconBg' in styles ? styles.iconBg : ''

  return (
    <Card
      className={`${styles.bg} ${styles.border} flex flex-1 items-center justify-center gap-2.5 border-2 p-4 shadow-none`}
    >
      {noIconBg ? (
        <div className='flex flex-col items-center text-center'>
          <div className={`flex items-center justify-center ${styles.icon}`}>
            <Icon className='h-8 w-8' />
          </div>
          <p
            className={`text-xs font-bold uppercase ${styles.labelColor} mt-1`}
          >
            {label}
          </p>
          <p className='flex items-baseline gap-1'>
            <span className={`text-xl font-bold ${styles.textColor}`}>
              {Math.round(value)}
            </span>
            <span className={`text-xs font-bold ${styles.labelColor}`}>
              {unit}
            </span>
          </p>
        </div>
      ) : (
        <div className='flex flex-col items-center text-center'>
          <div className={`rounded ${iconBg} p-1.5 shadow-none ${styles.icon}`}>
            <Icon className='h-4 w-4' />
          </div>
          <p
            className={`text-xs font-bold uppercase ${styles.labelColor} mt-1`}
          >
            {label}
          </p>
          <p className='flex items-baseline gap-1'>
            <span className={`text-xl font-bold ${styles.textColor}`}>
              {Math.round(value)}
            </span>
            <span className={`text-xs font-bold ${styles.labelColor}`}>
              {unit}
            </span>
          </p>
        </div>
      )}
    </Card>
  )
}
