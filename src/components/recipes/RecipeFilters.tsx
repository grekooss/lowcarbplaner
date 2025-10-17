'use client'

import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { Enums } from '@/types/database.types'

interface RecipeFiltersProps {
  selectedMealTypes: string[]
  onChange: (mealTypes: string[]) => void
}

const MEAL_TYPES: (Enums<'meal_type_enum'> | 'all')[] = [
  'all',
  'breakfast',
  'lunch',
  'dinner',
]

export function RecipeFilters({
  selectedMealTypes,
  onChange,
}: RecipeFiltersProps) {
  const handleSelect = (type: (typeof MEAL_TYPES)[number]) => {
    if (type === 'all') {
      onChange([])
      return
    }

    if (selectedMealTypes.includes(type)) {
      onChange(selectedMealTypes.filter((t) => t !== type))
    } else {
      onChange([type])
    }
  }

  const isSelected = (type: (typeof MEAL_TYPES)[number]) => {
    if (type === 'all') {
      return selectedMealTypes.length === 0
    }
    return selectedMealTypes.includes(type)
  }

  return (
    <div
      className='flex flex-wrap gap-1 rounded-full bg-slate-100 p-1'
      role='group'
      aria-label='Filtruj przepisy według typu posiłku'
    >
      {MEAL_TYPES.map((type) => (
        <button
          key={type}
          type='button'
          onClick={() => handleSelect(type)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            isSelected(type)
              ? 'bg-lime-300 text-gray-900'
              : 'text-slate-600 hover:text-gray-900'
          }`}
        >
          {type === 'all' ? 'Wszystkie' : MEAL_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  )
}
