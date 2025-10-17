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
    <div className='bg-primary flex items-center gap-1 rounded-md p-1'>
      <Button
        variant='ghost'
        size='icon-sm'
        onClick={() => onChange('grid')}
        aria-label='Widok siatki'
        className={`rounded-md transition-colors ${
          mode === 'grid'
            ? 'bg-slate-100 text-gray-900 shadow-sm'
            : 'hover:bg-primary/80 text-gray-700 hover:text-gray-900'
        }`}
      >
        <Grid3x3 className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        size='icon-sm'
        onClick={() => onChange('list')}
        aria-label='Widok listy'
        className={`rounded-md transition-colors ${
          mode === 'list'
            ? 'bg-slate-100 text-gray-900 shadow-sm'
            : 'hover:bg-primary/80 text-gray-700 hover:text-gray-900'
        }`}
      >
        <List className='h-4 w-4' />
      </Button>
    </div>
  )
}
