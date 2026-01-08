'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { Enums } from '@/types/database.types'

interface RecipeFiltersProps {
  selectedMealTypes: string[]
  onChange: (mealTypes: string[]) => void
}

const MEAL_TYPES: (Enums<'meal_type_enum'> | 'all' | 'snack')[] = [
  'all',
  'breakfast',
  'lunch',
  'dinner',
  'snack',
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
    // 'snack' jest zaznaczony gdy filtry zawierają snack_morning lub snack_afternoon
    if (type === 'snack') {
      return (
        selectedMealTypes.includes('snack_morning') ||
        selectedMealTypes.includes('snack_afternoon')
      )
    }
    return selectedMealTypes.includes(type)
  }

  const getSelectedLabel = () => {
    if (selectedMealTypes.length === 0) return 'Wszystkie'
    // Sprawdź czy to filtr "snack" (snack_morning + snack_afternoon)
    const isSnackFilter =
      selectedMealTypes.length === 2 &&
      selectedMealTypes.includes('snack_morning') &&
      selectedMealTypes.includes('snack_afternoon')
    if (isSnackFilter) return 'Przekąska'

    if (selectedMealTypes.length === 1 && selectedMealTypes[0]) {
      const type = selectedMealTypes[0]
      if (type === 'snack') return 'Przekąska'
      return MEAL_TYPE_LABELS[type as Enums<'meal_type_enum'>]
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
                ? 'border-primary bg-primary shadow-primary/20 text-white shadow-sm'
                : 'text-text-main hover:border-primary hover:text-primary border-transparent bg-white hover:bg-white'
            }`}
          >
            {type === 'all'
              ? 'Wszystkie'
              : type === 'snack'
                ? 'Przekąska'
                : MEAL_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Mobile/Tablet: Dropdown list (below xl where hamburger is visible) */}
      <div className='relative xl:hidden'>
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className='text-text-main hover:border-primary flex h-[34px] w-full items-center justify-between gap-1.5 rounded-sm border border-white bg-white px-3 text-xs font-bold shadow-sm transition-all'
          aria-expanded={isOpen}
          aria-haspopup='listbox'
        >
          <span className='tracking-wide uppercase'>{getSelectedLabel()}</span>
          <ChevronDown
            className={`text-text-muted h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
              className='absolute top-full left-0 z-20 mt-1 w-full min-w-[140px] rounded-sm border border-white bg-white p-1 shadow-[0_4px_20px_rgb(0,0,0,0.08)]'
              role='listbox'
            >
              {MEAL_TYPES.map((type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => handleSelect(type)}
                  className={`flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-left text-xs font-bold tracking-wide uppercase transition-colors ${
                    isSelected(type)
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-primary/10 hover:text-primary'
                  }`}
                  role='option'
                  aria-selected={isSelected(type)}
                >
                  <span>
                    {type === 'all'
                      ? 'Wszystkie'
                      : type === 'snack'
                        ? 'Przekąska'
                        : MEAL_TYPE_LABELS[type]}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
