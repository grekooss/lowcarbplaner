/**
 * MacroCard component
 *
 * Displays a single macro nutrient with icon, value and unit
 */

import { Flame, Beef, Wheat, Droplet } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS = {
  flame: Flame,
  beef: Beef,
  wheat: Wheat,
  droplet: Droplet,
}

const COLOR_CLASSES = {
  orange: 'text-orange-500 bg-orange-50',
  red: 'text-red-500 bg-red-50',
  yellow: 'text-yellow-500 bg-yellow-50',
  blue: 'text-blue-500 bg-blue-50',
}

interface MacroCardProps {
  label: string
  value: number
  unit: string
  icon: 'flame' | 'beef' | 'wheat' | 'droplet'
  color: 'orange' | 'red' | 'yellow' | 'blue'
}

export const MacroCard = ({
  label,
  value,
  unit,
  icon,
  color,
}: MacroCardProps) => {
  const Icon = ICONS[icon]

  return (
    <div className='flex items-center gap-4 rounded-lg border p-4'>
      <div className={cn('rounded-full p-3', COLOR_CLASSES[color])}>
        <Icon className='h-6 w-6' />
      </div>
      <div>
        <div className='text-2xl font-bold'>{Math.round(value)}</div>
        <div className='text-muted-foreground text-sm'>
          {unit} {label}
        </div>
      </div>
    </div>
  )
}
