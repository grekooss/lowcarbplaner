/**
 * Komponent przełączania między widokiem siatki i listy
 *
 * Toggle buttons dla Grid/List view.
 */

'use client'

import { Grid3x3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

/**
 * Komponent przełączania widoku przepisów
 *
 * @example
 * ```tsx
 * <ViewToggle
 *   mode={viewMode}
 *   onChange={(mode) => setViewMode(mode)}
 * />
 * ```
 */
export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className='flex h-[38px] items-center gap-1 rounded-sm border border-white bg-white px-1.5'>
      <Button
        variant='ghost'
        size='icon-sm'
        onClick={() => onChange('grid')}
        aria-label='Widok siatki'
        className={`h-7 w-7 rounded-sm transition-all ${
          mode === 'grid'
            ? 'bg-red-600 text-white shadow-sm shadow-red-500/20 hover:bg-red-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }`}
      >
        <Grid3x3 className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        size='icon-sm'
        onClick={() => onChange('list')}
        aria-label='Widok listy'
        className={`h-7 w-7 rounded-sm transition-all ${
          mode === 'list'
            ? 'bg-red-600 text-white shadow-sm shadow-red-500/20 hover:bg-red-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }`}
      >
        <List className='h-4 w-4' />
      </Button>
    </div>
  )
}
