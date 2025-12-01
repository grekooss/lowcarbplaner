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
      className='no-scrollbar flex gap-3 overflow-x-auto'
      role='group'
      aria-label='Filtruj przepisy według typu posiłku'
    >
      {MEAL_TYPES.map((type) => (
        <button
          key={type}
          type='button'
          onClick={() => handleSelect(type)}
          className={`rounded-sm border-2 px-4 py-2 text-sm font-bold tracking-wider uppercase transition-all ${
            isSelected(type)
              ? 'border-red-600 bg-red-600 text-white shadow-sm shadow-red-500/20'
              : 'border-transparent bg-white text-gray-800 hover:border-red-600 hover:bg-white hover:text-red-600'
          }`}
        >
          {type === 'all' ? 'Wszystkie' : MEAL_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  )
}
