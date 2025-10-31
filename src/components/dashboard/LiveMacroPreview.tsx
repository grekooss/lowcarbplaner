/**
 * LiveMacroPreview - Real-time macro preview with comparison
 *
 * Displays adjusted nutritional values compared to original recipe values
 */

'use client'

import { Flame, Wheat, Beef, Droplet } from 'lucide-react'

interface LiveMacroPreviewProps {
  original: {
    calories: number | null
    protein_g: number | null
    carbs_g: number | null
    fats_g: number | null
  }
  adjusted: {
    calories: number
    protein_g: number
    carbs_g: number
    fats_g: number
  }
}

export function LiveMacroPreview({
  original,
  adjusted,
}: LiveMacroPreviewProps) {
  const formatDiff = (current: number, orig: number | null): string => {
    if (orig === null) return ''
    const diff = current - orig
    if (Math.abs(diff) < 1) return ''
    return diff > 0 ? `+${diff}` : `${diff}`
  }

  const macros = [
    {
      label: 'Kalorie',
      icon: Flame,
      value: adjusted.calories,
      original: original.calories,
      unit: 'kcal',
      color: 'text-[#f5ac4b]',
    },
    {
      label: 'Węglowodany',
      icon: Wheat,
      value: adjusted.carbs_g,
      original: original.carbs_g,
      unit: 'g',
      color: 'text-[#8fbc8f]',
    },
    {
      label: 'Białko',
      icon: Beef,
      value: adjusted.protein_g,
      original: original.protein_g,
      unit: 'g',
      color: 'text-[#e07a5f]',
    },
    {
      label: 'Tłuszcze',
      icon: Droplet,
      value: adjusted.fats_g,
      original: original.fats_g,
      unit: 'g',
      color: 'text-[#81b29a]',
    },
  ]

  return (
    <div
      data-testid='live-preview'
      className='rounded-xl border bg-gray-50 p-4'
    >
      <h4 className='mb-3 text-sm font-semibold'>Wartości odżywcze</h4>
      <div className='grid grid-cols-2 gap-3'>
        {macros.map((macro) => {
          const Icon = macro.icon
          const diff = formatDiff(macro.value, macro.original)

          return (
            <div
              key={macro.label}
              className='flex items-center gap-2 rounded-lg bg-white p-3'
            >
              <Icon className={`h-5 w-5 ${macro.color}`} />
              <div className='flex-1'>
                <p className='text-muted-foreground text-xs'>{macro.label}</p>
                <p className='text-sm font-semibold'>
                  {macro.value} {macro.unit}
                  {diff && (
                    <span className='ml-1 text-xs font-normal text-amber-600'>
                      ({diff})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
