'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (type: (typeof MEAL_TYPES)[number]) => {
    if (type === 'all') {
      onChange([])
    } else if (selectedMealTypes.includes(type)) {
      onChange(selectedMealTypes.filter((t) => t !== type))
    } else {
      onChange([type])
    }
    setIsOpen(false)
  }

  const isSelected = (type: (typeof MEAL_TYPES)[number]) => {
    if (type === 'all') {
      return selectedMealTypes.length === 0
    }
    return selectedMealTypes.includes(type)
  }

  const getSelectedLabel = () => {
    if (selectedMealTypes.length === 0) return 'Wszystkie'
    if (selectedMealTypes.length === 1 && selectedMealTypes[0]) {
      return MEAL_TYPE_LABELS[selectedMealTypes[0] as Enums<'meal_type_enum'>]
    }
    return `${selectedMealTypes.length} wybrane`
  }

  return (
    <>
      {/* Desktop: Button row (xl+ where sidebar is visible) */}
      <div
        className='no-scrollbar hidden gap-1.5 overflow-x-auto xl:flex'
        role='group'
        aria-label='Filtruj przepisy według typu posiłku'
      >
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            type='button'
            onClick={() => handleSelect(type)}
            className={`h-[34px] rounded-sm border px-3 text-xs font-bold tracking-wide uppercase transition-all ${
              isSelected(type)
                ? 'border-red-600 bg-red-600 text-white shadow-sm shadow-red-500/20'
                : 'border-transparent bg-white text-gray-800 hover:border-red-600 hover:bg-white hover:text-red-600'
            }`}
          >
            {type === 'all' ? 'Wszystkie' : MEAL_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Mobile/Tablet: Dropdown list (below xl where hamburger is visible) */}
      <div className='relative xl:hidden'>
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className='flex h-[34px] w-full items-center justify-between gap-1.5 rounded-sm border border-white bg-white px-3 text-xs font-bold text-gray-800 shadow-sm transition-all hover:border-red-600'
          aria-expanded={isOpen}
          aria-haspopup='listbox'
        >
          <span className='tracking-wide uppercase'>{getSelectedLabel()}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className='fixed inset-0 z-10'
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div
              className='absolute top-full left-0 z-20 mt-1 w-full min-w-[140px] overflow-hidden rounded-sm border border-white bg-white shadow-lg'
              role='listbox'
            >
              {MEAL_TYPES.map((type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => handleSelect(type)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-bold tracking-wide uppercase transition-colors ${
                    isSelected(type)
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  role='option'
                  aria-selected={isSelected(type)}
                >
                  <span>
                    {type === 'all' ? 'Wszystkie' : MEAL_TYPE_LABELS[type]}
                  </span>
                  {isSelected(type) && (
                    <Check className='h-3.5 w-3.5 text-red-600' />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
