/**
 * Komponent wyboru sortowania przepisów
 *
 * Select dropdown dla sortowania według różnych kryteriów.
 */

'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type SortOption = 'calories' | 'protein' | 'carbs' | 'name'

interface SortSelectProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'calories', label: 'Kalorie' },
  { value: 'protein', label: 'Białko' },
  { value: 'carbs', label: 'Węglowodany' },
  { value: 'name', label: 'Nazwa' },
]

/**
 * Komponent wyboru sortowania przepisów
 *
 * @example
 * ```tsx
 * <SortSelect
 *   value={sortBy}
 *   onChange={(value) => setSortBy(value)}
 * />
 * ```
 */
export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className='flex items-center gap-2'>
      <span className='text-muted-foreground text-sm'>Sort by:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Wybierz sortowanie' />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
