/**
 * Komponent wyboru sortowania przepisów
 *
 * Select dropdown dla sortowania według różnych kryteriów z możliwością
 * zmiany kierunku sortowania przez kliknięcie ikony strzałek.
 */

'use client'

import { ArrowUp, ArrowDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type SortOption = 'calories' | 'protein' | 'carbs' | 'fats' | 'name'
export type SortDirection = 'asc' | 'desc'

interface SortSelectProps {
  value: SortOption
  direction: SortDirection
  onChange: (value: SortOption) => void
  onDirectionChange: (direction: SortDirection) => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Nazwa' },
  { value: 'calories', label: 'Kalorie' },
  { value: 'carbs', label: 'Węglowodany' },
  { value: 'protein', label: 'Białko' },
  { value: 'fats', label: 'Tłuszcze' },
]

/**
 * Komponent wyboru sortowania przepisów
 *
 * @example
 * ```tsx
 * <SortSelect
 *   value={sortBy}
 *   direction={sortDirection}
 *   onChange={(value) => setSortBy(value)}
 *   onDirectionChange={(dir) => setSortDirection(dir)}
 * />
 * ```
 */
export function SortSelect({
  value,
  direction,
  onChange,
  onDirectionChange,
}: SortSelectProps) {
  const toggleDirection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDirectionChange(direction === 'asc' ? 'desc' : 'asc')
  }

  const DirectionIcon = direction === 'asc' ? ArrowUp : ArrowDown

  return (
    <div className='flex items-center'>
      <div className='flex h-[38px] items-center rounded-sm rounded-r-none border border-r-0 border-white bg-white px-1.5'>
        <button
          type='button'
          onClick={toggleDirection}
          className='flex h-7 w-7 items-center justify-center rounded-sm bg-red-600 text-white shadow-sm shadow-red-500/20 transition-colors hover:bg-red-700'
          title={direction === 'asc' ? 'Rosnąco' : 'Malejąco'}
        >
          <DirectionIcon className='h-4 w-4' />
        </button>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className='group flex h-auto w-[180px] items-center gap-2 rounded-sm rounded-l-none border border-l-0 border-white bg-white px-4 py-2 text-sm font-bold tracking-wider text-gray-800 uppercase shadow-none focus:ring-0 data-[state=open]:ring-0'>
          <SelectValue placeholder='Sortuj' className='text-center' />
        </SelectTrigger>
        <SelectContent
          className='rounded-sm border border-white bg-white p-1.5 shadow-[0_4px_20px_rgb(0,0,0,0.08)]'
          position='popper'
          side='bottom'
          align='start'
          sideOffset={4}
        >
          {sortOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              textValue={option.label}
              className='cursor-pointer rounded-sm px-4 py-2 text-sm font-bold tracking-wider text-gray-600 uppercase focus:bg-red-50 focus:text-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white'
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
