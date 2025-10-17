/**
 * Komponent wyboru sortowania przepisów
 *
 * Select dropdown dla sortowania według różnych kryteriów.
 */

'use client'

import { ArrowDownUp } from 'lucide-react'
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
  { value: 'name', label: 'Nazwa' },
  { value: 'calories', label: 'Kalorie' },
  { value: 'protein', label: 'Białko' },
  { value: 'carbs', label: 'Węglowodany' },
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
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='group flex h-10 w-[200px] items-center gap-2 rounded-md border-0 bg-slate-100 px-3 py-0 text-sm font-semibold text-slate-600 shadow-none focus:ring-0 data-[state=open]:ring-0'>
        <ArrowDownUp className='h-4 w-4 text-slate-500 transition-transform group-data-[state=open]:rotate-180' />
        <span className='ml-auto flex w-full items-center justify-center rounded-md bg-white px-4 py-1 text-sm font-semibold text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]'>
          <SelectValue placeholder='Wybierz' className='w-full text-center' />
        </span>
      </SelectTrigger>
      <SelectContent
        className='rounded-md border border-slate-200 bg-white p-1 shadow-[0_14px_36px_rgba(15,23,42,0.12)]'
        position='popper'
        side='bottom'
        align='start'
        sideOffset={8}
      >
        {sortOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            textValue={option.label}
            className='cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-slate-600 focus:bg-lime-100 focus:text-slate-900 data-[state=checked]:bg-lime-200 data-[state=checked]:text-slate-900'
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
