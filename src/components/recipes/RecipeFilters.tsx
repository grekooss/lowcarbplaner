/**
 * Komponent filtrów przepisów
 *
 * Toggle buttons dla meal_types (śniadanie, obiad, kolacja).
 * Multi-select - użytkownik może wybrać wiele typów jednocześnie.
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { Enums } from '@/types/database.types'

interface RecipeFiltersProps {
  selectedMealTypes: string[]
  onChange: (mealTypes: string[]) => void
}

// Dozwolone meal types (zgodne z enum)
const MEAL_TYPES: Enums<'meal_type_enum'>[] = ['breakfast', 'lunch', 'dinner']

/**
 * Komponent interaktywny filtrów przepisów
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState<string[]>([])
 *
 * <RecipeFilters
 *   selectedMealTypes={selected}
 *   onChange={(types) => setSelected(types)}
 * />
 * ```
 */
export function RecipeFilters({
  selectedMealTypes,
  onChange,
}: RecipeFiltersProps) {
  const toggleMealType = (type: string) => {
    if (selectedMealTypes.includes(type)) {
      // Remove from selection
      onChange(selectedMealTypes.filter((t) => t !== type))
    } else {
      // Add to selection
      onChange([...selectedMealTypes, type])
    }
  }

  const hasFilters = selectedMealTypes.length > 0

  return (
    <div className='space-y-3' role='group' aria-label='Filtruj przepisy'>
      {/* Label */}
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium'>Filtruj według typu posiłku:</p>
        {hasFilters && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onChange([])}
            className='h-8 text-xs'
          >
            Wyczyść
          </Button>
        )}
      </div>

      {/* Toggle buttons */}
      <div className='flex flex-wrap gap-2'>
        {MEAL_TYPES.map((type) => {
          const isSelected = selectedMealTypes.includes(type)
          return (
            <Badge
              key={type}
              variant={isSelected ? 'default' : 'outline'}
              className='hover:bg-primary/90 cursor-pointer px-4 py-2 text-sm transition-colors select-none'
              onClick={() => toggleMealType(type)}
              role='checkbox'
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleMealType(type)
                }
              }}
            >
              {MEAL_TYPE_LABELS[type]}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
